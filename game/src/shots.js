// The screenshot scenes behind ?shot=cover|shadow|alarm|exit. Each stages a
// real world — the same builders and rules as play — with the actors placed
// in honest mid-game moments, so the frame is the game exactly as it plays:
//   cover  — Hall One at full stretch: two cones sweeping the lanes, the
//            Wren mid-crossing, the Star and the EXIT both in frame.
//   shadow — Hall Two: the Wren pressed into a shadow pool behind a crate
//            while a warden's cone edges over her, suspicion rising.
//   alarm  — Hall One, the near miss: cone gone red, alarm nearly full,
//            the Wren breaking away into the shadow pool.
//   exit   — Hall Two, the Star already lifted, the last cone between the
//            Wren and the service door.

import { buildWorld } from './world.js';

function place(guard, x, y, facing, suspicion = 0) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.suspicion = suspicion;
  guard.waiting = 0;
  guard.lastSeen = null;
}

export function stageShot(name) {
  if (name === 'shadow') {
    const world = buildWorld(1);
    place(world.guards[0], 700, 180, 0);
    place(world.guards[1], 215, 296, -Math.PI / 2, 0.42);
    place(world.guards[2], 1065, 430, Math.PI / 2);
    world.player.x = 205;
    world.player.y = 185;
    world.player.facing = -0.5;
    world.time = 74;
    return world;
  }
  if (name === 'alarm') {
    const world = buildWorld(0);
    place(world.guards[0], 300, 105, 0);
    place(world.guards[1], 645, 615, Math.atan2(606 - 615, 520 - 645), 0.86);
    world.player.x = 520;
    world.player.y = 606;
    world.player.facing = Math.PI;
    world.time = 121;
    world.spotted = 2;
    return world;
  }
  if (name === 'exit') {
    const world = buildWorld(1);
    place(world.guards[0], 500, 564, Math.PI);
    place(world.guards[1], 215, 205, Math.PI / 2);
    place(world.guards[2], 1065, 255, Math.PI / 2, 0.1);
    world.gemTaken = true;
    world.player.hasGem = true;
    world.player.x = 1178;
    world.player.y = 372;
    world.player.facing = 0;
    world.time = 168;
    world.spotted = 1;
    return world;
  }
  // 'cover' and anything else: the wide Hall One scene.
  const world = buildWorld(0);
  place(world.guards[0], 700, 105, 0);
  place(world.guards[1], 560, 640, Math.PI);
  world.player.x = 640;
  world.player.y = 372;
  world.player.facing = 0.4;
  world.time = 43;
  return world;
}
