import test from 'node:test';
import assert from 'node:assert/strict';
import { catmullRom, catmullRomChain } from '../src/index.js';

const EPS = 1e-9;

function close(actual, expected, eps = EPS) {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${actual} to be within ${eps} of ${expected}`
  );
}

test('single point returns that point for any t', () => {
  const p = { x: 3, y: -2 };
  close(catmullRom([p], 0).x, 3);
  close(catmullRom([p], 0.5).y, -2);
  close(catmullRom([p], 1).x, 3);
});

test('two points interpolate linearly at the midpoint', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 10, y: 20 };
  const mid = catmullRom([a, b], 0.5);
  close(mid.x, 5);
  close(mid.y, 10);
});

test('control points are hit exactly at their parameters', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: -1 },
    { x: 4, y: 4 },
  ];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const got = catmullRom(points, t);
    close(got.x, points[i].x);
    close(got.y, points[i].y);
  }
});

test('t is clamped to [0, 1]', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 0 },
  ];
  const before = catmullRom(points, -1);
  const after = catmullRom(points, 2);
  close(before.x, points[0].x);
  close(before.y, points[0].y);
  close(after.x, points[2].x);
  close(after.y, points[2].y);
});

test('empty input throws', () => {
  assert.throws(() => catmullRom([], 0.5), TypeError);
  assert.throws(() => catmullRomChain([], 4), TypeError);
});

test('catmullRomChain returns the requested number of points', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 0 },
  ];
  const chain = catmullRomChain(points, 5);
  assert.equal(chain.length, 5);
  close(chain[0].x, 0);
  close(chain[0].y, 0);
  close(chain[4].x, 2);
  close(chain[4].y, 0);
});

test('catmullRomChain rejects count below 2', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
  assert.throws(() => catmullRomChain(points, 1), TypeError);
  assert.throws(() => catmullRomChain(points, 2.5), TypeError);
});

test('collinear points stay on the line', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
  ];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const p = catmullRom(points, t);
    close(p.x, p.y);
  }
});

test('symmetric control points give a symmetric midpoint', () => {
  const points = [
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
  ];
  const mid = catmullRom(points, 0.5);
  close(mid.x, 0);
  close(mid.y, 1);
});

test('chain endpoints equal the first and last control points', () => {
  const points = [
    { x: 5, y: 5 },
    { x: 6, y: 7 },
    { x: 9, y: 1 },
  ];
  const chain = catmullRomChain(points, 9);
  close(chain[0].x, 5);
  close(chain[0].y, 5);
  close(chain[8].x, 9);
  close(chain[8].y, 1);
});
