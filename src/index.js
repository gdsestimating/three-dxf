import * as THREE from 'three';
import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from 'three';
import { OrbitControls } from './OrbitControls';
import bSpline from './bspline';
import DxfTextLoader from './TextLoader';
import { getColor } from './utils';


var THREEx = { Math: {} };

/**
 * Returns the angle in radians of the vector (p1,p2). In other words, imagine
 * putting the base of the vector at coordinates (0,0) and finding the angle
 * from vector (1,0) to (p1,p2).
 * @param  {Object} p1 start point of the vector
 * @param  {Object} p2 end point of the vector
 * @return {Number} the angle
 */
THREEx.Math.angle2 = function (p1, p2) {
    var v1 = new THREE.Vector2(p1.x, p1.y);
    var v2 = new THREE.Vector2(p2.x, p2.y);
    v2.sub(v1); // sets v2 to be our chord
    v2.normalize();
    if (v2.y < 0) return -Math.acos(v2.x);
    return Math.acos(v2.x);
};


THREEx.Math.polar = function (point, distance, angle) {
    var result = {};
    result.x = point.x + distance * Math.cos(angle);
    result.y = point.y + distance * Math.sin(angle);
    return result;
};

/**
 * Calculates points for a curve between two points using a bulge value. Typically used in polylines.
 * @param startPoint - the starting point of the curve
 * @param endPoint - the ending point of the curve
 * @param bulge - a value indicating how much to curve
 * @param segments - number of segments between the two given points
 */
function getBulgeCurvePoints(startPoint, endPoint, bulge, segments) {

    var vertex, i,
        center, p0, p1, angle,
        radius, startAngle,
        thetaAngle;

    var obj = {};
    obj.startPoint = p0 = startPoint ? new THREE.Vector2(startPoint.x, startPoint.y) : new THREE.Vector2(0, 0);
    obj.endPoint = p1 = endPoint ? new THREE.Vector2(endPoint.x, endPoint.y) : new THREE.Vector2(1, 0);
    obj.bulge = bulge = bulge || 1;

    angle = 4 * Math.atan(bulge);
    radius = p0.distanceTo(p1) / 2 / Math.sin(angle / 2);
    center = THREEx.Math.polar(startPoint, radius, THREEx.Math.angle2(p0, p1) + (Math.PI / 2 - angle / 2));

    obj.segments = segments = segments || Math.max(Math.abs(Math.ceil(angle / (Math.PI / 18))), 6); // By default want a segment roughly every 10 degrees
    startAngle = THREEx.Math.angle2(center, p0);
    thetaAngle = angle / segments;

    var vertices = [];

    vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

    for (i = 1; i <= segments - 1; i++) {
        vertex = THREEx.Math.polar(center, Math.abs(radius), startAngle + thetaAngle * i);
        vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
    }

    return vertices;
};

/**
 * Viewer class for a dxf object.
 * @param {Object} data - the dxf object
 * @param {Object} parent - the parent element to which we attach the rendering canvas
 * @param {Number} width - width of the rendering canvas in pixels
 * @param {Number} height - height of the rendering canvas in pixels
 * @param {Object} font - a font loaded with THREE.FontLoader 
 * @constructor
 */
export function Viewer(data, parent, width, height, font) {

    var scene = new THREE.Scene();

    let drawingObjects = generateDrawingObjects(data, font);
    for (let obj of drawingObjects) scene.add(obj)

    width = width || parent.clientWidth;
    height = height || parent.clientHeight;

    let extents = getExtents(drawingObjects);
    var camera = new THREE.OrthographicCamera();
    var aspectRatio = width / height;
    zoomExtents(extents, camera, aspectRatio);

    var renderer = this.renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xfffffff, 1);
    this.render = function () { renderer.render(scene, camera) };

    parent.appendChild(renderer.domElement);
    
    useOrbitControls(camera, render.domElement, this.render);
}


export class DxfLoader {

    constructor(fontUrl) {
        this.textLoader = new DxfTextLoader(fontUrl);
        
    }

    load(parsedDxfData, onLoad) {
        let drawingObjects = [];

        for (let entity of parsedDxfData.entities) {
            let obj = this.drawEntity(entity, parsedDxfData);
            if (obj) drawingObjects.push(obj);
        }

        this.textLoader.waitForTextToBeReady().then(() => {
            onLoad(drawingObjects);
        });
    }

