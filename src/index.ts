import * as THREE from 'three';
import { BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import DxfTextLoader from './TextLoader.js';
import { getColor, getBulgeCurvePoints, bSpline } from './utils.js';
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
    IPoint
} from 'dxf-parser';

type Extents = {
    min: THREE.Vec2;
    max: THREE.Vec2;
}

// /**
//  * Viewer class for a dxf object.
//  * @param {Object} data - the dxf object
//  * @param {Object} parent - the parent element to which we attach the rendering canvas
//  * @param {Number} width - width of the rendering canvas in pixels
//  * @param {Number} height - height of the rendering canvas in pixels
//  * @constructor
//  */
// export function Viewer(
//     data: IDxf,
//     parent: HTMLElement,
//     width: number,
//     height: number,
//     font?: string
// ) {

//     var scene = new THREE.Scene();

//     let drawingObjects = new DxfLoader(data, font);
//     for (let obj of drawingObjects) scene.add(obj)

//     width = width || parent.clientWidth;
//     height = height || parent.clientHeight;

//     let extents = getExtents(drawingObjects);
//     var camera = new THREE.OrthographicCamera();
//     var aspectRatio = width / height;
//     zoomExtents(extents, camera, aspectRatio);

//     var renderer = this.renderer = new THREE.WebGLRenderer();
//     renderer.setSize(width, height);
//     renderer.setClearColor(0xfffffff, 1);
//     this.render = function () { renderer.render(scene, camera) };

//     parent.appendChild(renderer.domElement);

//     useOrbitControls(camera, render.domElement, this.render);
// }

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

export type ILine = ILineEntity | ILwpolylineEntity | IPolylineEntity;

export function isPOLYLINE(
    entity: IEntity
): entity is IPolylineEntity | ILwpolylineEntity {
    return entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE';
}

