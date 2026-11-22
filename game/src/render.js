// All drawing of the play field: the museum floor with its carpet runners,
// shadow pools and lamplight, the vision cones clipped by real sight lines,
// walls and cover (glass cases, crates, statues), the gem and the exit, and
// the actors — red-coated wardens who read clearly against the floor, and
// the Wren in her teal cloak, dimmer when she hugs the shadows.

import { COLORS, FIELD_HEIGHT, FIELD_WIDTH, HUD_HEIGHT, NEAR_MISS_AT } from './config.js';
import { MODE_CHASE } from './guards.js';
import { conePolygon } from './vision.js';

export function drawScene(ctx, world, now) {
  ctx.save();
  ctx.translate(0, HUD_HEIGHT);
  drawFloor(ctx, world.level);
  drawZones(ctx, world.level);
  drawExit(ctx, world.level, now);
  drawGem(ctx, world, now);
  drawCones(ctx, world);
  drawSolids(ctx, world.level);
  for (const guard of world.guards) drawGuard(ctx, guard, now);
  drawPlayer(ctx, world.player, now);
  ctx.restore();
}

function drawFloor(ctx, level) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
  ctx.strokeStyle = COLORS.floorTile;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 64; x < FIELD_WIDTH; x += 64) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, FIELD_HEIGHT);
  }
  for (let y = 64; y < FIELD_HEIGHT; y += 64) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(FIELD_WIDTH, y + 0.5);
  }
  ctx.stroke();
  if (level.carpet) {
    ctx.fillStyle = COLORS.carpet;
    ctx.fillRect(level.carpet.x, level.carpet.y, level.carpet.w, level.carpet.h);
    ctx.strokeStyle = COLORS.carpetEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(level.carpet.x + 2, level.carpet.y + 2, level.carpet.w - 4, level.carpet.h - 4);
  }
  // The museum's outer frame.
  ctx.strokeStyle = COLORS.wallTop;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, FIELD_WIDTH - 10, FIELD_HEIGHT - 10);
  ctx.strokeStyle = COLORS.wallSide;
  ctx.lineWidth = 2;
  ctx.strokeRect(11, 11, FIELD_WIDTH - 22, FIELD_HEIGHT - 22);
}

function drawZones(ctx, level) {
  for (const lamp of level.lamps) {
    const gradient = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, lamp.r);
    gradient.addColorStop(0, COLORS.lightPool);
    gradient.addColorStop(1, 'rgba(255, 196, 92, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, lamp.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 130, 0.85)';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const zone of level.shadows) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = COLORS.shadowEdge;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2);
    ctx.setLineDash([]);
  }
}

function drawExit(ctx, level, now) {
  const exit = level.exit;
  const pulse = 0.75 + 0.25 * Math.sin(now * 2.4);
  ctx.fillStyle = COLORS.exitGlow;
  ctx.globalAlpha = pulse;
  ctx.fillRect(exit.x - 4, exit.y - 4, exit.w + 14, exit.h + 8);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = 'rgba(0, 40, 18, 0.55)';
  const vertical = exit.h > exit.w;
  if (vertical) ctx.fillRect(exit.x + exit.w / 2 - 1.5, exit.y + 6, 3, exit.h - 12);
  else ctx.fillRect(exit.x + 6, exit.y + exit.h / 2 - 1.5, exit.w - 12, 3);
  // The little sign plate, readable from anywhere in the hall.
  const cx = exit.x + exit.w / 2;
  const cy = exit.y + exit.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (vertical) ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#0d3a20';
  ctx.fillRect(-26, -11, 52, 22);
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-26, -11, 52, 22);
  ctx.fillStyle = '#b9ffd2';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', 0, 1);
  ctx.restore();
}

