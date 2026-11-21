/**
 * Catmull-Rom spline interpolation.
 *
 * The spline is defined by a list of control points. The curve passes through
 * every interior control point. The first and last segments are handled by
 * duplicating the endpoints, which gives the standard "clamped" behaviour.
 *
 * WHY: Catmull-Rom is a local interpolating spline, so each segment depends on
 * only four points. That makes it cheap to evaluate and easy to reason about,
 * at the cost of not being C2 continuous at the joins. For smooth animation
 * paths and camera rails the C1 continuity is usually enough.
 */

/**
 * Evaluate the Catmull-Rom basis for a single segment.
 *
 * @param {number} p0 - Control point before the segment start.
 * @param {number} p1 - Segment start point.
 * @param {number} p2 - Segment end point.
 * @param {number} p3 - Control point after the segment end.
 * @param {number} t - Parameter in [0, 1].
 * @returns {number} Interpolated value.
 */
function basis(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  // Standard Catmull-Rom coefficients (tension 0.5).
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

/**
 * Interpolate a single coordinate through a chain of points.
 *
 * @param {number[]} values - Control values along one axis.
 * @param {number} t - Global parameter in [0, 1] across the whole chain.
 * @returns {number} Interpolated value.
 */
function interpolateAxis(values, t) {
  const n = values.length;
  if (n === 0) return 0;
  if (n === 1) return values[0];

  const segments = n - 1;
  const clamped = t <= 0 ? 0 : t >= 1 ? 1 : t;
  let scaled = clamped * segments;
  let index = Math.floor(scaled);
  let local = scaled - index;

  // At t === 1 we would land on the last control point, which is the end of
  // the last segment. Clamp the index so we never read past the array.
  if (index >= segments) {
    index = segments - 1;
    local = 1;
  }

  const p0 = values[index === 0 ? 0 : index - 1];
  const p1 = values[index];
  const p2 = values[index + 1];
  const p3 = values[index + 2 < n ? index + 2 : n - 1];

  return basis(p0, p1, p2, p3, local);
}

/**
 * Interpolate a smooth curve through 2D control points.
 *
 * @param {{x: number, y: number}[]} points - Control points, at least one.
 * @param {number} t - Parameter in [0, 1] across the whole chain.
 * @returns {{x: number, y: number}} Interpolated point.
 */
export function catmullRom(points, t) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new TypeError('catmullRom requires a non-empty array of points');
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x: interpolateAxis(xs, t),
    y: interpolateAxis(ys, t),
  };
}

/**
 * Produce `count` evenly spaced points along the spline.
 *
 * @param {{x: number, y: number}[]} points - Control points.
 * @param {number} count - Number of samples, at least 2.
 * @returns {{x: number, y: number}[]} Sampled points.
 */
export function catmullRomChain(points, count) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new TypeError('catmullRomChain requires a non-empty array of points');
  }
  if (!Number.isInteger(count) || count < 2) {
    throw new TypeError('catmullRomChain requires count >= 2');
  }
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = catmullRom(points, i / (count - 1));
  }
  return out;
}
