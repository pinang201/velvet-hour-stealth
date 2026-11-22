// Guard vision: the cone polygon a guard actually sees (its fan of rays
// clipped by walls and cover), whether the player stands inside it, and how
// fast suspicion grows given distance, light, shadow and the player's pace.

import { CONE_HALF_ANGLE, CONE_RANGE, CONE_RAY_STEP, EXPOSURE_BASE } from './config.js';
import { angleDelta, clamp, distance, lineOfSightClear, pointInRect, raycast } from './geometry.js';

/**
 * The visible cone as a polygon: the guard's position followed by one point
 * per ray across the fan, each ray stopped by the first solid it meets.
 */
export function conePolygon(guard, solids) {
  const points = [{ x: guard.x, y: guard.y }];
  const steps = Math.max(6, Math.round((CONE_HALF_ANGLE * 2) / CONE_RAY_STEP));
  for (let index = 0; index <= steps; index += 1) {
    const angle = guard.facing - CONE_HALF_ANGLE + (index / steps) * CONE_HALF_ANGLE * 2;
    const reach = raycast(guard.x, guard.y, angle, CONE_RANGE, solids);
    points.push({ x: guard.x + Math.cos(angle) * reach, y: guard.y + Math.sin(angle) * reach });
  }
  return points;
}

/** Is the player inside this guard's cone, in range, with clear sight? */
export function canSeePlayer(guard, player, solids) {
  const dist = distance(guard.x, guard.y, player.x, player.y);
  if (dist > CONE_RANGE) return false;
  const toward = Math.atan2(player.y - guard.y, player.x - guard.x);
  if (Math.abs(angleDelta(guard.facing, toward)) > CONE_HALF_ANGLE + 0.06) return false;
  return lineOfSightClear(guard.x, guard.y, player.x, player.y, solids);
}

/** 0 in deep shadow, 1 in open floor, above 1 under a lamp. */
export function lightFactorAt(player, level) {
  for (let index = 0; index < level.shadows.length; index += 1) {
    if (pointInRect(player.x, player.y, level.shadows[index])) return 0.32;
  }
  for (let index = 0; index < level.lamps.length; index += 1) {
    const lamp = level.lamps[index];
    if (distance(player.x, player.y, lamp.x, lamp.y) < lamp.r) return 1.5;
  }
  return 1;
}

export function isInShadow(player, level) {
  for (let index = 0; index < level.shadows.length; index += 1) {
    if (pointInRect(player.x, player.y, level.shadows[index])) return true;
  }
  return false;
}

/**
 * Suspicion gained per second while this guard sees the player: nearer is
 * worse, lamplight is worse, shadow and a sneak's low profile help.
 */
export function exposureRate(guard, player, level) {
  const dist = distance(guard.x, guard.y, player.x, player.y);
  const nearness = clamp(1.55 - dist / CONE_RANGE, 0.45, 1.5);
  const posture = player.sneaking ? 0.55 : player.moving ? 1.12 : 0.8;
  return EXPOSURE_BASE * nearness * lightFactorAt(player, level) * posture;
}
