/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2020 Prolincur Technologies
 * 
 */

import * as THREE from 'three';
import DxfParser from 'dxf-parser';

/**
 * Returns the angle in radians of the vector (p1,p2). In other words, imagine
 * putting the base of the vector at coordinates (0,0) and finding the angle
 * from vector (1,0) to (p1,p2).
 * @param  {Object} p1 start point of the vector
 * @param  {Object} p2 end point of the vector
 * @return {Number} the angle
 */
THREE.Math.angle2 = function(p1, p2) {
	var v1 = new THREE.Vector2(p1.x, p1.y);
	var v2 = new THREE.Vector2(p2.x, p2.y);
	v2.sub(v1); // sets v2 to be our chord
	v2.normalize();
	if(v2.y < 0) return -Math.acos(v2.x);
	return Math.acos(v2.x);
};


THREE.Math.polar = function(point, distance, angle) {
	var result = {};
	result.x = point.x + distance * Math.cos(angle);
	result.y = point.y + distance * Math.sin(angle);
	return result;
};

/**
 * Calculates points for a curve between two points
 * @param startPoint - the starting point of the curve
 * @param endPoint - the ending point of the curve
 * @param bulge - a value indicating how much to curve
 * @param segments - number of segments between the two given points
 */
THREE.BulgeGeometry = function ( startPoint, endPoint, bulge, segments ) {

	var vertex, i,
		center, p0, p1, angle,
		radius, startAngle,
		thetaAngle;

	THREE.Geometry.call( this );

	this.startPoint = p0 = startPoint ? new THREE.Vector2(startPoint.x, startPoint.y) : new THREE.Vector2(0,0);
	this.endPoint = p1 = endPoint ? new THREE.Vector2(endPoint.x, endPoint.y) : new THREE.Vector2(1,0);
	this.bulge = bulge = bulge || 1;

	angle = 4 * Math.atan(bulge);
	radius = p0.distanceTo(p1) / 2 / Math.sin(angle/2);
	center = THREE.Math.polar(startPoint, radius, THREE.Math.angle2(p0,p1) + (Math.PI / 2 - angle/2));

	this.segments = segments = segments || Math.max( Math.abs(Math.ceil(angle/(Math.PI/18))), 6); // By default want a segment roughly every 10 degrees
	startAngle = THREE.Math.angle2(center, p0);
	thetaAngle = angle / segments;


	this.vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

	for(i = 1; i <= segments - 1; i++) {

		vertex = THREE.Math.polar(center, Math.abs(radius), startAngle + thetaAngle * i);

		this.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));

	}

};

THREE.BulgeGeometry.prototype = Object.create( THREE.Geometry.prototype );

/**
 * THREE.Loader implementation for DXF files
 * 
 * @param {*} manager THREE.LoadingManager 
 * 
 * @see https://threejs.org/docs/#api/en/loaders/Loader
 * @author Sourabh Soni / https://www.prolincur.com
 */
export const DXFLoader = function (manager) {
    THREE.Loader.call(this, manager);
    this.font = null
}

DXFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {
    constructor: DXFLoader,

    setFont: function ( font ) {
		this.font = font;
		return this;
    },
    
    load: function ( url, onLoad, onProgress, onError ) {
        var scope = this;
		var loader = new THREE.XHRLoader( scope.manager );

		loader.setPath( scope.path );
		loader.load( url, ( text ) => {
            try {
                onLoad(scope.parse(text))
            } catch (error) {
                if (onError) {
                    onError(error)
                } else {
                    console.error(error)
                }
                scope.manager.itemError(url)
            }
		}, onProgress, onError );

    },

    parse: function ( text ) {
        const parser = new DxfParser();
        var dxf = parser.parseSync(text)
        return this.loadEntities(dxf, this.font)
    },

    /**
     *
     * @param {Object} buffer - the dxf file content
     * @param {Object} font - a font loaded with THREE.FontLoader 
     * @constructor
     */
    loadEntities: function ( data, font ) {

        createLineTypeShaders(data);

        var entities = []

        // Create entities from dxf object (data)
        var i, entity, obj;
        for(i = 0; i < data.entities.length; i++) {
            entity = data.entities[i];
            obj = drawEntity(entity, data);
        
            if (obj) {
                entities.push(obj)
            }
            obj = null;
        }
        return {
            entities: entities,
            dxf: data
        }

        function drawEntity(entity, data) {
            var mesh;
            if(entity.type === 'CIRCLE' || entity.type === 'ARC') {
                mesh = drawArc(entity, data);
            } else if(entity.type === 'LWPOLYLINE' || entity.type === 'LINE' || entity.type === 'POLYLINE') {
                mesh = drawLine(entity, data);
            } else if(entity.type === 'TEXT') {
                mesh = drawText(entity, data);
            } else if(entity.type === 'SOLID') {
                mesh = drawSolid(entity, data);
            } else if(entity.type === 'POINT') {
                mesh = drawPoint(entity, data);
            } else if(entity.type === 'INSERT') {
                mesh = drawBlock(entity, data);
            } else if(entity.type === 'SPLINE') {
                mesh = drawSpline(entity, data);
            } else if(entity.type === 'MTEXT') {
                mesh = drawMtext(entity, data);
            } else if(entity.type === 'ELLIPSE') {
                mesh = drawEllipse(entity, data);
            } else if(entity.type === 'DIMENSION') {
                var dimTypeEnum = entity.dimensionType & 7;
                if(dimTypeEnum === 0) {
                    mesh = drawDimension(entity, data);
                } else {
                    console.log("Unsupported Dimension type: " + dimTypeEnum);
                }
            }
            else {
                console.log("Unsupported Entity Type: " + entity.type);
            }
            return mesh;
        }

        function drawEllipse(entity, data) {
            var color = getColor(entity, data);

            var xrad = Math.sqrt(Math.pow(entity.majorAxisEndPoint.x,2) + Math.pow(entity.majorAxisEndPoint.y,2));
            var yrad = xrad*entity.axisRatio;
            var rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

            var curve = new THREE.EllipseCurve(
                entity.center.x,  entity.center.y,
                xrad, yrad,
                entity.startAngle, entity.endAngle,
                false, // Always counterclockwise
                rotation
            );

            var points = curve.getPoints( 50 );
            var geometry = new THREE.BufferGeometry().setFromPoints( points );
            var material = new THREE.LineBasicMaterial( {  linewidth: 1, color : color } );

            // Create the final object to add to the scene
            var ellipse = new THREE.Line( geometry, material );
            return ellipse;
        }

        function drawMtext(entity, data) {
            var color = getColor(entity, data);

            var geometry = new THREE.TextGeometry( entity.text, {
                font: font,
                size: entity.height * (4/5),
                height: 1
            });
            var material = new THREE.MeshBasicMaterial( {color: color} );
            var text = new THREE.Mesh( geometry, material );

            // Measure what we rendered.
            var measure = new THREE.Box3();
            measure.setFromObject( text );

            var textWidth  = measure.max.x - measure.min.x;

            // If the text ends up being wider than the box, it's supposed
            // to be multiline. Doing that in threeJS is overkill.
            if (textWidth > entity.width) {
                console.log("Can't render this multipline MTEXT entity, sorry.", entity);
                return undefined;
            }

            text.position.z = 0;
            switch (entity.attachmentPoint) {
                case 1:
                    // Top Left
                    text.position.x = entity.position.x;
                    text.position.y = entity.position.y - entity.height;
                break;
                case 2:
                    // Top Center
                    text.position.x = entity.position.x - textWidth/2;
                    text.position.y = entity.position.y - entity.height;
                break;
                case 3:
                    // Top Right
                    text.position.x = entity.position.x - textWidth;
                    text.position.y = entity.position.y - entity.height;
                break;

                case 4:
                    // Middle Left
                    text.position.x = entity.position.x;
                    text.position.y = entity.position.y - entity.height/2;
                break;
                case 5:
                    // Middle Center
                    text.position.x = entity.position.x - textWidth/2;
                    text.position.y = entity.position.y - entity.height/2;
                break;
                case 6:
                    // Middle Right
                    text.position.x = entity.position.x - textWidth;
                    text.position.y = entity.position.y - entity.height/2;
                break;

                case 7:
                    // Bottom Left
                    text.position.x = entity.position.x;
                    text.position.y = entity.position.y;
                break;
                case 8:
                    // Bottom Center
                    text.position.x = entity.position.x - textWidth/2;
                    text.position.y = entity.position.y;
                break;
                case 9:
                    // Bottom Right
                    text.position.x = entity.position.x - textWidth;
                    text.position.y = entity.position.y;
                break;

                default:
                    return undefined;
            };

            return text;
        }

        function drawSpline(entity, data) {
            var color = getColor(entity, data);

            var points = entity.controlPoints.map(function(vec) {
                return new THREE.Vector2(vec.x, vec.y);
            });

            var interpolatedPoints = [];
            var curve;
            if (entity.degreeOfSplineCurve === 2 || entity.degreeOfSplineCurve === 3) {
                for(var i = 0; i + 2 < points.length; i = i + 2) {
            if (entity.degreeOfSplineCurve === 2) {
                            curve = new THREE.QuadraticBezierCurve(points[i], points[i + 1], points[i + 2]);
            } else {
                curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
            }
                    interpolatedPoints.push.apply(interpolatedPoints, curve.getPoints(50));
                }
            } else {
                curve = new THREE.SplineCurve(points);
                interpolatedPoints = curve.getPoints( 100 );
            }

            var geometry = new THREE.BufferGeometry().setFromPoints( interpolatedPoints );
            var material = new THREE.LineBasicMaterial( { linewidth: 1, color : color } );
            var splineObject = new THREE.Line( geometry, material );

            return splineObject;
        }

        function drawLine(entity, data) {
            var geometry = new THREE.Geometry(),
                color = getColor(entity, data),
                material, lineType, vertex, startPoint, endPoint, bulgeGeometry,
                bulge, i, line;

            // create geometry
            for(i = 0; i < entity.vertices.length; i++) {

                if(entity.vertices[i].bulge) {
                    bulge = entity.vertices[i].bulge;
                    startPoint = entity.vertices[i];
                    endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : geometry.vertices[0];

                    bulgeGeometry = new THREE.BulgeGeometry(startPoint, endPoint, bulge);

                    geometry.vertices.push.apply(geometry.vertices, bulgeGeometry.vertices);
                } else {
                    vertex = entity.vertices[i];
                    geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
                }

            }
            if(entity.shape) geometry.vertices.push(geometry.vertices[0]);


            // set material
            if(entity.lineType) {
                lineType = data.tables.lineType.lineTypes[entity.lineType];
            }

            if(lineType && lineType.pattern && lineType.pattern.length !== 0) {
                material = new THREE.LineDashedMaterial({ color: color, gapSize: 4, dashSize: 4});
            } else {
                material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
            }

            // if(lineType && lineType.pattern && lineType.pattern.length !== 0) {

            //           geometry.computeLineDistances();

            //           // Ugly hack to add diffuse to this. Maybe copy the uniforms object so we
            //           // don't add diffuse to a material.
            //           lineType.material.uniforms.diffuse = { type: 'c', value: new THREE.Color(color) };

            // 	material = new THREE.ShaderMaterial({
            // 		uniforms: lineType.material.uniforms,
            // 		vertexShader: lineType.material.vertexShader,
            // 		fragmentShader: lineType.material.fragmentShader
            // 	});
            // }else {
            // 	material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
            // }

            line = new THREE.Line(geometry, material);
            return line;
        }
        
        function drawArc(entity, data) {
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

            var points = curve.getPoints( 32 );
            var geometry = new THREE.BufferGeometry().setFromPoints( points );

            var material = new THREE.LineBasicMaterial({ color: getColor(entity, data) });

            var arc = new THREE.Line(geometry, material);
            arc.position.x = entity.center.x;
            arc.position.y = entity.center.y;
            arc.position.z = entity.center.z;

            return arc;
        }

        function drawSolid(entity, data) {
            var material, mesh, verts,
                geometry = new THREE.Geometry();

            verts = geometry.vertices;
            verts.push(new THREE.Vector3(entity.points[0].x, entity.points[0].y, entity.points[0].z));
            verts.push(new THREE.Vector3(entity.points[1].x, entity.points[1].y, entity.points[1].z));
            verts.push(new THREE.Vector3(entity.points[2].x, entity.points[2].y, entity.points[2].z));
            verts.push(new THREE.Vector3(entity.points[3].x, entity.points[3].y, entity.points[3].z));

            // Calculate which direction the points are facing (clockwise or counter-clockwise)
            var vector1 = new THREE.Vector3();
            var vector2 = new THREE.Vector3();
            vector1.subVectors(verts[1], verts[0]);
            vector2.subVectors(verts[2], verts[0]);
            vector1.cross(vector2);

            // If z < 0 then we must draw these in reverse order
            if(vector1.z < 0) {
                geometry.faces.push(new THREE.Face3(2, 1, 0));
                geometry.faces.push(new THREE.Face3(2, 3, 1));
            } else {
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(1, 3, 2));
            }


            material = new THREE.MeshBasicMaterial({ color: getColor(entity, data) });

            return new THREE.Mesh(geometry, material);
            
        }

        function drawText(entity, data) {
            var geometry, material, text;

            if(!font)
                return console.warn('Text is not supported without a Three.js font loaded with THREE.FontLoader! Load a font of your choice and pass this into the constructor. See the sample for this repository or Three.js examples at http://threejs.org/examples/?q=text#webgl_geometry_text for more details.');
            
            geometry = new THREE.TextGeometry(entity.text, { font: font, height: 0, size: entity.textHeight || 12 });

            if (entity.rotation) {
                var zRotation = entity.rotation * Math.PI / 180;
                geometry.rotateZ(zRotation);
            }

            material = new THREE.MeshBasicMaterial({ color: getColor(entity, data) });

            text = new THREE.Mesh(geometry, material);
            text.position.x = entity.startPoint.x;
            text.position.y = entity.startPoint.y;
            text.position.z = entity.startPoint.z;

            return text;
        }

        function drawPoint(entity, data) {
            var geometry, material, point;

            geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z));

            // TODO: could be more efficient. PointCloud per layer?

            var numPoints = 1;

            var color = getColor(entity, data);
            var colors = new Float32Array( numPoints*3 );
            colors[0] = color.r;
            colors[1] = color.g;
            colors[2] = color.b;

            geometry.colors = colors;
            geometry.computeBoundingBox();

            material = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
            point = new THREE.Points(geometry, material);
            entities.push(point);
        }

        function drawDimension(entity, data) {
            var block = data.blocks[entity.block];

            if (!block || !block.entities) return null;

            var group = new THREE.Object3D();
            // if(entity.anchorPoint) {
            //     group.position.x = entity.anchorPoint.x;
            //     group.position.y = entity.anchorPoint.y;
            //     group.position.z = entity.anchorPoint.z;
            // }

            for(var i = 0; i < block.entities.length; i++) {
                var childEntity = drawEntity(block.entities[i], data, group);
                if(childEntity) group.add(childEntity);
            }

            return group;
        }

        function drawBlock(entity, data) {
            var block = data.blocks[entity.name];
            
            if (!block.entities) return null;

            var group = new THREE.Object3D()
            
            if(entity.xScale) group.scale.x = entity.xScale;
            if(entity.yScale) group.scale.y = entity.yScale;

            if(entity.rotation) {
                group.rotation.z = entity.rotation * Math.PI / 180;
            }

            if(entity.position) {
                group.position.x = entity.position.x;
                group.position.y = entity.position.y;
                group.position.z = entity.position.z;
            }
            
            for(var i = 0; i < block.entities.length; i++) {
                var childEntity = drawEntity(block.entities[i], data, group);
                if(childEntity) group.add(childEntity);
            }

            return group;
        }

        function getColor(entity, data) {
            var color = 0x000000; //default
            if(entity.color) color = entity.color;
            else if(data.tables && data.tables.layer && data.tables.layer.layers[entity.layer])
                color = data.tables.layer.layers[entity.layer].color;
                
            if(color == null || color === 0xffffff) {
                color = 0x000000;
            }
            return color;
        }

        function createLineTypeShaders(data) {
            var ltype, type;
            if(!data.tables || !data.tables.lineType) return;
            var ltypes = data.tables.lineType.lineTypes;

            for(type in ltypes) {
                ltype = ltypes[type];
                if(!ltype.pattern) continue;
                ltype.material = createDashedLineShader(ltype.pattern);
            }
        }

        function createDashedLineShader(pattern) {
            var i,
                dashedLineShader = {},
                totalLength = 0.0;

            for(i = 0; i < pattern.length; i++) {
                totalLength += Math.abs(pattern[i]);
            }

            dashedLineShader.uniforms = THREE.UniformsUtils.merge([

                THREE.UniformsLib[ 'common' ],
                THREE.UniformsLib[ 'fog' ],

                {
                    'pattern': { type: 'fv1', value: pattern },
                    'patternLength': { type: 'f', value: totalLength }
                }

            ]);

            dashedLineShader.vertexShader = [
                'attribute float lineDistance;',

                'varying float vLineDistance;',

                THREE.ShaderChunk[ 'color_pars_vertex' ],

                'void main() {',

                THREE.ShaderChunk[ 'color_vertex' ],

                'vLineDistance = lineDistance;',

                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

                '}'
            ].join('\n');

            dashedLineShader.fragmentShader = [
                'uniform vec3 diffuse;',
                'uniform float opacity;',

                'uniform float pattern[' + pattern.length + '];',
                'uniform float patternLength;',

                'varying float vLineDistance;',

                THREE.ShaderChunk[ 'color_pars_fragment' ],
                THREE.ShaderChunk[ 'fog_pars_fragment' ],

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

                THREE.ShaderChunk[ 'color_fragment' ],
                THREE.ShaderChunk[ 'fog_fragment' ],

                '}'
            ].join('\n');

            return dashedLineShader;
        }

        function findExtents(scene) { 
            for(var child of scene.children) {
                var minX, maxX, minY, maxY;
                if(child.position) {
                    minX = Math.min(child.position.x, minX);
                    minY = Math.min(child.position.y, minY);
                    maxX = Math.max(child.position.x, maxX);
                    maxY = Math.max(child.position.y, maxY);
                }
            }

            return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY }};
        }

    }})
