// The Velvet Hour — hand-in program for make.fun's "Make the best stealth
// game" bounty (Node 22, standard library only).
//
// The game itself is the static site in game/ (open game/index.html in a
// desktop browser and play — no build step, no network). This program
// packages it for the judges: it copies game/ and screenshots/ into the
// output directory and writes dossier.json there with buildDossier from
// the vendored make.fun library, which the gate re-runs and compares byte
// for byte, so the caps below are the gate's own and must not drift.
//
// Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copy a folder tree file by file; returns how many files were copied. */
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  let copied = 0;
  for (const name of readdirSync(from)) {
    const source = join(from, name);
    const target = join(to, name);
    if (statSync(source).isDirectory()) copied += copyTree(source, target);
    else {
      copyFileSync(source, target);
      copied += 1;
    }
  }
  return copied;
}

mkdirSync(outputDir, { recursive: true });

// The gate wants 3 or 4 screenshots and refuses the entry without them, so
// fail here with a plain message instead of handing in a doomed package.
const shotNames = existsSync(join(repoRoot, 'screenshots'))
  ? readdirSync(join(repoRoot, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name))
  : [];
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 PNG or JPEG renders of the game; found ${shotNames.length}.`);
}

const gameFiles = copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
const shotFiles = copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`The Velvet Hour handed in: ${gameFiles} game files, ${shotFiles} screenshots, dossier ${dossier.length} bytes.`);
