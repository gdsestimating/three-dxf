import round10 from './round10'

/**
 * Copied and ported to code standard as the b-spline library is not maintained any longer.
 * Source:
 * https://github.com/thibauts/b-spline
 * Copyright (c) 2015 Thibaut Séguy <thibaut.seguy@gmail.com>
 */
export default (t, degree, points, knots, weights) => {
  const n = points.length // points count
  const d = points[0].length // point dimensionality

  if ((t < 0) || (t > 1)) {
    throw new Error('t out of bounds [0,1]: ' + t)
  }
  if (degree < 1) throw new Error('degree must be at least 1 (linear)')
  if (degree > (n - 1)) throw new Error('degree must be less than or equal to point count - 1')

  if (!weights) {
    // build weight vector of length [n]
    weights = []
    for (let i = 0; i < n; i++) {
      weights[i] = 1
    }
  }

  if (!knots) {
    // build knot vector of length [n + degree + 1]
    knots = []
    for (let i = 0; i < n + degree + 1; i++) {
      knots[i] = i
    }
  } else {
    if (knots.length !== n + degree + 1) throw new Error('bad knot vector length')
  }

  const domain = [
    degree,
    knots.length - 1 - degree
  ]

  // remap t to the domain where the spline is defined
  const low = knots[domain[0]]
  const high = knots[domain[1]]
  t = t * (high - low) + low

  // Clamp to the upper &  lower bounds instead of
  // throwing an error like in the original lib
  // https://github.com/bjnortier/dxf/issues/28
  t = Math.max(t, low)
  t = Math.min(t, high)

  // find s (the spline segment) for the [t] value provided
  let s
  for (s = domain[0]; s < domain[1]; s++) {
    if (t >= knots[s] && t <= knots[s + 1]) {
      break
    }
  }

  // convert points to homogeneous coordinates
  const v = []
  for (let i = 0; i < n; i++) {
    v[i] = []
    for (let j = 0; j < d; j++) {
      v[i][j] = points[i][j] * weights[i]
    }
    v[i][d] = weights[i]
  }

  // l (level) goes from 1 to the curve degree + 1
  let alpha
  for (let l = 1; l <= degree + 1; l++) {
    // build level l of the pyramid
    for (let i = s; i > s - degree - 1 + l; i--) {
      alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i])

      // interpolate each component
      for (let j = 0; j < d + 1; j++) {
        v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j]
      }
    }
  }

  // convert back to cartesian and return
  const result = []
  for (let i = 0; i < d; i++) {
    result[i] = round10(v[s][i] / v[s][d], -9)
  }
  return result
}