// Builds the live world for a level: the player at her start, a warden on
// each patrol, and the bookkeeping the loop keeps (time, times half-seen,
// whether the Star is off its pedestal). Used by the game and by the
// screenshot scenes, so both play by exactly the same setup.

import { FIELD_HEIGHT, FIELD_WIDTH } from './config.js';
import { createGuard } from './guards.js';
import { LEVELS, solidsOf } from './levels.js';
import { createPlayer } from './player.js';

export const FIELD = { x: 0, y: 0, w: FIELD_WIDTH, h: FIELD_HEIGHT };

export function buildWorld(levelIndex) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    level,
    solids: solidsOf(level),
    field: FIELD,
    player: createPlayer(level.start),
    guards: level.guards.map((definition) => createGuard(definition)),
    gemTaken: false,
    time: 0,
    spotted: 0,
    alarmHornTimer: 0,
  };
}
