import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DXFPainter } from './dxf-painter';
import { IDxf } from 'dxf-parser';
// Font and FontLoader must be introduced after version 133
// https://github.com/mrdoob/three.js/pull/22560
// import { Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader'

/**
 *
 *
 * @export
 * @class Viewer
 */
export class Viewer {
  renderer: THREE.WebGLRenderer;
  INTERSECTED: any;
  intersects: any;
  camera: THREE.OrthographicCamera;
  controls: OrbitControls;
  parent: HTMLElement;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  width: number;
  height: number;
  scene: THREE.Scene;
  painter: DXFPainter;

  /**
   * Creates an instance of Viewer.
   * @param {IDxf} data
   * @param {HTMLElement} parent
   * @param {THREE.Font} font
   * @param {Array<any>} tags
   * @memberof Viewer
   * @constructor
   */
  constructor(
    data: IDxf,
    parent: HTMLElement,
    height: number,
    width: number,
    font: THREE.Font
  ) {
    // create DXF painter
    this.painter = new DXFPainter(font);
    this.scene = new THREE.Scene();

    const dims = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    };

    for (let i = 0; i < data.entities.length; i++) {
      const entity = data.entities[i];
      let obj = this.painter.draw(entity, data);

      if (obj) {
        const bbox = new THREE.Box3().setFromObject(obj);
        if (isFinite(bbox.min.x) && dims.min.x > bbox.min.x)
          dims.min.x = bbox.min.x;
        if (isFinite(bbox.min.y) && dims.min.y > bbox.min.y)
          dims.min.y = bbox.min.y;
        if (isFinite(bbox.min.z) && dims.min.z > bbox.min.z)
          dims.min.z = bbox.min.z;
        if (isFinite(bbox.max.x) && dims.max.x < bbox.max.x)
          dims.max.x = bbox.max.x;
        if (isFinite(bbox.max.y) && dims.max.y < bbox.max.y)
          dims.max.y = bbox.max.y;
        if (isFinite(bbox.max.z) && dims.max.z < bbox.max.z)
          dims.max.z = bbox.max.z;
        this.scene.add(obj);
      }
      obj = null;
    }
    this.parent = parent;
    this.width = width || parent.clientWidth;
    this.height = height || parent.clientHeight;

    const aspectRatio = this.width / this.height;

    const upperRightCorner = { x: dims.max.x, y: dims.max.y };
    const lowerLeftCorner = { x: dims.min.x, y: dims.min.y };

    // Figure out the current viewport extents
    let vp_width = upperRightCorner.x - lowerLeftCorner.x;
    let vp_height = upperRightCorner.y - lowerLeftCorner.y;
    const center = {
      x: vp_width / 2 + lowerLeftCorner.x,
      y: vp_height / 2 + lowerLeftCorner.y,
    };

    // Fit all objects into current ThreeDXF viewer
    const extentsAspectRatio = Math.abs(vp_width / vp_height);
    if (aspectRatio > extentsAspectRatio) {
      vp_width = vp_height * aspectRatio;
    } else {
      vp_height = vp_width / aspectRatio;
    }

    const viewPort = {
      bottom: -vp_height / 2,
      left: -vp_width / 2,
      top: vp_height / 2,
      right: vp_width / 2,
      center: {
        x: center.x,
        y: center.y,
      },
    };

