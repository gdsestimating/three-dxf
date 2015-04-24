(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DxfParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],2:[function(require,module,exports){
/**
 * AutoCad files sometimes use an indexed color value between 1 and 255 inclusive.
 * Each value corresponds to a color. index 1 is red, that is 16711680 or 0xFF0000.
 * index 0 and 256, while included in this array, are actually reserved for inheritance
 * values in AutoCad so they should not be used for index color lookups.
 */

module.exports = [
 0,
 16711680,
 16776960,
 65280,
 65535,
 255,
 16711935,
 16777215,
 8421504,
 12632256,
 16711680,
 16744319,
 13369344,
 13395558,
 10027008,
 10046540,
 8323072,
 8339263,
 4980736,
 4990502,
 16727808,
 16752511,
 13382400,
 13401958,
 10036736,
 10051404,
 8331008,
 8343359,
 4985600,
 4992806,
 16744192,
 16760703,
 13395456,
 13408614,
 10046464,
 10056268,
 8339200,
 8347455,
 4990464,
 4995366,
 16760576,
 16768895,
 13408512,
 13415014,
 10056192,
 10061132,
 8347392,
 8351551,
 4995328,
 4997670,
 16776960,
 16777087,
 13421568,
 13421670,
 10000384,
 10000460,
 8355584,
 8355647,
 5000192,
 5000230,
 12582656,
 14679935,
 10079232,
 11717734,
 7510016,
 8755276,
 6258432,
 7307071,
 3755008,
 4344870,
 8388352,
 12582783,
 6736896,
 10079334,
 5019648,
 7510092,
 4161280,
 6258495,
 2509824,
 3755046,
 4194048,
 10485631,
 3394560,
 8375398,
 2529280,
 6264908,
 2064128,
 5209919,
 1264640,
 3099686,
 65280,
 8388479,
 52224,
 6736998,
 38912,
 5019724,
 32512,
 4161343,
 19456,
 2509862,
 65343,
 8388511,
 52275,
 6737023,
 38950,
 5019743,
 32543,
 4161359,
 19475,
 2509871,
 65407,
 8388543,
 52326,
 6737049,
 38988,
 5019762,
 32575,
 4161375,
 19494,
 2509881,
 65471,
 8388575,
 52377,
 6737074,
 39026,
 5019781,
 32607,
 4161391,
 19513,
 2509890,
 65535,
 8388607,
 52428,
 6737100,
 39064,
 5019800,
 32639,
 4161407,
 19532,
 2509900,
 49151,
 8380415,
 39372,
 6730444,
 29336,
 5014936,
 24447,
 4157311,
 14668,
 2507340,
 32767,
 8372223,
 26316,
 6724044,
 19608,
 5010072,
 16255,
 4153215,
 9804,
 2505036,
 16383,
 8364031,
 13260,
 6717388,
 9880,
 5005208,
 8063,
 4149119,
 4940,
 2502476,
 255,
 8355839,
 204,
 6710988,
 152,
 5000344,
 127,
 4145023,
 76,
 2500172,
 4129023,
 10452991,
 3342540,
 8349388,
 2490520,
 6245528,
 2031743,
 5193599,
 1245260,
 3089996,
 8323327,
 12550143,
 6684876,
 10053324,
 4980888,
 7490712,
 4128895,
 6242175,
 2490444,
 3745356,
 12517631,
 14647295,
 10027212,
 11691724,
 7471256,
 8735896,
 6226047,
 7290751,
 3735628,
 4335180,
 16711935,
 16744447,
 13369548,
 13395660,
 9961624,
 9981080,
 8323199,
 8339327,
 4980812,
 4990540,
 16711871,
 16744415,
 13369497,
 13395634,
 9961586,
 9981061,
 8323167,
 8339311,
 4980793,
 4990530,
 16711807,
 16744383,
 13369446,
 13395609,
 9961548,
 9981042,
 8323135,
 8339295,
 4980774,
 4990521,
 16711743,
 16744351,
 13369395,
 13395583,
 9961510,
 9981023,
 8323103,
 8339279,
 4980755,
 4990511,
 3355443,
 5987163,
 8684676,
 11382189,
 14079702,
 16777215
];
},{}],3:[function(require,module,exports){
/**
 * DxfArrayScanner
 *
 * Based off the AutoCad 2012 DXF Reference
 * http://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf
 *
 * Reads through an array representing lines of a dxf file. Takes an array and
 * provides an easy interface to extract group code and value pairs.
 * @param data - an array where each element represents a line in the dxf file
 * @constructor
 */
function DxfArrayScanner(data) {
	this._pointer = 0;
	this._data = data;
	this._eof = false;
}

/**
 * Gets the next group (code, value) from the array. A group is two consecutive elements
 * in the array. The first is the code, the second is the value.
 * @returns {{code: Number}|*}
 */
DxfArrayScanner.prototype.next = function() {
	var group;
	if(!this.hasNext()) {
		if(!this._eof)
			throw new Error('Unexpected end of input: EOF group not read before end of file');
		else
			throw new Error('Cannot call \'next\' after EOF group has been read');
	}

	group = {
		code: parseInt(this._data[this._pointer])
	};

	this._pointer++;

	group.value = parseGroupValue(group.code, this._data[this._pointer].trim());
	
	this._pointer++;

	if(group.code === 0 && group.value === 'EOF') this._eof = true;

	return group;
};

/**
 * Returns true if there is another code/value pair (2 elements in the array).
 * @returns {boolean}
 */
DxfArrayScanner.prototype.hasNext = function() {
	// Check if we have read EOF group code
	if(this._eof) {
		return false;
	}
	
	// We need to be sure there are two lines available
	if(this._pointer > this._data.length - 2) {
		return false;
	}
	return true;
};

/**
 * Returns true if the scanner is at the end of the array
 * @returns {boolean}
 */
DxfArrayScanner.prototype.isEOF = function() {
	return this._eof;
};

/**
 * Parse a value to its proper type.
 * See pages 3 - 10 of the AutoCad DXF 2012 reference given at the top of this file
 *
 * @param code
 * @param value
 * @returns {*}
 */
function parseGroupValue(code, value) {
	if(code <= 9) return value;
	if(code >= 10 && code <= 59) return parseFloat(value);
	if(code >= 60 && code <= 99) return parseInt(value);
	if(code >= 100 && code <= 109) return value;
	if(code >= 110 && code <= 149) return parseFloat(value);
	if(code >= 160 && code <= 179) return parseInt(value);
	if(code >= 210 && code <= 239) return parseFloat(value);
	if(code >= 270 && code <= 289) return parseInt(value);
	if(code >= 290 && code <= 299) return parseBoolean(value);
	if(code >= 300 && code <= 369) return value;
	if(code >= 370 && code <= 389) return parseInt(value);
	if(code >= 390 && code <= 399) return value;
	if(code >= 400 && code <= 409) return parseInt(value);
	if(code >= 410 && code <= 419) return value;
	if(code >= 420 && code <= 429) return parseInt(value);
	if(code >= 430 && code <= 439) return value;
	if(code >= 440 && code <= 459) return parseInt(value);
	if(code >= 460 && code <= 469) return parseFloat(value);
	if(code >= 470 && code <= 481) return value;
	if(code === 999) return value;
	if(code >= 1000 && code <= 1009) return value;
	if(code >= 1010 && code <= 1059) return parseFloat(value);
	if(code >= 1060 && code <= 1071) return parseInt(value);

	console.log('WARNING: Group code does not have a defined type: %j', { code: code, value: value });
	return value;
}

/**
 * Parse a boolean according to a 1 or 0 value
 * @param str
 * @returns {boolean}
 */
function parseBoolean(str) {
	if(str === '0') return false;
	if(str === '1') return true;
	throw TypeError('String \'' + str + '\' cannot be cast to Boolean type');
}

module.exports = DxfArrayScanner;
},{}],4:[function(require,module,exports){
var DxfArrayScanner = require('./DxfArrayScanner.js'),
	AUTO_CAD_COLOR_INDEX = require('./AutoCadColorIndex'),
	EOL = require('os').EOL;

function DxfParser(stream) {}

DxfParser.prototype.parse = function(source, done) {
	throw new Error("read() not implemented. Use readSync()");
};

DxfParser.prototype.parseSync = function(source) {
	if(typeof(source) === 'string') {
		return this._parse(source);
	}else {
		console.error('Cannot read dxf source of type `' + typeof(source));
	}
};

DxfParser.prototype.parseStream = function(stream, done) {

	var dxfString = "";
	var self = this;

	stream.on('data', onData);
	stream.on('end', onEnd);
	stream.on('error', onError);

	function onData(chunk) {
		dxfString += chunk;
	}

	function onEnd() {
		var dxf = self._parse(dxfString);
		done(null, dxf);
	}

	function onError(err) {
		done(err);
	}
};

DxfParser.prototype._parse = function(dxfString) {
	var scanner, curr, dxf = {};
	var dxfLinesArray = dxfString.split(EOL);

	scanner = new DxfArrayScanner(dxfLinesArray);
	if(!scanner.hasNext()) throw Error('Empty file');

	var parseAll = function() {
		curr = scanner.next();
		while(!scanner.isEOF()) {
			// If is a new section
			if(curr.code === 0 && curr.value === 'SECTION') {
				curr = scanner.next();

				// Be sure we are reading a section code
				if(curr.code !== 2) {
					console.error('Unexpected code %s after 0:SECTION', debugCode(curr));
					curr = scanner.next();
					continue;
				}

				if(curr.value === 'HEADER')
					dxf.header = parseHeader();
				else if(curr.value === 'BLOCKS')
					dxf.blocks = parseBlocks();
				else if(curr.value === 'ENTITIES') {
					curr = scanner.next();
					dxf.entities = parseEntities(false);
				} else if(curr.value === 'TABLES') {
					dxf.tables = parseTables();
				} else if(curr.value === 'EOF') {
					break;
				} else {
					console.log('INFO: Skipping section \'%s\'', curr.value);
				}
			} else {
				curr = scanner.next();
			}
		}
	};

	var groupIs = function(code, value) {
		return curr.code === code && curr.value === value;
	};

	/**
	 *
	 * @return {object} header
	 */
	var parseHeader = function() {
		// interesting variables:
		//  $ACADVER, $VIEWDIR, $VIEWSIZE, $VIEWCTR, $TDCREATE, $TDUPDATE
		// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
		// Also see VPORT table entries
		var currVarName = null, currVarValue = null;
		var header = {};
		// loop through header variables
		curr = scanner.next();

		while(true) {
			if(groupIs(0, 'ENDSEC')) {
				if(currVarName) header[currVarName] = currVarValue;
				break;
			} else if(curr.code === 9) {
				if(currVarName) header[currVarName] = currVarValue;
				currVarName = curr.value;
				// Filter here for particular variables we are interested in
			} else {
				if(curr.code === 10) {
					currVarValue = { x: curr.value };
				} else if(curr.code === 20) {
					currVarValue.y = curr.value;
				} else if(curr.code === 30) {
					currVarValue.z = curr.value;
				} else {
					currVarValue = curr.value;
				}
			}
			curr = scanner.next();
		}
		// console.log(util.inspect(header, { colors: true, depth: null }));
		curr = scanner.next(); // swallow up ENDSEC
		return header;
	};


	/**
	 *
	 */
	var parseBlocks = function() {
		var blocks = {}, block;

		while(curr.value !== 'EOF') {
			if(groupIs(0, 'ENDSEC')) {
				break;
			}

			if(groupIs(0, 'BLOCK')) {
				block = parseBlock();
				blocks[block.name] = block;
			} else {
				curr = scanner.next();
			}
		}
		return blocks;
	};

	var parseBlock = function() {
		var block = {};
		curr = scanner.next();

		while(curr.value !== 'EOF') {
			if(groupIs(0, 'ENDBLK'))
				break;

			switch(curr.code) {
				case 2:
					block.name = curr.value;
					curr = scanner.next();
					break;
				case 8:
					block.layer = curr.value;
					curr = scanner.next();
					break;
				case 0:
					block.entities = parseEntities(true);
					return block;
					break;
				default:
					curr = scanner.next();
			}
		}
		return block;
	};

	/**
	 * parseTables
	 * @return {Object} Object representing tables
	 */
	var parseTables = function() {
		var tables = {};
		curr = scanner.next();
		while(curr.value !== 'EOF') {
			if(groupIs(0, 'ENDSEC'))
				break;

			if(groupIs(0, 'TABLE')) {
				curr = scanner.next();
				// console.log(curr.value);
				if(groupIs(2, 'LAYER')) {
					tables.layers = parseLayerTable();
				} else if(groupIs(2, 'LTYPE')) {
					tables.lineTypes = parseLineTypeTable();
				} else {
					// ignored
				}
			} else {
				// else ignored
				curr = scanner.next();
			}
		}

		curr = scanner.next();
		return tables;
	};

	var parseLayerTable = function() {
		var layers = {},
			length = 0;
		curr = scanner.next();
		while(!groupIs(0, 'ENDTAB')) {
			if(curr.code === 70) {
				length = curr.value;
				curr = scanner.next();
			} else if(groupIs(0, 'LAYER')) {
				layers = parseLayers();
				// if(layers.length !== length)
				// 	throw new Error('Error reading ltypes table: only read ' + ltypes.length + ' but should be ' + length);
				break;
			} else {
				curr = scanner.next();
			}
		}

		curr = scanner.next();
		return layers;
	};

	var parseLineTypeTable = function() {
		var ltypes = {},
			length = 0;
		curr = scanner.next();
		while(!groupIs(0, 'ENDTAB')) {
			if(curr.code === 70) {
				length = curr.value;
				curr = scanner.next();
			} else if(groupIs(0, 'LTYPE')) {
				ltypes = parseLineTypes();
				// if(ltypes.length !== length)
				// 	throw new Error('Error reading ltypes table: only read ' + ltypes.length + ' but should be ' + length);
				break;
			} else {
				curr = scanner.next();
			}
		}
		curr = scanner.next();
		return ltypes;
	};

	var parseLineTypes = function() {
		var ltypes = {},
			ltypeName,
			ltype = {},
			length;

		curr = scanner.next();
		while(!groupIs(0, 'ENDTAB')) {

			switch(curr.code) {
				case 2:
					ltype.name = curr.value;
					ltypeName = curr.value;
					curr = scanner.next();
					break;
				case 3:
					ltype.description = curr.value;
					curr = scanner.next();
					break;
				case 73: // Number of elements for this line type (dots, dashes, spaces);
					length = curr.value;
					if(length > 0) ltype.pattern = [];
					curr = scanner.next();
					break;
				case 40: // total pattern length
					ltype.patternLength = curr.value;
					curr = scanner.next();
					break;
				case 49:
					ltype.pattern.push(curr.value);
					curr = scanner.next();
					break;
				case 0:
					if(length > 0 && length !== ltype.pattern.length) console.error('WARNING: lengths do not match on LTYPE pattern');
					ltypes[ltypeName] = ltype;
					ltype = {};
					curr = scanner.next();
					break;
				default:
					curr = scanner.next();
			}
		}

		ltypes[ltypeName] = ltype;
		return ltypes;
	};

	var parseLayers = function() {
		var layers = {},
			layerName,
			layer = {};

		curr = scanner.next();
		while(!groupIs(0, 'ENDTAB')) {

			switch(curr.code) {
				case 2: // layer name
					layer.name = curr.value;
					layerName = curr.value;
					curr = scanner.next();
					break;
				case 62: // color, visibility
					if(curr.value <= 0) layer.hidden = true;
					// TODO 0 and 256 are BYBLOCK and BYLAYER respecitively. Need to handles these values.
					layer.color = getAcadColor(Math.abs(curr.value));
					curr = scanner.next();
					break;
				case 0: // new layer
					layers[layerName] = layer;
					if(curr.value === 'LAYER') {
						layer = {};
						layerName = undefined;
						curr = scanner.next();
					}
					break;
				default:
					// ignored property
					curr = scanner.next();
					break;
			}
		}
		// Note: do not call scanner.next() here,
		//  parseLayerTable() needs the current group
		layers[layerName] = layer;

		return layers;
	};

	/**
	 * Is called after the parser first reads the 0:ENTITIES group. The scanner
	 * should be on the start of the first entity already.
	 * @return {Array} the resulting entities
	 */
	var parseEntities = function(forBlock) {
		var entities = [];

		var endingOnValue = forBlock ? 'ENDBLK' : 'ENDSEC';

		while(true) {
			if(curr.code === 0) {
				if(curr.value === endingOnValue) {
					break;
				}

				// Supported entities here
				if(curr.value === 'LWPOLYLINE') {
					entities.push(parseLWPOLYLINE());
				} else if(curr.value === 'LINE') {
					entities.push(parseLINE());
				} else if(curr.value === 'CIRCLE') {
					entities.push(parseCIRCLE());
				} else if(curr.value === 'ARC') {
					entities.push(parseCIRCLE());
				} else if(curr.value === 'TEXT') {
					entities.push(parseTEXT());
				} else if(curr.value === 'DIMENSION') {
					entities.push(parseDIMENSION());
				} else if(curr.value === 'SOLID') {
					entities.push(parseSOLID());
				} else if(curr.value === 'POINT') {
					entities.push(parsePOINT());
				} else {
					console.log('WARNING: unsupported entity \'' + curr.value + '\'');
					curr = scanner.next();
				}

			} else {
				// ignored lines from unsupported entity
				curr = scanner.next();
			}
		}
		// console.log(util.inspect(entities, { colors: true, depth: null }));
		curr = scanner.next(); // swallow up ENDSEC or ENDBLK
		return entities;
	};

	/**
	 *
	 * @param entity
	 */
	var checkCommonEntityProperties = function(entity) {
		switch(curr.code) {
			case 6:
				entity.lineType = curr.value;
				curr = scanner.next();
				break;
			case 8: // Layer name
				entity.layer = curr.value;
				curr = scanner.next();
				break;
			case 62: // Acad Index Color. 0 inherits ByBlock. 256 inherits ByLayer
				entity.color = curr.value;
				curr = scanner.next();
				break;
			case 420: // TrueColor Color
				entity.color = curr.value;
				curr = scanner.next();
				break;
			default: // ignored attribute
				curr = scanner.next();
				break;
		}
	};


	/**
	 * Parses a 2D or 3D point, returning it as an object with x, y, and
	 * (sometimes) z property if it is 3D. It is assumed the current group
	 * is x of the point being read in, and scanner.next() will return the
	 * y. The parser will determine if there is a z point automatically.
	 * @return {Object} The 2D or 3D point as an object with x, y[, z]
	 */
	var parsePoint = function() {
		var point = {},
			code = curr.code;

		point.x = curr.value;

		code += 10;
		curr = scanner.next();
		if(curr.code != code)
			throw new Error('Expected code for point value to be ' + code +
			' but got ' + curr.code + '.');
		point.y = curr.value;

		code += 10;
		curr = scanner.next();
		if(curr.code != code)
			return point;
		point.z = curr.value;

		curr = scanner.next(); // advance the scanner before returning
		return point;
	};

	var parsePolylineVertices = function(n) {
		if(!n || n <= 0) throw Error('n must be greater than 0 verticies');
		var vertices = [], i, vertex;

		for(i = 0; i < n; i++) {
			vertex = parsePoint();

			// check for bulge. Save it with the start point vertex of the bulge
			if(curr.code === 42 && curr.value !== 0) {
				vertex.bulge = curr.value;
				curr = scanner.next();
			}

			// bulge creates an arc in a polyline
			// 0.0 means straight line.
			// See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E
			vertices.push(vertex);
		}
		return vertices;
	};

	/**
	 * Called when the parser reads the beginning of a new entity,
	 * 0:LWPOLYLINE. Scanner.next() will return the first attribute of the
	 * entity.
	 * @return {Object} the entity parsed
	 */
	var parseLWPOLYLINE = function() {
		var entity = { type: curr.value, vertices: [] },
			numberOfVertices = 0;
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
					entity.shape = (curr.value === 1);
					curr = scanner.next();
					break;
				case 90:
					numberOfVertices = curr.value;
					curr = scanner.next();
					break;
				case 10: // X coordinate of point
					entity.vertices = parsePolylineVertices(numberOfVertices);
					break;
				default:
					checkCommonEntityProperties(entity);
					break;
			}
		}
		return entity;
	};

	/**
	 * Called when the parser reads the beginning of a new entity,
	 * 0:LINE. Scanner.next() will return the first attribute of the
	 * entity.
	 * @return {Object} the entity parsed
	 */
	var parseLINE = function() {
		var entity = { type: curr.value, vertices: [] };
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 10: // X coordinate of point
					entity.vertices = parsePolylineVertices(2);
					break;
				default:
					checkCommonEntityProperties(entity);
					break;
			}
		}
		return entity;
	};

	/**
	 * Used to parse a circle or arc entity.
	 * @return {Object} the entity parsed
	 */
	var parseCIRCLE = function() {
		var entity, endAngle;
		entity = { type: curr.value };
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 10: // X coordinate of point
					entity.center = parsePoint();
					break;
				case 40: // radius
					entity.radius = curr.value;
					curr = scanner.next();
					break;
				case 50: // start angle
					entity.startAngle = Math.PI / 180 * curr.value;
					curr = scanner.next();
					break;
				case 51: // end angle
					endAngle = Math.PI / 180 * curr.value;
					if(endAngle < entity.startAngle)
						entity.angleLength = endAngle + 2 * Math.PI - entity.startAngle;
					else
						entity.angleLength = endAngle - entity.startAngle;
					entity.endAngle = endAngle;
					curr = scanner.next();
					break;
				default: // ignored attribute
					checkCommonEntityProperties(entity);
					break;
			}
		}
		return entity;
	};

	var parseTEXT = function() {
		var entity;
		entity = { type: curr.value };
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;
			switch(curr.code) {
				case 10: // X coordinate of 'first alignment point'
					entity.startPoint = parsePoint();
					break;
				case 11: // X coordinate of 'second alignment point'
					entity.endPoint = parsePoint();
					break;
				case 40: // Text height
					entity.textHeight = curr.value;
					curr = scanner.next();
					break;
				case 1: // Text
					entity.text = curr.value;
					curr = scanner.next();
					break;
				// NOTE: 72 and 73 are meaningless without 11 (second alignment point)
				case 72: // Horizontal alignment
					entity.halign = curr.value;
					curr = scanner.next();
					break;
				case 73: // Vertical alignment
					entity.valign = curr.value;
					curr = scanner.next();
					break;
				default: // check common entity attributes
					checkCommonEntityProperties(entity);
					break;
			}
		}
		return entity;
	};

	var parseDIMENSION = function() {
		var entity;
		entity = { type: curr.value };
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 2: // Referenced block name
					entity.block = curr.value;
					curr = scanner.next();
					break;
				case 10: // X coordinate of 'first alignment point'
					entity.anchorPoint = parsePoint();
					break;
				case 11:
					entity.middleOfText = parsePoint();
					break;
				case 71: // 5 = Middle center
					entity.attachmentPoint = curr.value;
					curr = scanner.next();
					break;
				case 42: // Actual measurement
					entity.actualMeasurement = curr.value;
					curr = scanner.next();
					break;
				case 1: // Text entered by user explicitly
					entity.text = curr.value;
					curr = scanner.next();
					break;
				case 50: // Angle of rotated, horizontal, or vertical dimensions
					entity.angle = curr.value;
					curr = scanner.next();
					break;
				default: // check common entity attributes
					checkCommonEntityProperties(entity);
					break;
			}
		}

		return entity;
	};

	var parseSOLID = function() {
		var entity;
		entity = { type: curr.value };
		entity.points = [];
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 10:
					entity.points[0] = parsePoint();
					break;
				case 11:
					entity.points[1] = parsePoint();
					break;
				case 12:
					entity.points[2] = parsePoint();
					break;
				case 13:
					entity.points[3] = parsePoint();
					break;
				case 210:
					entity.extrusionDirection = parsePoint();
					break;
				default: // check common entity attributes
					checkCommonEntityProperties(entity);
					break;
			}
		}

		return entity;
	};

	var parsePOINT = function() {
		var entity;
		entity = { type: curr.value };
		curr = scanner.next();
		while(curr !== 'EOF') {
			if(curr.code === 0) break;

			switch(curr.code) {
				case 10:
					entity.position = parsePoint();
					break;
				case 39:
					entity.thickness = curr.value;
					break;
				case 210:
					entity.extrusionDirection = parsePoint();
					break;
				default: // check common entity attributes
					checkCommonEntityProperties(entity);
					break;
			}
		}

		return entity;
	};

	parseAll();
	return dxf;
};


function debugCode(curr) {
	return curr.code + ':' + curr.value;
}

/**
 * Returns the truecolor value of the given AutoCad color index value
 * @return {Number} truecolor value as a number
 */
function getAcadColor(index) {
	return AUTO_CAD_COLOR_INDEX[index];
}

module.exports = DxfParser;


/* Notes */
// Code 6 of an entity indicates inheritance of properties (eg. color).
//   BYBLOCK means inherits from block
//   BYLAYER (default) mean inherits from layer
},{"./AutoCadColorIndex":2,"./DxfArrayScanner.js":3,"os":1}]},{},[4])(4)
});