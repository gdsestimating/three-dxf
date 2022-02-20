import * as THREE from 'three';
import { IVertex } from 'dxf-parser/dist/entities/lwpolyline';
import { IVertexEntity } from 'dxf-parser';
export interface IVector2 {
  x: number;
  y: number;
}

/**
 * Returns the angle in radians of the vector (p1,p2). In other words, imagine
 * putting the base of the vector at coordinates (0,0) and finding the angle
 * from vector (1,0) to (p1,p2).
 * @param  {Object} p1 start point of the vector
 * @param  {Object} p2 end point of the vector
 * @return {Number} the angle
 */
export const angle2 = (p1: IVector2, p2: IVector2) => {
  const v1 = new THREE.Vector2(p1.x, p1.y);
  const v2 = new THREE.Vector2(p2.x, p2.y);
  v2.sub(v1); // sets v2 to be our chord
  v2.normalize();
  if (v2.y < 0) return -Math.acos(v2.x);
  return Math.acos(v2.x);
};

export const polar = (point: IVector2, distance: number, angle: number) => {
  const result = { x: 0, y: 0 };
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
export const getBulgeCurvePoints = (
  startPoint: IVertex | IVertexEntity,
  endPoint: IVertexEntity | IVertex | THREE.Vector3,
  bulge: number,
  segments?: number
) => {
  const p0 = startPoint
    ? new THREE.Vector2(startPoint.x, startPoint.y)
    : new THREE.Vector2(0, 0);
  const p1 = endPoint
    ? new THREE.Vector2(endPoint.x, endPoint.y)
    : new THREE.Vector2(1, 0);
  bulge = bulge || 1;

  const angle = 4 * Math.atan(bulge);
  const radius = p0.distanceTo(p1) / 2 / Math.sin(angle / 2);
  const center = polar(
    startPoint,
    radius,
    angle2(p0, p1) + (Math.PI / 2 - angle / 2)
  );

  segments =
    segments || Math.max(Math.abs(Math.ceil(angle / (Math.PI / 18))), 6); // By default want a segment roughly every 10 degrees
  const startAngle = angle2(center, p0);
  const thetaAngle = angle / segments;

  const vertices = [];

  vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

  for (let i = 1; i <= segments - 1; i++) {
    const vertex = polar(center, Math.abs(radius), startAngle + thetaAngle * i);
    vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
  }

  return vertices;
};

// This is based on the example code found from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
// Example code on MDN is public domain or CC0 (your preference) or MIT depending when the
// example code was added:
// https://developer.mozilla.org/en-US/docs/MDN/About

/**
 *
 * @param value
 * @param exp
 * @returns
 */
export const round10 = (value: number, exp: number | undefined) => {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  let valueStr = value.toString().split('e');
  value = Math.round(
    +(valueStr[0] + 'e' + (valueStr[1] ? +valueStr[1] - exp : -exp))
  );
  // Shift back
  valueStr = value.toString().split('e');
  return +(valueStr[0] + 'e' + (valueStr[1] ? +valueStr[1] + exp : exp));
};

/**
 * Copied and ported to code standard as the b-spline library is not maintained any longer.
 * Source:
 * https://github.com/thibauts/b-spline
 * Copyright (c) 2015 Thibaut Séguy <thibaut.seguy@gmail.com>
 */
export const bSpline = (
  t: number,
  degree: number,
  points: number[][],
  knots?: number[],
  weights?: number[]
) => {
  const n = points.length; // points count
  const d = points[0].length; // point dimensionality

  if (t < 0 || t > 1) {
    throw new Error('t out of bounds [0,1]: ' + t);
  }
  if (degree < 1) throw new Error('degree must be at least 1 (linear)');
  if (degree > n - 1)
    throw new Error('degree must be less than or equal to point count - 1');

  if (!weights) {
    // build weight vector of length [n]
    weights = [];
    for (let i = 0; i < n; i++) {
      weights[i] = 1;
    }
  }

  if (!knots) {
    // build knot vector of length [n + degree + 1]
    knots = [];
    for (let i = 0; i < n + degree + 1; i++) {
      knots[i] = i;
    }
  } else {
    if (knots.length !== n + degree + 1)
      throw new Error('bad knot vector length');
  }

  const domain = [degree, knots.length - 1 - degree];

  // remap t to the domain where the spline is defined
  const low = knots[domain[0]];
  const high = knots[domain[1]];
  t = t * (high - low) + low;

  // Clamp to the upper &  lower bounds instead of
  // throwing an error like in the original lib
  // https://github.com/bjnortier/dxf/issues/28
  t = Math.max(t, low);
  t = Math.min(t, high);

  // find s (the spline segment) for the [t] value provided
  let s;
  for (s = domain[0]; s < domain[1]; s++) {
    if (t >= knots[s] && t <= knots[s + 1]) {
      break;
    }
  }

  // convert points to homogeneous coordinates
  const v: number[][] = [];
  for (let i = 0; i < n; i++) {
    v[i] = [];
    for (let j = 0; j < d; j++) {
      v[i][j] = points[i][j] * weights[i];
    }
    v[i][d] = weights[i];
  }

  // l (level) goes from 1 to the curve degree + 1
  let alpha;
  for (let l = 1; l <= degree + 1; l++) {
    // build level l of the pyramid
    for (let i = s; i > s - degree - 1 + l; i--) {
      alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);

      // interpolate each component
      for (let j = 0; j < d + 1; j++) {
        v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
      }
    }
  }

  // convert back to cartesian and return
  const result = [];
  for (let i = 0; i < d; i++) {
    result[i] = round10(v[s][i] / v[s][d], -9);
  }
  return result;
};
