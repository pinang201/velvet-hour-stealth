// The Wren, the thief the player steers: eight-way movement with WASD or the
// arrow keys, Shift to sneak (slow, low, quiet), collision against walls and
// cover, and the small state the rest of the game reads — moving, sneaking,
// whether she stands in shadow, and the noise her footsteps make.

import { PLAYER_RADIUS, PLAYER_SNEAK_SPEED, PLAYER_WALK_SPEED } from './config.js';
import { resolveCircle } from './geometry.js';
import { isInShadow } from './vision.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    radius: PLAYER_RADIUS,
    facing: 0,
    moving: false,
    sneaking: false,
    inShadow: false,
    stepTimer: 0,
    hasGem: false,
  };
}

/**
 * Advance the player one step. `input` is {x, y, sneak} with x/y in -1..1.
 * Returns true on a footstep beat, so the caller can play the sound.
 */
export function updatePlayer(player, dt, input, world) {
  const { level, solids, field } = world;
  player.sneaking = Boolean(input.sneak);
  const length = Math.hypot(input.x, input.y);
  player.moving = length > 0.01;
  if (player.moving) {
    const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
    const nx = input.x / (length || 1);
    const ny = input.y / (length || 1);
    player.x += nx * speed * dt;
    player.y += ny * speed * dt;
    player.facing = Math.atan2(ny, nx);
  }
  resolveCircle(player, solids, field);
  player.inShadow = isInShadow(player, level);

  if (player.moving && !player.sneaking) {
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = 0.34;
      return true;
    }
  } else {
    player.stepTimer = 0.1;
  }
  return false;
}
