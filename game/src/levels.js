// The three halls of the Hallowmere Museum, described as data: solid walls,
// cover (display cases, crates, statues) that blocks sight and movement,
// shadow pools where the thief is harder to see, lamp pools where she is
// easier to see, guard patrols, the gem, the start and the exit.
//
// Coordinates live in field space: 1280 x 744, origin at the field's top
// left, below the HUD bar. Every patrol lane is kept wide and clear of
// solids so a patient player can always slip through, usually two ways.

function wall(x, y, w, h) {
  return { x, y, w, h };
}
function cover(x, y, w, h, kind) {
  return { x, y, w, h, kind };
}
function zone(x, y, w, h) {
  return { x, y, w, h };
}
function lamp(x, y, r) {
  return { x, y, r };
}
function guard(path, speed, wait) {
  return { path, speed, wait };
}

export const LEVELS = [
  {
    name: 'Hall One — The Long Gallery',
    intro: 'Two wardens walk the long lanes. Learn their rhythm, stay low, take the Meridian Star.',
    walls: [wall(370, 0, 22, 78), wall(880, 666, 22, 78)],
    cover: [
      cover(190, 170, 170, 46, 'case'), cover(545, 170, 170, 46, 'case'), cover(900, 170, 170, 46, 'case'),
      cover(190, 470, 170, 46, 'case'), cover(545, 470, 170, 46, 'case'), cover(900, 470, 170, 46, 'case'),
      cover(430, 330, 56, 56, 'crate'), cover(800, 330, 56, 56, 'crate'),
    ],
    shadows: [zone(90, 560, 250, 130), zone(950, 60, 240, 120), zone(470, 596, 340, 108)],
    lamps: [lamp(275, 300, 120), lamp(985, 300, 120), lamp(640, 372, 100)],
    carpet: { x: 0, y: 330, w: 1280, h: 84 },
    guards: [
      guard([[150, 105], [1130, 105]], 60, 1.4),
      guard([[1130, 640], [150, 640]], 60, 1.4),
    ],
    start: { x: 64, y: 372 },
    gem: { x: 1208, y: 372 },
    exit: { x: 0, y: 322, w: 30, h: 100 },
  },
  {
    name: 'Hall Two — The Sculpture Court',
    intro: 'Three wardens now, and one walks the court itself. The statues are your friends.',
    walls: [wall(150, 330, 120, 22), wall(1010, 330, 120, 22)],
    cover: [
      cover(430, 240, 70, 70, 'statue'), cover(780, 240, 70, 70, 'statue'),
      cover(430, 470, 70, 70, 'statue'), cover(780, 470, 70, 70, 'statue'),
      cover(565, 90, 150, 44, 'case'), cover(565, 610, 150, 44, 'case'),
      cover(120, 110, 56, 56, 'crate'), cover(1104, 110, 56, 56, 'crate'),
      cover(120, 578, 56, 56, 'crate'), cover(1104, 578, 56, 56, 'crate'),
    ],
    shadows: [zone(60, 60, 220, 150), zone(1000, 60, 220, 150), zone(60, 534, 220, 150), zone(1000, 534, 220, 150)],
    lamps: [lamp(640, 372, 150), lamp(275, 372, 95), lamp(1005, 372, 95)],
    carpet: null,
    guards: [
      guard([[350, 180], [930, 180], [930, 564], [350, 564]], 66, 0.8),
      guard([[215, 640], [215, 105]], 58, 1.1),
      guard([[1065, 105], [1065, 640]], 58, 1.1),
    ],
    start: { x: 64, y: 372 },
    gem: { x: 640, y: 58 },
    exit: { x: 1250, y: 322, w: 30, h: 100 },
  },
  {
    name: 'Hall Three — The Vault Wing',
    intro: 'Four wardens, quick feet, long lamps. The Star waits in the vault alcove. Vanish.',
    walls: [
      wall(300, 0, 22, 300), wall(300, 444, 22, 300),
      wall(620, 150, 22, 444),
      wall(940, 0, 22, 300), wall(940, 444, 22, 300),
    ],
    cover: [
      cover(390, 180, 150, 44, 'case'), cover(390, 520, 150, 44, 'case'),
      cover(720, 180, 150, 44, 'case'), cover(720, 520, 150, 44, 'case'),
      cover(140, 140, 56, 56, 'crate'), cover(140, 548, 56, 56, 'crate'),
      cover(1060, 120, 52, 52, 'crate'), cover(1060, 572, 52, 52, 'crate'),
      cover(470, 345, 56, 56, 'crate'), cover(760, 345, 56, 56, 'crate'),
    ],
    shadows: [zone(60, 300, 180, 144), zone(1020, 300, 180, 144), zone(380, 620, 200, 90), zone(700, 30, 200, 90)],
    lamps: [lamp(460, 372, 105), lamp(820, 372, 105), lamp(160, 372, 90), lamp(1120, 372, 90)],
    carpet: null,
    guards: [
      guard([[140, 100], [140, 644]], 72, 0.9),
      guard([[560, 100], [560, 644]], 72, 0.9),
      guard([[900, 644], [900, 100]], 72, 0.9),
      guard([[1120, 100], [1120, 644]], 72, 0.9),
    ],
    start: { x: 64, y: 372 },
    gem: { x: 1196, y: 76 },
    exit: { x: 0, y: 622, w: 30, h: 100 },
  },
];

/** Every rect that blocks movement and sight in a level: walls plus cover. */
export function solidsOf(level) {
  return level.walls.concat(level.cover);
}