function drawGem(ctx, world, now) {
  const { gem } = world.level;
  // Pedestal.
  ctx.fillStyle = '#3a4160';
  ctx.fillRect(gem.x - 16, gem.y - 6, 32, 22);
  ctx.fillStyle = '#4d5878';
  ctx.fillRect(gem.x - 19, gem.y - 10, 38, 7);
  if (world.gemTaken) {
    ctx.strokeStyle = 'rgba(160, 180, 220, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(gem.x, gem.y - 18, 7, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  const bob = Math.sin(now * 2) * 2;
  ctx.fillStyle = COLORS.gemGlow;
  ctx.beginPath();
  ctx.arc(gem.x, gem.y - 18 + bob, 17 + Math.sin(now * 3) * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.gem;
  ctx.beginPath();
  ctx.moveTo(gem.x, gem.y - 30 + bob);
  ctx.lineTo(gem.x + 9, gem.y - 18 + bob);
  ctx.lineTo(gem.x, gem.y - 6 + bob);
  ctx.lineTo(gem.x - 9, gem.y - 18 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(gem.x, gem.y - 30 + bob);
  ctx.lineTo(gem.x + 4, gem.y - 18 + bob);
  ctx.lineTo(gem.x - 4, gem.y - 18 + bob);
  ctx.closePath();
  ctx.fill();
}

function coneColors(guard) {
  if (guard.mode === MODE_CHASE || guard.suspicion >= 0.85) {
    return { fill: COLORS.coneAlert, edge: COLORS.coneAlertEdge };
  }
  if (guard.suspicion >= NEAR_MISS_AT * 0.5) {
    return { fill: COLORS.coneWary, edge: COLORS.coneWaryEdge };
  }
  return { fill: COLORS.coneCalm, edge: COLORS.coneCalmEdge };
}

function drawCones(ctx, world) {
  for (const guard of world.guards) {
    const polygon = conePolygon(guard, world.solids);
    const colors = coneColors(guard);
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let index = 1; index < polygon.length; index += 1) {
      ctx.lineTo(polygon[index].x, polygon[index].y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawSolids(ctx, level) {
  for (const rect of level.walls) drawWall(ctx, rect);
  for (const item of level.cover) {
    if (item.kind === 'crate') drawCrate(ctx, item);
    else if (item.kind === 'statue') drawStatue(ctx, item);
    else drawCase(ctx, item);
  }
}

function drawWall(ctx, rect) {
  ctx.fillStyle = COLORS.wallSide;
  ctx.fillRect(rect.x, rect.y + 4, rect.w, rect.h - 4);
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h - 4);
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(rect.x, rect.y, rect.w, 4);
}

function drawCrate(ctx, rect) {
  ctx.fillStyle = COLORS.crateDark;
  ctx.fillRect(rect.x, rect.y + 3, rect.w, rect.h - 3);
  ctx.fillStyle = COLORS.crate;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h - 3);
  ctx.strokeStyle = COLORS.crateBrace;
  ctx.lineWidth = 4;
  ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 9);
  ctx.beginPath();
  ctx.moveTo(rect.x + 4, rect.y + 4);
  ctx.lineTo(rect.x + rect.w - 4, rect.y + rect.h - 7);
  ctx.moveTo(rect.x + rect.w - 4, rect.y + 4);
  ctx.lineTo(rect.x + 4, rect.y + rect.h - 7);
  ctx.stroke();
}

function drawCase(ctx, rect) {
  ctx.fillStyle = COLORS.caseFrame;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = COLORS.caseGlass;
  ctx.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
  // A small treasure glinting inside each case.
  ctx.fillStyle = 'rgba(255, 226, 150, 0.9)';
  ctx.beginPath();
  ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(230, 242, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rect.x + 10, rect.y + rect.h - 8);
  ctx.lineTo(rect.x + rect.w * 0.45, rect.y + 6);
  ctx.stroke();
}

function drawStatue(ctx, rect) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.fillStyle = COLORS.pillar;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = COLORS.pillarTop;
  ctx.beginPath();
  ctx.arc(cx, cy, rect.w * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b95b0';
  ctx.beginPath();
  ctx.arc(cx, cy - 4, rect.w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.wallSide;
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
}

function drawGuard(ctx, guard, now) {
  // Coat.
  ctx.fillStyle = COLORS.guardCoat;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.guardTrim;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Shoulders and cap, turned with his facing.
  const fx = Math.cos(guard.facing);
  const fy = Math.sin(guard.facing);
  ctx.fillStyle = COLORS.guardSkin;
  ctx.beginPath();
  ctx.arc(guard.x + fx * 4, guard.y + fy * 4, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d1f1a';
  ctx.beginPath();
  ctx.arc(guard.x + fx * 5, guard.y + fy * 5, 7.5, Math.PI * 0.7, Math.PI * 1.9);
  ctx.lineTo(guard.x + fx * 5, guard.y + fy * 5);
  ctx.fill();
  // Suspicion: a filling ring, then ? and ! marks as it grows.
  if (guard.suspicion > 0.03) {
    ctx.strokeStyle = guard.suspicion >= NEAR_MISS_AT ? COLORS.alarmHigh : COLORS.alarmMid;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y - guard.radius - 9, 6, -Math.PI / 2, -Math.PI / 2 + guard.suspicion * Math.PI * 2);
    ctx.stroke();
  }
  if (guard.mode === MODE_CHASE || guard.suspicion >= NEAR_MISS_AT) {
    drawMark(ctx, guard.x, guard.y - guard.radius - 26, '!', '#ff5a4a', now);
  } else if (guard.suspicion >= 0.18) {
    drawMark(ctx, guard.x, guard.y - guard.radius - 26, '?', '#f2c14e', now);
  }
}

function drawMark(ctx, x, y, text, color, now) {
  const bob = Math.sin(now * 6) * 1.5;
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(5, 6, 14, 0.8)';
  ctx.strokeText(text, x, y + bob);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y + bob);
}

function drawPlayer(ctx, player, now) {
  ctx.save();
  if (player.inShadow) ctx.globalAlpha = 0.78;
  // Cloak.
  ctx.fillStyle = COLORS.playerCloak;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220, 255, 248, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Hood and face, turned with her facing.
  const fx = Math.cos(player.facing);
  const fy = Math.sin(player.facing);
  ctx.fillStyle = COLORS.playerHood;
  ctx.beginPath();
  ctx.arc(player.x + fx * 2, player.y + fy * 2, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.playerSkin;
  ctx.beginPath();
  ctx.arc(player.x + fx * 6, player.y + fy * 6, 4, 0, Math.PI * 2);
  ctx.fill();
  if (player.hasGem) {
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.arc(player.x - fx * 8, player.y - fy * 8, 3.5 + Math.sin(now * 5) * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (player.sneaking) {
    ctx.strokeStyle = 'rgba(160, 240, 225, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