export function isLINE(entity: IEntity): entity is ILine {
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


export class DxfLoader {

    constructor(fontUrl: string) {
        this.textLoader = new DxfTextLoader(fontUrl);
    }

    textLoader: DxfTextLoader;

    load(parsedDxfData: IDxf, onLoad: (drawingObjects: THREE.Object3D[]) => void) {
        let drawingObjects: THREE.Object3D[] = [];

        for (let entity of parsedDxfData.entities) {
            let obj = this.drawEntity(entity, parsedDxfData);
            if (obj) drawingObjects.push(obj);
        }

        this.textLoader.waitForTextToBeReady().then(() => {
            onLoad(drawingObjects);
        });
    }

    drawEntity(entity: IEntity, data: IDxf): THREE.Object3D | undefined {
        var obj;
        if (isARC(entity)) {
            obj = this.drawArc(entity, data);
        } else if (isLINE(entity)) {
            obj = this.drawLine(entity, data);
        } else if (isTEXT(entity)) {
            if (!entity.text.startsWith('# ')) return;
            obj = this.textLoader.drawText(entity, data);
        } else if (isSOLID(entity)) {
            obj = this.drawSolid(entity, data);
        } else if (isPOINT(entity)) {
            obj = this.drawPoint(entity, data);
        } else if (isINSERT(entity)) {
            obj = this.drawBlock(entity, data);
        } else if (isSPLINE(entity)) {
            obj = this.drawSpline(entity, data);
        } else if (isMTEXT(entity)) {
            obj = this.textLoader.drawMtext(entity, data);
        } else if (isELLIPSE(entity)) {
            obj = this.drawEllipse(entity, data);
        } else if (isDIMENSION(entity)) {
            var dimTypeEnum = entity.dimensionType & 7;
            if (dimTypeEnum === 0) {
                obj = this.drawDimension(entity, data);
            } else {
                console.log("Unsupported Dimension type: " + dimTypeEnum);
            }
        }
        else {
            console.log("Unsupported Entity Type: " + entity.type);
        }
        return obj;
    }


    drawEllipse(entity: IEllipseEntity, data: IDxf): THREE.Object3D | undefined {
        var color = getColor(entity, data);

        var xrad = Math.sqrt(Math.pow(entity.majorAxisEndPoint.x, 2) + Math.pow(entity.majorAxisEndPoint.y, 2));
        var yrad = xrad * entity.axisRatio;
        var rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

        var curve = new THREE.EllipseCurve(
            entity.center.x, entity.center.y,
            xrad, yrad,
            entity.startAngle, entity.endAngle,
            false, // Always counterclockwise
            rotation
        );

        var points = curve.getPoints(50);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });

        // Create the final object to add to the scene
        var ellipse = new THREE.Line(geometry, material);
        return ellipse;
    }

    drawSpline(entity: ISplineEntity, data: IDxf): THREE.Object3D | undefined {
        var color = getColor(entity, data);

        if (!entity.controlPoints) {
            console.log('entity missing control points.');
            return;
        }

        var points = getBSplinePolyline(entity.controlPoints, entity.degreeOfSplineCurve, entity.knotValues, 100);

        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
        var splineObject = new THREE.Line(geometry, material);

        return splineObject;
    }

    drawLine(entity: ILine, data: IDxf): THREE.Line | undefined {
        const points = [];
        const color = getColor(entity, data);
        let material, lineType;

        if (!entity.vertices) {
            console.log('entity missing vertices.');
            return;
        }

        // create geometry
        for (let i = 0; i < entity.vertices.length; i++) {

            if (isPOLYLINE(entity) && entity.vertices[i].bulge) {
                const bulge = entity.vertices[i].bulge;
                const startPoint = entity.vertices[i];
                const endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : points[0];

                const bulgePoints = getBulgeCurvePoints(startPoint, endPoint, bulge);

                points.push.apply(points, bulgePoints);
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
            material = new THREE.LineDashedMaterial({ color: color, gapSize: 4, dashSize: 4 });
        } else {
            material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
        }

        var geometry = new BufferGeometry().setFromPoints(points);

        return new THREE.Line(geometry, material);
    }

    drawArc(entity: ICircleEntity | IArcEntity, data: IDxf): THREE.Object3D {
        var startAngle, endAngle;
        if (entity.type === 'CIRCLE') {
            startAngle = entity.startAngle || 0;
            endAngle = startAngle + 2 * Math.PI;
        } else {
            startAngle = entity.startAngle;
            endAngle = entity.endAngle;
        }

        var curve = new THREE.ArcCurve(
            0, 0,
            entity.radius,
            startAngle,
            endAngle);

        var points = curve.getPoints(32);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);

        var material = new THREE.LineBasicMaterial({ color: getColor(entity, data) });

        var arc = new THREE.Line(geometry, material);
        arc.position.x = entity.center.x;
        arc.position.y = entity.center.y;
        arc.position.z = entity.center.z;

        return arc;
    }

    drawSolid(entity: ISolidEntity, data: IDxf): THREE.Object3D {
        const points = entity.points;
        // verts = geometry.vertices;
        const verts: Array<THREE.Vector3> = [];
        addTriangleFacingCamera(verts, points[0], points[1], points[2]);
        addTriangleFacingCamera(verts, points[1], points[2], points[3]);

        const material = new THREE.MeshBasicMaterial({
            color: getColor(entity, data),
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(verts);

        return new THREE.Mesh(geometry, material);
    }


    drawPoint(entity: IPointEntity, data: IDxf): THREE.Object3D {
        var geometry, material, point;

        geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new Float32BufferAttribute([entity.position.x, entity.position.y, entity.position.z], 3));

        var color = getColor(entity, data);

        material = new THREE.PointsMaterial({ size: 0.1, color: new Color(color) });
        point = new THREE.Points(geometry, material);
        return point;
    }

    drawDimension(entity: IDimensionEntity, data: IDxf): THREE.Object3D | undefined {
        var block = data.blocks[entity.block];

        if (!block || !block.entities) return;

        var group = new THREE.Object3D();
        // if(entity.anchorPoint) {
        //     group.position.x = entity.anchorPoint.x;
        //     group.position.y = entity.anchorPoint.y;
        //     group.position.z = entity.anchorPoint.z;
        // }

        for (var i = 0; i < block.entities.length; i++) {
            var childEntity = this.drawEntity(block.entities[i], data);
            if (childEntity) group.add(childEntity);
        }

        return group;
    }

    drawBlock(entity:IInsertEntity, data: IDxf) :THREE.Object3D | undefined {
        var block = data.blocks[entity.name];

        if (!block.entities) return;

        var group = new THREE.Object3D()

        if (entity.xScale) group.scale.x = entity.xScale;
        if (entity.yScale) group.scale.y = entity.yScale;

        if (entity.rotation) {
            group.rotation.z = entity.rotation * Math.PI / 180;
        }

        if (entity.position) {
            group.position.x = entity.position.x;
            group.position.y = entity.position.y;
            group.position.z = entity.position.z;
        }

        for (var i = 0; i < block.entities.length; i++) {
            var childEntity = this.drawEntity(block.entities[i], data);
            if (childEntity) group.add(childEntity);
        }

        return group;
    }
}

