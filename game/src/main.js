// The Velvet Hour — a top-down stealth game about robbing the Hallowmere
// Museum in the dark. This module is the conductor: it owns the screens
// (title, hall intro, play, caught, cleared), the fixed-step loop, the
// wiring between the player, the wardens, the gem and the exit, and the
// sound cues. The rules live in the modules it imports; here they meet.
//
// With ?shot=cover|shadow|alarm|exit the game instead stages one frozen,
// honest mid-game frame — that is how the entry's screenshots are taken.

import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { playAlarmHorn, playCaught, playEscapeJingle, playGemChime, playGuardStep, playNearMiss, playPlayerStep, wakeAudio } from './audio.js';
import { anyChasing, updateGuard } from './guards.js';
import { drawCaught, drawHallCleared, drawHud, drawIntro, drawTitle } from './hud.js';
import { bindInput, endFrameInput, readMoveInput, wasPressed } from './input.js';
import { distance, pointInRect } from './geometry.js';
import { createPlayer, updatePlayer } from './player.js';
import { drawScene } from './render.js';
import { stageShot } from './shots.js';
import { buildWorld } from './world.js';
import { LEVELS } from './levels.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

let screen = shotName ? 'shot' : 'title';
let world = shotName ? stageShot(shotName) : buildWorld(0);
let muted = false;

bindInput(canvas);
window.addEventListener('keydown', wakeAudio);
canvas.addEventListener('pointerdown', wakeAudio);

function startNight() {
  world = buildWorld(0);
  screen = 'intro';
}

function startHall(index) {
  world = buildWorld(index);
  screen = 'intro';
}

function stepPlay(dt) {
  world.time += dt;
  const stepped = updatePlayer(world.player, dt, readMoveInput(), world);
  if (stepped && !muted) playPlayerStep();

  let caught = false;
  for (const guard of world.guards) {
    const events = updateGuard(guard, dt, world);
    if (events.nearMiss) {
      world.spotted += 1;
      if (!muted) playNearMiss();
    }
    if (events.caught) caught = true;
    // Warden footsteps the player can place by ear.
    if (guard.waiting <= 0) {
      guard.stepTimer -= dt;
      if (guard.stepTimer <= 0) {
        guard.stepTimer = 0.38;
        if (!muted) {
          const bearing = Math.atan2(guard.y - world.player.y, guard.x - world.player.x);
          playGuardStep(distance(guard.x, guard.y, world.player.x, world.player.y), bearing);
        }
      }
    }
  }
  if (caught) {
    screen = 'caught';
    if (!muted) playCaught();
    return;
  }
  if (anyChasing(world.guards)) {
    world.alarmHornTimer -= dt;
    if (world.alarmHornTimer <= 0) {
      world.alarmHornTimer = 0.65;
      if (!muted) playAlarmHorn();
    }
  }

  const { gem, exit } = world.level;
  if (!world.gemTaken && distance(world.player.x, world.player.y, gem.x, gem.y - 14) < 30) {
    world.gemTaken = true;
    world.player.hasGem = true;
    if (!muted) playGemChime();
  }
  if (world.gemTaken && pointInRect(world.player.x, world.player.y, exit)) {
    if (!muted) playEscapeJingle();
    screen = world.levelIndex + 1 >= LEVELS.length ? 'win' : 'clear';
  }
}

function stepScreens() {
  if (wasPressed('m')) muted = !muted;
  if (screen === 'title' && wasPressed('enter')) startNight();
  else if (screen === 'intro' && wasPressed('enter')) screen = 'play';
  else if (screen === 'caught' && wasPressed('r')) {
    const index = world.levelIndex;
    world = buildWorld(index);
    world.player = createPlayer(world.level.start);
    screen = 'play';
  } else if (screen === 'caught' && wasPressed('enter')) startNight();
  else if (screen === 'clear' && wasPressed('enter')) startHall(world.levelIndex + 1);
  else if (screen === 'win' && wasPressed('enter')) startNight();
}

let lastTimestamp = 0;
let accumulator = 0;

function frame(timestamp) {
  const now = timestamp / 1000;
  let dt = Math.min(0.1, now - (lastTimestamp || now));
  lastTimestamp = now;

  if (screen === 'play') {
    accumulator += dt;
    while (accumulator >= STEP) {
      stepPlay(STEP);
      accumulator -= STEP;
      if (screen !== 'play') {
        accumulator = 0;
        break;
      }
    }
  }
  if (screen !== 'shot') stepScreens();

  drawScene(ctx, world, now);
  drawHud(ctx, world);
  if (screen === 'title') drawTitle(ctx, now);
  else if (screen === 'intro') drawIntro(ctx, world);
  else if (screen === 'caught') drawCaught(ctx, world);
  else if (screen === 'clear') drawHallCleared(ctx, world, false);
  else if (screen === 'win') drawHallCleared(ctx, world, true);

  endFrameInput();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
