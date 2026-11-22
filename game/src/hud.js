// The top bar and the full-screen cards: the HUD (hall, objective, the alarm
// meter that fills as the wardens' suspicion grows, and the watch state in
// words), plus the title, caught, hall-cleared and final-escape screens.

import { COLORS, HUD_HEIGHT, VIEW_WIDTH } from './config.js';
import { alarmLevel, anyChasing } from './guards.js';

export function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hudBar;
  ctx.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, HUD_HEIGHT - 2, VIEW_WIDTH, 2);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(world.level.name, 18, 20);
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('THE VELVET HOUR', 18, 40);

  // Objective.
  ctx.textAlign = 'center';
  ctx.fillStyle = world.gemTaken ? '#8ff5c0' : COLORS.gem;
  ctx.font = 'bold 16px system-ui, sans-serif';
  const objective = world.gemTaken ? 'The Star is yours — reach the EXIT' : 'Steal the Meridian Star, then reach the EXIT unseen';
  ctx.fillText(objective, VIEW_WIDTH / 2, 21);
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.fillText('WASD / arrows to move · SHIFT to sneak · M to mute', VIEW_WIDTH / 2, 41);

  // Alarm meter and watch state.
  const alarm = alarmLevel(world.guards);
  const chasing = anyChasing(world.guards);
  const meterX = VIEW_WIDTH - 356;
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('ALARM', meterX, 15);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.fillRect(meterX, 24, 200, 12);
  ctx.fillStyle = alarm >= 0.85 || chasing ? COLORS.alarmHigh : alarm >= 0.4 ? COLORS.alarmMid : COLORS.alarmLow;
  ctx.fillRect(meterX, 24, 200 * alarm, 12);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, 24, 200, 12);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = chasing ? COLORS.alarmHigh : alarm >= 0.4 ? COLORS.alarmMid : '#8ff5c0';
  const state = chasing ? 'SPOTTED!' : alarm >= 0.4 ? 'SUSPICIOUS' : alarm > 0.03 ? 'SEEN…' : 'UNSEEN';
  ctx.fillText(state, meterX + 214, 30);
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(world.time), VIEW_WIDTH - 18, 47);
}

export function formatTime(seconds) {
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = String(whole % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

function veil(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, VIEW_WIDTH, 800);
}

function centred(ctx, text, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, VIEW_WIDTH / 2, y);
}

export function drawTitle(ctx, now) {
  veil(ctx, 'rgba(6, 8, 18, 0.72)');
  const flicker = 0.9 + 0.1 * Math.sin(now * 1.7);
  ctx.globalAlpha = flicker;
  centred(ctx, 'THE VELVET HOUR', 218, 'bold 64px Georgia, serif', '#f2d38a');
  ctx.globalAlpha = 1;
  centred(ctx, 'a Hallowmere Museum heist, in the dark', 268, 'italic 20px Georgia, serif', '#c9cede');
  centred(ctx, 'Slip past the wardens, lift the Meridian Star from its pedestal,', 356, '17px system-ui, sans-serif', '#e8e4d8');
  centred(ctx, 'and reach the EXIT before their lamps find you.', 382, '17px system-ui, sans-serif', '#e8e4d8');
  centred(ctx, 'Their cones are their eyes: cross one and suspicion fills — break sight and it fades.', 428, '15px system-ui, sans-serif', '#9aa0b8');
  centred(ctx, 'Crates, cases and statues block their view. Shadow pools hide you; lamplight betrays you.', 454, '15px system-ui, sans-serif', '#9aa0b8');
  centred(ctx, 'WASD / arrow keys — move      SHIFT — sneak (slow, low, quiet)      M — mute', 506, 'bold 15px system-ui, sans-serif', '#e8e4d8');
  centred(ctx, 'Press ENTER to begin the night', 566, 'bold 19px system-ui, sans-serif', '#8ff5c0');
}

export function drawIntro(ctx, world) {
  veil(ctx, 'rgba(6, 8, 18, 0.55)');
  centred(ctx, world.level.name, 330, 'bold 34px Georgia, serif', '#f2d38a');
  centred(ctx, world.level.intro, 380, '17px system-ui, sans-serif', '#e8e4d8');
  centred(ctx, 'Press ENTER', 440, 'bold 16px system-ui, sans-serif', '#8ff5c0');
}

export function drawCaught(ctx, world) {
  veil(ctx, 'rgba(60, 6, 4, 0.55)');
  centred(ctx, 'CAUGHT', 330, 'bold 58px Georgia, serif', '#ff6a55');
  centred(ctx, 'A warden\u2019s hand lands on your shoulder, under the lamps.', 392, '18px system-ui, sans-serif', '#f3d9d2');
  centred(ctx, `You lasted ${formatTime(world.time)} in ${world.level.name}.`, 428, '15px system-ui, sans-serif', '#c9a49b');
  centred(ctx, 'Press R to try this hall again — ENTER restarts the night', 486, 'bold 16px system-ui, sans-serif', '#ffd9d2');
}

export function drawHallCleared(ctx, world, isFinal) {
  veil(ctx, 'rgba(4, 30, 16, 0.6)');
  centred(ctx, isFinal ? 'THE NIGHT IS YOURS' : 'HALL CLEARED', 320, 'bold 48px Georgia, serif', '#8ff5c0');
  centred(
    ctx,
    isFinal
      ? 'The Meridian Star is gone, and the Hallowmere never knew you were there.'
      : 'Out through the service door, unseen. The next hall awaits.',
    378,
    '18px system-ui, sans-serif',
    '#e8f5e9',
  );
  centred(ctx, `Time in this hall: ${formatTime(world.time)} · Times half-seen: ${world.spotted}`, 420, '15px system-ui, sans-serif', '#b9cfc0');
  centred(ctx, isFinal ? 'Press ENTER to play the night again' : 'Press ENTER for the next hall', 478, 'bold 16px system-ui, sans-serif', '#8ff5c0');
}