function addTriangleFacingCamera(
    verts: Array<THREE.Vector3>,
    p0: IPoint,
    p1: IPoint,
    p2: IPoint
) {
    // Calculate which direction the points are facing (clockwise or counter-clockwise)
    var vector1 = new THREE.Vector3();
    var vector2 = new THREE.Vector3();
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
function getBSplinePolyline(
    controlPoints: IPoint[],
    degree: number,
    knots: number[],
    interpolationsPerSplineSegment: number,
    weights?: number[]
) {
    const polyline = []
    const controlPointsForLib = controlPoints.map(function (p) {
        return [p.x, p.y]
    })

    const segmentTs = [knots[degree]]
    const domain = [knots[degree], knots[knots.length - 1 - degree]]

    for (let k = degree + 1; k < knots.length - degree; ++k) {
        if (segmentTs[segmentTs.length - 1] !== knots[k]) {
            segmentTs.push(knots[k])
        }
    }

    interpolationsPerSplineSegment = interpolationsPerSplineSegment || 25
    for (let i = 1; i < segmentTs.length; ++i) {
        const uMin = segmentTs[i - 1]
        const uMax = segmentTs[i]
        for (let k = 0; k <= interpolationsPerSplineSegment; ++k) {
            const u = k / interpolationsPerSplineSegment * (uMax - uMin) + uMin
            // Clamp t to 0, 1 to handle numerical precision issues
            let t = (u - domain[0]) / (domain[1] - domain[0])
            t = Math.max(t, 0)
            t = Math.min(t, 1)
            const p = bSpline(t, degree, controlPointsForLib, knots, weights)
            polyline.push(new THREE.Vector2(p[0], p[1]));
        }
    }
    return polyline
}

export function useOrbitControls(camera: THREE.Camera, rendererDomElement: any, render: () => void, allowRotate: boolean = false) {
    var controls = new OrbitControls(camera, rendererDomElement);
    controls.target.x = camera.position.x;
    controls.target.y = camera.position.y;
    controls.target.z = 0;
    controls.zoomSpeed = 3;
    controls.enableRotate = allowRotate;
    controls.addEventListener('change', render);
    controls.update(); // fires the change event
}

export function getExtents(drawingObjects: THREE.Object3D[]) {
    let extents = {
        min: { x: -Infinity, y: -Infinity, z: -Infinity },
        max: { x: Infinity, y: Infinity, z: Infinity }
    }

    for (let obj of drawingObjects) {
        if (obj) {
            var bbox = new THREE.Box3().setFromObject(obj);
            if (isFinite(bbox.min.x) && (extents.min.x === -Infinity || extents.min.x > bbox.min.x)) extents.min.x = bbox.min.x;
            if (isFinite(bbox.min.y) && (extents.min.y === -Infinity || extents.min.y > bbox.min.y)) extents.min.y = bbox.min.y;
            if (isFinite(bbox.min.z) && (extents.min.z === -Infinity || extents.min.z > bbox.min.z)) extents.min.z = bbox.min.z;
            if (isFinite(bbox.max.x) && (extents.max.x === Infinity || extents.max.x < bbox.max.x)) extents.max.x = bbox.max.x;
            if (isFinite(bbox.max.y) && (extents.max.y === Infinity || extents.max.y < bbox.max.y)) extents.max.y = bbox.max.y;
            if (isFinite(bbox.max.z) && (extents.max.z === Infinity || extents.max.z < bbox.max.z)) extents.max.z = bbox.max.z;
        }
    }
    return extents;
}

export function zoomToExtents(camera: THREE.OrthographicCamera, extents: Extents, aspectRatio: number) {
    var upperRightCorner = { x: extents.max.x, y: extents.max.y };
    var lowerLeftCorner = { x: extents.min.x, y: extents.min.y };

    // Figure out the current viewport extents
    var vp_width = upperRightCorner.x - lowerLeftCorner.x;
    var vp_height = upperRightCorner.y - lowerLeftCorner.y;
    var center = {
        x: vp_width / 2 + lowerLeftCorner.x,
        y: vp_height / 2 + lowerLeftCorner.y
    };

    // Fit all objects into current ThreeDXF viewer
    var extentsAspectRatio = Math.abs(vp_width / vp_height);
    if (aspectRatio > extentsAspectRatio) {
        vp_width = vp_height * aspectRatio;
    } else {
        vp_height = vp_width / aspectRatio;
    }

    var viewPort = {
        bottom: -vp_height / 2,
        left: -vp_width / 2,
        top: vp_height / 2,
        right: vp_width / 2,
        center: {
            x: center.x,
            y: center.y
        }
    };

    camera.left = viewPort.left;
    camera.right = viewPort.right;
    camera.top = viewPort.top;
    camera.bottom = viewPort.bottom;
    camera.position.set(viewPort.center.x, viewPort.center.y, 10);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(new THREE.Vector3(viewPort.center.x, viewPort.center.y, 0));
}