    this.camera = new THREE.OrthographicCamera(
      viewPort.left,
      viewPort.right,
      viewPort.top,
      viewPort.bottom,
      1,
      19
    );
    this.camera.position.z = 10;
    this.camera.position.x = viewPort.center.x;
    this.camera.position.y = viewPort.center.y;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xfffffff, 1);

    parent.appendChild(this.renderer.domElement);
    parent.style.display = 'block';

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.controls = new OrbitControls(this.camera, parent);
    this.controls.target.x = this.camera.position.x;
    this.controls.target.y = this.camera.position.y;
    this.controls.target.z = 0;
    this.controls.zoomSpeed = 3;

    //Uncomment this to disable rotation (does not make much sense with 2D drawings).
    // this.controls.enableRotate = false;

    parent.children[0].addEventListener('pointermove', (e: PointerEvent) => {
      this.onPointerMove(e);
    });
    parent.children[0].addEventListener('pointerdown', () => {
      this.onCanvasClick();
    });
    window.addEventListener('resize', () => {
      this.resize;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
      this.controls.update();
    };
    animate();
  }

  // Unused function
  // public findExtents(scene: THREE.Scene) {
  //   for (let child of scene.children) {
  //     let minX, maxX, minY, maxY;
  //     if (child.position) {
  //       minX = Math.min(child.position.x, minX);
  //       minY = Math.min(child.position.y, minY);
  //       maxX = Math.max(child.position.x, maxX);
  //       maxY = Math.max(child.position.y, maxY);
  //     }
  //   }

  //   return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
  // }
  // Show/Hide helpers from https://plainjs.com/javascript/effects/hide-or-show-an-element-42/
  // get the default display style of an element
  private defaultDisplay(tag: string) {
    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('width', '0');
    iframe.setAttribute('height', '0');
    document.documentElement.appendChild(iframe);
    iframe.contentDocument;
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    let display = null;
    if (doc) {
      // IE support
      doc.write();
      doc.close();

      const testEl = doc.createElement(tag);
      doc.documentElement.appendChild(testEl);
      display = window.getComputedStyle(testEl, null).display;
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }

    return display;
  }

  // actual show/hide function used by show() and hide() below
  private showHide(el: HTMLElement, show: boolean) {
    let value = el.getAttribute('data-olddisplay');
    const display = el.style.display;
    const computedDisplay = window.getComputedStyle(el, null).display;

    if (show) {
      if (!value && display === 'none') el.style.display = '';
      if (el.style.display === '' && computedDisplay === 'none')
        value = value || this.defaultDisplay(el.nodeName);
    } else {
      if ((display && display !== 'none') || !(computedDisplay == 'none'))
        el.setAttribute(
          'data-olddisplay',
          computedDisplay == 'none' ? display : computedDisplay
        );
    }
    if (!show || el.style.display === 'none' || el.style.display === '')
      el.style.display = show ? value || '' : 'none';
  }

  // helper functions
  public show(el: HTMLElement) {
    this.showHide(el, true);
  }
  public hide(el: HTMLElement) {
    this.showHide(el, false);
  }

  private onCanvasClick() {
    const arr = [];
    for (let i = 0; i < this.intersects.length; i++) {
      const intersect = this.intersects[i].object;
      arr.push(intersect);
    }
    console.log(arr);
  }

  private onPointerMove(event: PointerEvent) {
    this.pointer.x = (event.offsetX / this.width) * 2 - 1;
    this.pointer.y = -(event.offsetY / this.height) * 2 + 1;
  }

  private resize() {
    const hscale = this.parent.clientWidth / this.width;
    const vscale = this.parent.clientHeight / this.height;

    this.camera.top = vscale * this.camera.top;
    this.camera.bottom = vscale * this.camera.bottom;
    this.camera.left = hscale * this.camera.left;
    this.camera.right = hscale * this.camera.right;

    this.camera.updateProjectionMatrix();
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.width = this.parent.clientWidth;
    this.height = this.parent.clientHeight;
    this.renderer.setSize(this.parent.clientWidth, this.parent.clientHeight);
    return;
  }

  private render() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    // calculate objects intersecting the picking ray
    this.intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (this.intersects.length > 0) {
      this.parent.style.cursor = 'pointer';
      if (this.INTERSECTED != this.intersects[0].object) {
        if (this.INTERSECTED)
          this.INTERSECTED.material.color.set(this.INTERSECTED.currentHex);

        this.INTERSECTED = this.intersects[0].object;
        this.INTERSECTED.currentHex = this.INTERSECTED.material.color;
        this.INTERSECTED.material.color = new THREE.Color(0xff0000);
      }
    } else {
      if (this.INTERSECTED)
        this.INTERSECTED.material.color.set(this.INTERSECTED.currentHex);
      this.parent.style.cursor = 'auto';
      this.INTERSECTED = null;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
