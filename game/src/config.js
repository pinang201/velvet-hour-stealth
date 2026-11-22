// Shared constants for The Velvet Hour: canvas size, timing, speeds, vision
// and detection tuning, and the palette the renderer paints with. Everything
// else in the game reads its numbers from here so the feel stays consistent.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 800;
export const HUD_HEIGHT = 56;
export const FIELD_WIDTH = VIEW_WIDTH;
export const FIELD_HEIGHT = VIEW_HEIGHT - HUD_HEIGHT;

export const STEP = 1 / 120;

export const PLAYER_RADIUS = 13;
export const PLAYER_WALK_SPEED = 138;
export const PLAYER_SNEAK_SPEED = 76;
export const PLAYER_NOISE_RADIUS = 74;

export const GUARD_RADIUS = 14;
export const GUARD_TURN_RATE = 2.7;
export const GUARD_CHASE_SPEED = 124;
export const GUARD_SEARCH_SPEED = 84;

export const CONE_RANGE = 198;
export const CONE_HALF_ANGLE = 0.58; // radians, about 33 degrees each side
export const CONE_RAY_STEP = 0.045;

export const EXPOSURE_BASE = 0.92; // suspicion per second at factor 1
export const SUSPICION_DECAY = 0.22; // per second while unseen
export const ALERT_AT = 1;
export const NEAR_MISS_AT = 0.55;
export const LOSE_SIGHT_AFTER = 3; // seconds of no contact before a chase ends

export const COLORS = {
  ink: '#0b0e1a',
  floor: '#232839',
  floorTile: '#262c42',
  carpet: '#4a2436',
  carpetEdge: '#6d3549',
  shadow: 'rgba(5, 6, 14, 0.52)',
  shadowEdge: 'rgba(120, 140, 220, 0.25)',
  lightPool: 'rgba(255, 196, 92, 0.13)',
  wall: '#39415f',
  wallTop: '#4d5878',
  wallSide: '#2b3049',
  crate: '#8a6136',
  crateDark: '#6e4b27',
  crateBrace: '#a87c44',
  caseGlass: 'rgba(150, 200, 235, 0.30)',
  caseFrame: '#7d8aa5',
  pillar: '#565f7d',
  pillarTop: '#6b7592',
  exit: '#2fae5f',
  exitGlow: 'rgba(64, 220, 130, 0.35)',
  gem: '#5fe8ff',
  gemGlow: 'rgba(95, 232, 255, 0.45)',
  playerCloak: '#1f7a6d',
  playerHood: '#14524a',
  playerSkin: '#e8c39a',
  guardCoat: '#b3392f',
  guardTrim: '#f2c14e',
  guardSkin: '#e8c39a',
  coneCalm: 'rgba(255, 238, 170, 0.20)',
  coneCalmEdge: 'rgba(255, 238, 170, 0.55)',
  coneWary: 'rgba(255, 166, 66, 0.30)',
  coneWaryEdge: 'rgba(255, 166, 66, 0.8)',
  coneAlert: 'rgba(255, 70, 55, 0.38)',
  coneAlertEdge: 'rgba(255, 70, 55, 0.9)',
  hudBar: '#12152a',
  hudText: '#e8e4d8',
  hudDim: '#9aa0b8',
  alarmLow: '#7dc95f',
  alarmMid: '#f2b13c',
  alarmHigh: '#ef4b3a',
};