    drawEntity(entity, data) {
        var obj;
        if (entity.type === 'CIRCLE' || entity.type === 'ARC') {
            obj = this.drawArc(entity, data);
        } else if (entity.type === 'LWPOLYLINE' || entity.type === 'LINE' || entity.type === 'POLYLINE') {
            obj = this.drawLine(entity, data);
        } else if (entity.type === 'TEXT') {
            obj = this.textLoader.drawText(entity, data);
        } else if (entity.type === 'SOLID') {
            obj = this.drawSolid(entity, data);
        } else if (entity.type === 'POINT') {
            obj = this.drawPoint(entity, data);
        } else if (entity.type === 'INSERT') {
            obj = this.drawBlock(entity, data);
        } else if (entity.type === 'SPLINE') {
            obj = this.drawSpline(entity, data);
        } else if (entity.type === 'MTEXT') {
            obj = this.textLoader.drawMtext(entity, data);
        } else if (entity.type === 'ELLIPSE') {
            obj = this.drawEllipse(entity, data);
        } else if (entity.type === 'DIMENSION') {
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


    drawEllipse(entity, data) {
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
    
    drawSpline(entity, data) {
        var color = getColor(entity, data);
    
        var points = getBSplinePolyline(entity.controlPoints, entity.degreeOfSplineCurve, entity.knotValues, 100);
    
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
        var splineObject = new THREE.Line(geometry, material);
    
        return splineObject;
    }
    
    drawLine(entity, data) {
        let points = [];
        let color = getColor(entity, data);
        var material, lineType, vertex, startPoint, endPoint, bulgeGeometry,
            bulge, i, line;
    
        if (!entity.vertices) return console.log('entity missing vertices.');
    
        // create geometry
        for (i = 0; i < entity.vertices.length; i++) {
    
            if (entity.vertices[i].bulge) {
                bulge = entity.vertices[i].bulge;
                startPoint = entity.vertices[i];
                endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : points[0];
    
                let bulgePoints = getBulgeCurvePoints(startPoint, endPoint, bulge);
    
                points.push.apply(points, bulgePoints);
            } else {
                vertex = entity.vertices[i];
                points.push(new THREE.Vector3(vertex.x, vertex.y, 0));
            }
    
        }
        if (entity.shape) points.push(points[0]);
    
    
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
    
        line = new THREE.Line(geometry, material);
        return line;
    }
    
    drawArc(entity, data) {
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
    
    drawSolid(entity, data) {
        var material, verts,
            geometry = new THREE.BufferGeometry();
    
        var points = entity.points;
        // verts = geometry.vertices;
        verts = [];
        addTriangleFacingCamera(verts, points[0], points[1], points[2]);
        addTriangleFacingCamera(verts, points[1], points[2], points[3]);
    
        material = new THREE.MeshBasicMaterial({ color: getColor(entity, data) });
        geometry.setFromPoints(verts);
    
        return new THREE.Mesh(geometry, material);
    }
    
    
    drawPoint(entity, data) {
        var geometry, material, point;
    
        geometry = new THREE.BufferGeometry();
    
        geometry.setAttribute('position', new Float32BufferAttribute([entity.position.x, entity.position.y, entity.position.z], 3));
    
        var color = getColor(entity, data);
    
        material = new THREE.PointsMaterial({ size: 0.1, color: new Color(color) });
        point = new THREE.Points(geometry, material);
        return point;
    }  

    drawDimension(entity, data) {
        var block = data.blocks[entity.block];

        if (!block || !block.entities) return null;

        var group = new THREE.Object3D();
        // if(entity.anchorPoint) {
        //     group.position.x = entity.anchorPoint.x;
        //     group.position.y = entity.anchorPoint.y;
        //     group.position.z = entity.anchorPoint.z;
        // }

        for (var i = 0; i < block.entities.length; i++) {
            var childEntity = this.drawEntity(block.entities[i], data, group);
            if (childEntity) group.add(childEntity);
        }

        return group;
    }

    drawBlock(entity, data) {
        var block = data.blocks[entity.name];

        if (!block.entities) return null;

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
            var childEntity = this.drawEntity(block.entities[i], data, group);
            if (childEntity) group.add(childEntity);
        }

        return group;
    }
}

function addTriangleFacingCamera(verts, p0, p1, p2) {
    // Calculate which direction the points are facing (clockwise or counter-clockwise)
    var vector1 = new Vector3();
    var vector2 = new Vector3();
    vector1.subVectors(p1, p0);
    vector2.subVectors(p2, p0);
    vector1.cross(vector2);

    var v0 = new Vector3(p0.x, p0.y, p0.z);
    var v1 = new Vector3(p1.x, p1.y, p1.z);
    var v2 = new Vector3(p2.x, p2.y, p2.z);

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
function getBSplinePolyline(controlPoints, degree, knots, interpolationsPerSplineSegment, weights) {
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

export function setViewFromDxf() {
    
}

export function useOrbitControls(camera, rendererDomElement, render, allowRotate = false) {
    var controls = new OrbitControls(camera, rendererDomElement);
    controls.target.x = camera.position.x;
    controls.target.y = camera.position.y;
    controls.target.z = 0;
    controls.zoomSpeed = 3;
    controls.enableRotate = allowRotate;
    controls.addEventListener('change', render);
    controls.update(); // fires the change event
}

export function getExtents(drawingObjects) {
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

export function zoomToExtents(camera, extents, aspectRatio) {
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
