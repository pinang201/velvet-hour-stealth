// Small 2D geometry helpers shared by movement, collision and line of sight:
// rectangles, segments, ray casting against the solid rects of a level, and
// circle-versus-rect resolution that keeps actors out of walls and cover.

export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

/** Shortest signed turn from angle `from` to angle `to`, in (-PI, PI]. */
export function angleDelta(from, to) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

/** Turn `angle` toward `target` by at most `maxStep` radians. */
export function turnToward(angle, target, maxStep) {
  const delta = angleDelta(angle, target);
  if (Math.abs(delta) <= maxStep) return target;
  return angle + Math.sign(delta) * maxStep;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function inflateRect(rect, amount) {
  return { x: rect.x - amount, y: rect.y - amount, w: rect.w + amount * 2, h: rect.h + amount * 2 };
}

/** Does segment (ax, ay)-(bx, by) touch or cross the rect? */
export function segmentHitsRect(ax, ay, bx, by, rect) {
  if (pointInRect(ax, ay, rect) || pointInRect(bx, by, rect)) return true;
  const left = rect.x;
  const right = rect.x + rect.w;
  const top = rect.y;
  const bottom = rect.y + rect.h;
  return (
    segmentsCross(ax, ay, bx, by, left, top, right, top) ||
    segmentsCross(ax, ay, bx, by, right, top, right, bottom) ||
    segmentsCross(ax, ay, bx, by, right, bottom, left, bottom) ||
    segmentsCross(ax, ay, bx, by, left, bottom, left, top)
  );
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = direction(cx, cy, dx, dy, ax, ay);
  const d2 = direction(cx, cy, dx, dy, bx, by);
  const d3 = direction(ax, ay, bx, by, cx, cy);
  const d4 = direction(ax, ay, bx, by, dx, dy);
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

function direction(ax, ay, bx, by, px, py) {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by);
}

/**
 * Cast a ray from (ox, oy) along `angle` up to `maxDist`; return the distance
 * to the nearest solid rect hit, or maxDist when nothing is in the way.
 */
export function raycast(ox, oy, angle, maxDist, solids) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (let index = 0; index < solids.length; index += 1) {
    const hit = rayRect(ox, oy, dx, dy, solids[index]);
    if (hit !== null && hit < best) best = hit;
  }
  return best;
}

function rayRect(ox, oy, dx, dy, rect) {
  let near = 0;
  let far = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < rect.x || ox > rect.x + rect.w) return null;
  } else {
    let t1 = (rect.x - ox) / dx;
    let t2 = (rect.x + rect.w - ox) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    near = Math.max(near, t1);
    far = Math.min(far, t2);
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < rect.y || oy > rect.y + rect.h) return null;
  } else {
    let t1 = (rect.y - oy) / dy;
    let t2 = (rect.y + rect.h - oy) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    near = Math.max(near, t1);
    far = Math.min(far, t2);
  }
  if (far < near || far < 0) return null;
  return near >= 0 ? near : 0;
}

/** Is the straight line between two points free of every solid rect? */
export function lineOfSightClear(ax, ay, bx, by, solids) {
  for (let index = 0; index < solids.length; index += 1) {
    if (segmentHitsRect(ax, ay, bx, by, solids[index])) return false;
  }
  return true;
}

/**
 * Push a circle (an object with x, y, radius) out of every solid rect and
 * clamp it inside the field. Mutates and returns the circle.
 */
export function resolveCircle(circle, solids, field) {
  for (let pass = 0; pass < 2; pass += 1) {
    for (let index = 0; index < solids.length; index += 1) {
      pushOutOfRect(circle, solids[index]);
    }
  }
  circle.x = clamp(circle.x, field.x + circle.radius, field.x + field.w - circle.radius);
  circle.y = clamp(circle.y, field.y + circle.radius, field.y + field.h - circle.radius);
  return circle;
}

function pushOutOfRect(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= circle.radius * circle.radius) return;
  if (distSq > 1e-9) {
    const dist = Math.sqrt(distSq);
    circle.x = nearestX + (dx / dist) * circle.radius;
    circle.y = nearestY + (dy / dist) * circle.radius;
    return;
  }
  // Centre inside the rect: leave by the shallowest side.
  const left = circle.x - rect.x;
  const right = rect.x + rect.w - circle.x;
  const top = circle.y - rect.y;
  const bottom = rect.y + rect.h - circle.y;
  const shallowest = Math.min(left, right, top, bottom);
  if (shallowest === left) circle.x = rect.x - circle.radius;
  else if (shallowest === right) circle.x = rect.x + rect.w + circle.radius;
  else if (shallowest === top) circle.y = rect.y - circle.radius;
  else circle.y = rect.y + rect.h + circle.radius;
}
