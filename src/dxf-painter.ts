import * as THREE from 'three';
import { getBulgeCurvePoints, bSpline } from './utils';
import { Text } from 'troika-three-text';
import { parseDxfMTextContent, DxfMTextContentElement } from '@dxfom/mtext';
import {
  IDxf,
  IEntity,
  ITextEntity,
  IMtextEntity,
  IEllipseEntity,
  ISolidEntity,
  ILineEntity,
  ILwpolylineEntity,
  IPolylineEntity,
  ICircleEntity,
  IArcEntity,
  IPointEntity,
  IInsertEntity,
  IDimensionEntity,
  ISplineEntity,
  IPoint,
} from 'dxf-parser';

interface IMtextStruct {
  text: string;
  style: {
    horizontalAlignment: string;
    textHeight: number;
  };
}

export function isTEXT(entity: IEntity): entity is ITextEntity {
  return entity.type === 'TEXT';
}
export function isSOLID(entity: IEntity): entity is ISolidEntity {
  return entity.type === 'SOLID';
}
export function isMTEXT(entity: IEntity): entity is IMtextEntity {
  return entity.type === 'MTEXT';
}
export function isELLIPSE(entity: IEntity): entity is IEllipseEntity {
  return entity.type === 'ELLIPSE';
}

export type ILINE = ILineEntity | ILwpolylineEntity | IPolylineEntity;

export function isPOLYLINE(
  entity: IEntity
): entity is IPolylineEntity | ILwpolylineEntity {
  return entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE';
}

export function isLINE(entity: IEntity): entity is ILINE {
  return (
    entity.type === 'LWPOLYLINE' ||
    entity.type === 'LINE' ||
    entity.type === 'POLYLINE'
  );
}

export type IARC = ICircleEntity | IArcEntity;

export function isARC(entity: IEntity): entity is ICircleEntity | IArcEntity {
  return entity.type === 'ARC' || entity.type === 'CIRCLE';
}

export function isPOINT(entity: IEntity): entity is IPointEntity {
  return entity.type === 'POINT';
}

export function isINSERT(entity: IEntity): entity is IInsertEntity {
  return entity.type === 'INSERT';
}

export function isDIMENSION(entity: IEntity): entity is IDimensionEntity {
  return entity.type === 'DIMENSION';
}

export function isSPLINE(entity: IEntity): entity is ISplineEntity {
  return entity.type === 'SPLINE';
}

export class DXFPainter {
  font: THREE.Font;
  constructor(font: THREE.Font) {
    this.font = font;
  }
  draw(entity: IEntity, data: IDxf) {
    this.createLineTypeShaders(data);
    return this.drawEntity(entity, data);
  }

  private drawEntity(
    entity: IEntity,
    data: IDxf
  ): THREE.Object3D | null | void {
    let mesh;
    if (isARC(entity)) {
      mesh = this.drawArc(entity, data);
    } else if (isLINE(entity)) {
      mesh = this.drawLine(entity, data);
    } else if (isTEXT(entity)) {
      if (!entity.text.startsWith('# ')) return;
      mesh = this.drawText(entity, data);
    } else if (isSOLID(entity)) {
      mesh = this.drawSolid(entity, data);
    } else if (isPOINT(entity)) {
      mesh = this.drawPoint(entity, data);
    } else if (isINSERT(entity)) {
      mesh = this.drawBlock(entity, data);
    } else if (isSPLINE(entity)) {
      mesh = this.drawSpline(entity, data);
    } else if (isMTEXT(entity)) {
      mesh = this.drawMtext(entity, data);
    } else if (isELLIPSE(entity)) {
      mesh = this.drawEllipse(entity, data);
    } else if (isDIMENSION(entity)) {
      const dimTypeEnum = entity.dimensionType & 7;
      if (dimTypeEnum === 0) {
        mesh = this.drawDimension(entity, data);
      } else {
        console.log('Unsupported Dimension type: ' + dimTypeEnum);
      }
    } else {
      console.log('Unsupported Entity Type: ' + entity.type);
    }
    return mesh;
  }

