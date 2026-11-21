# tiny-catmull-rom-spline

Interpolates smooth curves through control points using the Catmull-Rom basis functions.

## Usage

```js
import { catmullRom, catmullRomChain } from './src/index.js';

const points = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 3, y: -1 },
  { x: 4, y: 4 },
];

// A single point at the middle of the whole chain.
const mid = catmullRom(points, 0.5);

// Ten evenly spaced samples along the curve.
const samples = catmullRomChain(points, 10);
```

`catmullRom(points, t)` takes an array of `{ x, y }` objects and a parameter `t`
in `[0, 1]`, and returns one interpolated `{ x, y }` point. `t` is clamped, so
values outside the range return the first or last control point.

`catmullRomChain(points, count)` returns `count` points sampled at even intervals
of `t`. `count` must be an integer of at least 2.

## Why this exists

Catmull-Rom splines are the cheapest way to get a curve that actually passes
through its control points while still looking smooth. Higher-order splines
such as natural cubic splines give C2 continuity but require solving a linear
system and are global: moving one control point changes the whole curve. This
library uses the local Catmull-Rom basis instead, so each segment depends on
four control points and evaluation is a fixed amount of arithmetic. The
trade-off is that the curve is only C1 continuous at the joins, which is fine
for camera rails, animation paths, and similar uses where the eye cannot see
the difference.

## The awkward edge

The endpoints are handled by duplicating the first and last control points.
That keeps the curve inside the convex hull of the duplicated set and makes the
first and last segments well defined, but it also means the tangent at the
endpoints is half of what it would be for a natural spline. If you need a
specific endpoint tangent, add an extra control point beyond the end of your
real data.
