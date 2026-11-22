// The wardens: patrol between waypoints on learnable loops, pause and look
// around at each stop, grow suspicious when they see or half-hear the thief,
// give chase at full alarm, search the last place they saw her, then settle
// back to their rounds — so a player who breaks sight can recover.

import {
  ALERT_AT, GUARD_CHASE_SPEED, GUARD_RADIUS, GUARD_SEARCH_SPEED, GUARD_TURN_RATE,
  LOSE_SIGHT_AFTER, NEAR_MISS_AT, PLAYER_NOISE_RADIUS, SUSPICION_DECAY,
} from './config.js';
import { angleDelta, clamp, distance, resolveCircle, turnToward } from './geometry.js';
import { canSeePlayer, exposureRate } from './vision.js';

export const MODE_PATROL = 'patrol';
export const MODE_CHASE = 'chase';
export const MODE_SEARCH = 'search';

export function createGuard(definition) {
  const first = definition.path[0];
  const second = definition.path[1] ?? first;
  return {
    x: first[0],
    y: first[1],
    radius: GUARD_RADIUS,
    facing: Math.atan2(second[1] - first[1], second[0] - first[0]),
    path: definition.path,
    speed: definition.speed,
    waitTime: definition.wait,
    targetIndex: 1 % definition.path.length,
    waiting: 0,
    sweepBase: 0,
    suspicion: 0,
    mode: MODE_PATROL,
    lastSeen: null,
    lostFor: 0,
    nearMissPlayed: false,
    stepTimer: Math.random() * 0.4,
  };
}

/**
 * Advance one guard. Returns events the game cares about:
 * { sawPlayer, nearMiss, caught } — the caller plays sounds and ends runs.
 */
export function updateGuard(guard, dt, world) {
  const events = { sawPlayer: false, nearMiss: false, caught: false };
  const { player, level, solids, field } = world;

  const sees = canSeePlayer(guard, player, solids);
  if (sees) {
    events.sawPlayer = true;
    guard.lastSeen = { x: player.x, y: player.y };
    guard.lostFor = 0;
    guard.suspicion = clamp(guard.suspicion + exposureRate(guard, player, level) * dt, 0, 1);
    if (guard.suspicion >= NEAR_MISS_AT && !guard.nearMissPlayed) {
      guard.nearMissPlayed = true;
      events.nearMiss = true;
    }
    if (guard.suspicion >= ALERT_AT) guard.mode = MODE_CHASE;
  } else {
    guard.lostFor += dt;
    if (guard.mode === MODE_PATROL) {
      guard.suspicion = clamp(guard.suspicion - SUSPICION_DECAY * dt, 0, 1);
      if (guard.suspicion < NEAR_MISS_AT * 0.6) guard.nearMissPlayed = false;
    }
  }

  // Half-heard footsteps: a running thief nearby turns a patrol guard's head.
  if (guard.mode === MODE_PATROL && player.moving && !player.sneaking) {
    if (distance(guard.x, guard.y, player.x, player.y) < PLAYER_NOISE_RADIUS + 26) {
      const toward = Math.atan2(player.y - guard.y, player.x - guard.x);
      guard.facing = turnToward(guard.facing, toward, GUARD_TURN_RATE * 0.7 * dt);
      guard.suspicion = clamp(guard.suspicion + 0.3 * dt, 0, 0.85);
    }
  }

  if (guard.mode === MODE_CHASE) stepChase(guard, dt, world, events);
  else if (guard.mode === MODE_SEARCH) stepSearch(guard, dt, world);
  else stepPatrol(guard, dt, world);

  resolveCircle(guard, solids, field);
  guard.stepTimer -= dt;
  return events;
}

function moveToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const wanted = Math.atan2(dy, dx);
  guard.facing = turnToward(guard.facing, wanted, GUARD_TURN_RATE * dt);
  const step = Math.min(dist, speed * dt);
  // Walk where he faces once roughly aligned, so turns read as turns.
  const alignment = Math.max(0.25, Math.cos(angleDelta(guard.facing, wanted)));
  guard.x += Math.cos(guard.facing) * step * alignment;
  guard.y += Math.sin(guard.facing) * step * alignment;
  return dist <= Math.max(4, speed * dt);
}

function stepPatrol(guard, dt, world) {
  if (guard.waiting > 0) {
    guard.waiting -= dt;
    // Look around while paused: a slow sweep either side of the base facing.
    const sweep = Math.sin((guard.waitTime - guard.waiting) * 2.4) * 0.65;
    guard.facing = turnToward(guard.facing, guard.sweepBase + sweep, GUARD_TURN_RATE * 0.8 * dt);
    return;
  }
  const target = guard.path[guard.targetIndex];
  if (moveToward(guard, target[0], target[1], guard.speed, dt)) {
    guard.targetIndex = (guard.targetIndex + 1) % guard.path.length;
    guard.waiting = guard.waitTime;
    guard.sweepBase = guard.facing;
  }
}

function stepChase(guard, dt, world, events) {
  const { player } = world;
  const goal = guard.lastSeen ?? { x: player.x, y: player.y };
  moveToward(guard, goal.x, goal.y, GUARD_CHASE_SPEED, dt);
  if (distance(guard.x, guard.y, player.x, player.y) < guard.radius + player.radius + 4) {
    events.caught = true;
    return;
  }
  if (guard.lostFor > LOSE_SIGHT_AFTER) {
    guard.mode = MODE_SEARCH;
    guard.suspicion = 0.45;
    guard.nearMissPlayed = false;
    guard.waiting = 1.6; // search pause: look around at the last-seen spot
    guard.sweepBase = guard.facing;
  }
}

function stepSearch(guard, dt, world) {
  if (guard.waiting > 0) {
    guard.waiting -= dt;
    const sweep = Math.sin((1.6 - guard.waiting) * 3.1) * 0.9;
    guard.facing = turnToward(guard.facing, guard.sweepBase + sweep, GUARD_TURN_RATE * dt);
    if (guard.waiting <= 0) {
      guard.mode = MODE_PATROL;
      guard.suspicion = clamp(guard.suspicion - 0.2, 0, 1);
    }
    return;
  }
  if (guard.lastSeen && moveToward(guard, guard.lastSeen.x, guard.lastSeen.y, GUARD_SEARCH_SPEED, dt)) {
    guard.waiting = 1.6;
    guard.sweepBase = guard.facing;
  }
  if (guard.suspicion >= ALERT_AT) guard.mode = MODE_CHASE;
}

/** The loudest suspicion across the watch: what the HUD alarm bar shows. */
export function alarmLevel(guards) {
  let level = 0;
  for (let index = 0; index < guards.length; index += 1) {
    if (guards[index].suspicion > level) level = guards[index].suspicion;
  }
  return level;
}

export function anyChasing(guards) {
  return guards.some((guard) => guard.mode === MODE_CHASE);
}