  private drawEllipse(entity: IEllipseEntity, data: IDxf) {
    const color = this.getColor(entity, data);

    const xrad = Math.sqrt(
      Math.pow(entity.majorAxisEndPoint.x, 2) +
        Math.pow(entity.majorAxisEndPoint.y, 2)
    );
    const yrad = xrad * entity.axisRatio;
    const rotation = Math.atan2(
      entity.majorAxisEndPoint.y,
      entity.majorAxisEndPoint.x
    );

    const curve = new THREE.EllipseCurve(
      entity.center.x,
      entity.center.y,
      xrad,
      yrad,
      entity.startAngle,
      entity.endAngle,
      false, // Always counterclockwise
      rotation
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      linewidth: 1,
      color: color,
    });

    // Create the final object to add to the scene
    const ellipse = new THREE.Line(geometry, material);
    return ellipse;
  }

  private drawMtext(entity: IMtextEntity, data: IDxf) {
    const color = this.getColor(entity, data);

    if (!this.font) {
      return console.log('font parameter not set. Ignoring text entity.');
    }

    const textAndControlChars = parseDxfMTextContent(entity.text);

    //Note: We currently only support a single format applied to all the mtext text
    const content = this.mtextContentAndFormattingToTextAndStyle(
      textAndControlChars,
      entity,
      color
    );

    const txt = this.createTextForScene(
      content.text,
      content.style,
      entity,
      color
    );
    if (!txt) return null;

    const group = new THREE.Object3D();
    group.add(txt);
    return group;
  }

  private mtextContentAndFormattingToTextAndStyle(
    textAndControlChars: DxfMTextContentElement[],
    entity: IMtextEntity,
    color: number
  ): IMtextStruct {
    const activeStyle = {
      horizontalAlignment: 'left',
      textHeight: entity.height,
    };

    const text = [];
    for (const item of textAndControlChars) {
      if (typeof item === 'string') {
        if (item.startsWith('pxq') && item.endsWith(';')) {
          if (item.indexOf('c') !== -1)
            activeStyle.horizontalAlignment = 'center';
          else if (item.indexOf('l') !== -1)
            activeStyle.horizontalAlignment = 'left';
          else if (item.indexOf('r') !== -1)
            activeStyle.horizontalAlignment = 'right';
          else if (item.indexOf('j') !== -1)
            activeStyle.horizontalAlignment = 'justify';
        } else {
          text.push(item);
        }
      } else if (Array.isArray(item)) {
        const nestedFormat = this.mtextContentAndFormattingToTextAndStyle(
          item,
          entity,
          color
        );
        text.push(nestedFormat.text);
      } else if (typeof item === 'object') {
        if (item['S'] && item['S'].length === 3) {
          text.push(item['S'][0] + '/' + item['S'][2]);
        } else {
          // not yet supported.
        }
      }
    }
    return {
      text: text.join(),
      style: activeStyle,
    };
  }

  private createTextForScene(
    text: IMtextStruct['text'],
    style: IMtextStruct['style'],
    entity: IMtextEntity,
    color: number
  ) {
    if (!text) return null;

    const textEnt = new Text();
    textEnt.text = text.replaceAll('\\P', '\n').replaceAll('\\X', '\n');

    textEnt.font = this.font;
    textEnt.fontSize = style.textHeight;
    textEnt.maxWidth = entity.width;
    textEnt.position.x = entity.position.x;
    textEnt.position.y = entity.position.y;
    textEnt.position.z = entity.position.z;
    textEnt.textAlign = style.horizontalAlignment;
    textEnt.color = color;
    if (entity.rotation) {
      textEnt.rotation.z = (entity.rotation * Math.PI) / 180;
    }
    if (entity.directionVector) {
      const dv = entity.directionVector;
      textEnt.rotation.z = new THREE.Vector3(1, 0, 0).angleTo(
        new THREE.Vector3(dv.x, dv.y, dv.z)
      );
    }
    switch (entity.attachmentPoint) {
      case 1:
        // Top Left
        textEnt.anchorX = 'left';
        textEnt.anchorY = 'top';
        break;
      case 2:
        // Top Center
        textEnt.anchorX = 'center';
        textEnt.anchorY = 'top';
        break;
      case 3:
        // Top Right
        textEnt.anchorX = 'right';
        textEnt.anchorY = 'top';
        break;

      case 4:
        // Middle Left
        textEnt.anchorX = 'left';
        textEnt.anchorY = 'middle';
        break;
      case 5:
        // Middle Center
        textEnt.anchorX = 'center';
        textEnt.anchorY = 'middle';
        break;
      case 6:
        // Middle Right
        textEnt.anchorX = 'right';
        textEnt.anchorY = 'middle';
        break;

      case 7:
        // Bottom Left
        textEnt.anchorX = 'left';
        textEnt.anchorY = 'bottom';
        break;
      case 8:
        // Bottom Center
        textEnt.anchorX = 'center';
        textEnt.anchorY = 'bottom';
        break;
      case 9:
        // Bottom Right
        textEnt.anchorX = 'right';
        textEnt.anchorY = 'bottom';
        break;

      default:
        return undefined;
    }

    textEnt.sync(() => {
      if (textEnt.textAlign !== 'left') {
        textEnt.geometry.computeBoundingBox();
        const textWidth =
          textEnt.geometry.boundingBox.max.x -
          textEnt.geometry.boundingBox.min.x;
        if (textEnt.textAlign === 'center')
          textEnt.position.x += (entity.width - textWidth) / 2;
        if (textEnt.textAlign === 'right')
          textEnt.position.x += entity.width - textWidth;
      }
    });

    return textEnt;
  }

  private drawSpline(entity: ISplineEntity, data: IDxf) {
    const color = this.getColor(entity, data);

    const points = this.getBSplinePolyline(
      entity.controlPoints,
      entity.degreeOfSplineCurve,
      entity.knotValues,
      100
    );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      linewidth: 1,
      color: color,
    });
    const splineObject = new THREE.Line(geometry, material);

    return splineObject;
  }
  /**
   * Interpolate a b-spline. The algorithm examins the knot vector
   * to create segments for interpolation. The parameterisation value
   * is re-normalised back to [0,1] as that is what the lib expects (
   * and t i de-normalised in the b-spline library)
   *
   * @param controlPoints the control points
   * @param degree the b-spline degree
   * @param knots the knot vector
   * @returns the polyline
   */
  private getBSplinePolyline(
    controlPoints: IPoint[] | undefined,
    degree: number,
    knots: number[],
    interpolationsPerSplineSegment: number,
    weights?: number[]
  ) {
    const polyline = [];
    let controlPointsForLib: number[][] = [];
    if (controlPoints) {
      controlPointsForLib = controlPoints.map(function (p: IPoint) {
        return [p.x, p.y];
      });
    }

    const segmentTs = [knots[degree]];
    const domain = [knots[degree], knots[knots.length - 1 - degree]];

    for (let k = degree + 1; k < knots.length - degree; ++k) {
      if (segmentTs[segmentTs.length - 1] !== knots[k]) {
        segmentTs.push(knots[k]);
      }
    }

    interpolationsPerSplineSegment = interpolationsPerSplineSegment || 25;
    for (let i = 1; i < segmentTs.length; ++i) {
      const uMin = segmentTs[i - 1];
      const uMax = segmentTs[i];
      for (let k = 0; k <= interpolationsPerSplineSegment; ++k) {
        const u = (k / interpolationsPerSplineSegment) * (uMax - uMin) + uMin;
        // Clamp t to 0, 1 to handle numerical precision issues
        let t = (u - domain[0]) / (domain[1] - domain[0]);
        t = Math.max(t, 0);
        t = Math.min(t, 1);
        const p = bSpline(t, degree, controlPointsForLib, knots, weights);
        polyline.push(new THREE.Vector2(p[0], p[1]));
      }
    }
    return polyline;
  }

  private drawLine(entity: ILINE, data: IDxf) {
    const points = [];
    const color = this.getColor(entity, data);
    let material, lineType;

    if (!entity.vertices) return console.log('entity missing vertices.');

    // create geometry
    for (let i = 0; i < entity.vertices.length; i++) {
      if (isPOLYLINE(entity) && entity.vertices[i].bulge) {
        const bulge = entity.vertices[i].bulge;
        const startPoint = entity.vertices[i];
        const endPoint =
          i + 1 < entity.vertices.length ? entity.vertices[i + 1] : points[0];

        const bulgePoints = getBulgeCurvePoints(startPoint, endPoint, bulge);

        points.push(...bulgePoints);
      } else {
        const vertex = entity.vertices[i];
        points.push(new THREE.Vector3(vertex.x, vertex.y, 0));
      }
    }
    if (isPOLYLINE(entity) && entity.shape) points.push(points[0]);

    // set material
    if (entity.lineType) {
      lineType = data.tables.lineType.lineTypes[entity.lineType];
    }

    if (lineType && lineType.pattern && lineType.pattern.length !== 0) {
      material = new THREE.LineDashedMaterial({
        color: color,
        gapSize: 4,
        dashSize: 4,
      });
    } else {
      material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    return line;
  }

  private drawArc(entity: IARC, data: IDxf) {
    let startAngle, endAngle;
    if (entity.type === 'CIRCLE') {
      startAngle = entity.startAngle || 0;
      endAngle = startAngle + 2 * Math.PI;
    } else {
      startAngle = entity.startAngle;
      endAngle = entity.endAngle;
    }

    const curve = new THREE.ArcCurve(
      0,
      0,
      entity.radius,
      startAngle,
      endAngle,
      false
    );

    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: this.getColor(entity, data),
    });

    const arc = new THREE.Line(geometry, material);
    arc.position.x = entity.center.x;
    arc.position.y = entity.center.y;
    arc.position.z = entity.center.z;

    return arc;
  }

  private addTriangleFacingCamera(
    verts: Array<THREE.Vector3>,
    p0: IPoint,
    p1: IPoint,
    p2: IPoint
  ) {
    // Calculate which direction the points are facing (clockwise or counter-clockwise)
    const vector1 = new THREE.Vector3();
    const vector2 = new THREE.Vector3();
    const v0 = new THREE.Vector3(p0.x, p0.y, p0.z);
    const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
    const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);

    vector1.subVectors(v1, v0);
    vector2.subVectors(v2, v0);
    vector1.cross(vector2);

    // If z < 0 then we must draw these in reverse order
    if (vector1.z < 0) {
      verts.push(v2, v1, v0);
    } else {
      verts.push(v0, v1, v2);
    }
  }

  private drawSolid(entity: ISolidEntity, data: IDxf) {
    const points = entity.points;
    // verts = geometry.vertices;
    const verts: Array<THREE.Vector3> = [];
    this.addTriangleFacingCamera(verts, points[0], points[1], points[2]);
    this.addTriangleFacingCamera(verts, points[1], points[2], points[3]);

    const material = new THREE.MeshBasicMaterial({
      color: this.getColor(entity, data),
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(verts);

    return new THREE.Mesh(geometry, material);
  }

  private drawText(entity: ITextEntity, data: IDxf) {
    if (!this.font) {
      return console.warn(
        'Text is not supported without a Three.js font loaded with THREE.FontLoader! Load a font of your choice and pass this into the constructor. See the sample for this repository or Three.js examples at http://threejs.org/examples/?q=text#webgl_geometry_text for more details.'
      );
    }

    const geometry = new THREE.TextGeometry(entity.text, {
      font: this.font,
      height: 0,
      size: entity.textHeight || 12,
    });

    if (entity.rotation) {
      const zRotation = (entity.rotation * Math.PI) / 180;
      geometry.rotateZ(zRotation);
    }

    const material = new THREE.MeshBasicMaterial({
      color: this.getColor(entity, data),
    });

    const text = new THREE.Mesh(geometry, material);
    text.position.x = entity.startPoint.x;
    text.position.y = entity.startPoint.y;
    text.position.z = entity.startPoint.z ?? 0;

    return text;
  }

  // Draw a point like a big circle
  private drawPoint(entity: IPointEntity, data: IDxf) {
    const color = this.getColor(entity, data);
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [entity.position.x, entity.position.y, entity.position.z],
        3
      )
    );

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: new THREE.Color(color),
    });
    const point = new THREE.Points(geometry, material);

    return point;
  }

  private drawDimension(entity: IDimensionEntity, data: IDxf) {
    const block = data.blocks[entity.block];

    if (!block || !block.entities) return null;

    const group = new THREE.Group();
    // if(entity.anchorPoint) {
    //     group.position.x = entity.anchorPoint.x;
    //     group.position.y = entity.anchorPoint.y;
    //     group.position.z = entity.anchorPoint.z;
    // }

    for (let i = 0; i < block.entities.length; i++) {
      const childEntity = this.drawEntity(block.entities[i], data);
      if (childEntity) group.add(childEntity);
    }

    return group;
  }

  private drawBlock(entity: IInsertEntity, data: IDxf) {
    const block = data.blocks[entity.name];

    if (!block.entities) return null;

    const group = new THREE.Group();

    if (entity.xScale) group.scale.x = entity.xScale;
    if (entity.yScale) group.scale.y = entity.yScale;

    if (entity.rotation) {
      group.rotation.z = (entity.rotation * Math.PI) / 180;
    }

    if (entity.position) {
      group.position.x = entity.position.x;
      group.position.y = entity.position.y;
      group.position.z = entity.position.z ?? 0;
    }

    for (let i = 0; i < block.entities.length; i++) {
      const childEntity = this.drawEntity(block.entities[i], data);
      if (childEntity) group.add(childEntity);
    }

    return group;
  }

  private getColor<T extends IEntity>(entity: T, data: IDxf) {
    let color = 0x000000; //default
    if (entity.color) color = entity.color;
    else if (
      data.tables &&
      data.tables.layer &&
      data.tables.layer.layers[entity.layer]
    )
      color = data.tables.layer.layers[entity.layer].color;

    if (color == null || color === 0xffffff) {
      color = 0x000000;
    }
    return color;
  }

  private createLineTypeShaders(data: any) {
    if (!data.tables || !data.tables.lineType) return;
    const ltypes = data.tables.lineType.lineTypes;

    for (const type in ltypes) {
      const ltype = ltypes[type];
      if (!ltype.pattern) continue;
      ltype.material = this.createDashedLineShader(ltype.pattern);
    }
  }

  private createDashedLineShader(pattern: any) {
    let totalLength = 0.0;

    for (let i = 0; i < pattern.length; i++) {
      totalLength += Math.abs(pattern[i]);
    }
    const dashedLineShader: THREE.Shader = {
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['common'],
        THREE.UniformsLib['fog'],

        {
          pattern: { type: 'fv1', value: pattern },
          patternLength: { type: 'f', value: totalLength },
        },
      ]),
      vertexShader: [
        'attribute float lineDistance;',

        'varying float vLineDistance;',

        THREE.ShaderChunk['color_pars_vertex'],

        'void main() {',

        THREE.ShaderChunk['color_vertex'],

        'vLineDistance = lineDistance;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 diffuse;',
        'uniform float opacity;',

        'uniform float pattern[' + pattern.length + '];',
        'uniform float patternLength;',

        'varying float vLineDistance;',

        THREE.ShaderChunk['color_pars_fragment'],
        THREE.ShaderChunk['fog_pars_fragment'],

        'void main() {',

        'float pos = mod(vLineDistance, patternLength);',

        'for ( int i = 0; i < ' + pattern.length + '; i++ ) {',
        'pos = pos - abs(pattern[i]);',
        'if( pos < 0.0 ) {',
        'if( pattern[i] > 0.0 ) {',
        'gl_FragColor = vec4(1.0, 0.0, 0.0, opacity );',
        'break;',
        '}',
        'discard;',
        '}',

        '}',

        THREE.ShaderChunk['color_fragment'],
        THREE.ShaderChunk['fog_fragment'],

        '}',
      ].join('\n'),
    };
    return dashedLineShader;
  }
}
