# velvet-hour-stealth

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/pinang201/velvet-hour-stealth/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/pinang201/velvet-hour-stealth/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**The Velvet Hour** — a top-down stealth game about robbing the Hallowmere Museum in the dark. You are the Wren: slip past the wardens' sweeping vision cones, hide behind display cases, crates and statues, melt into shadow pools (lamplight betrays you), lift the Meridian Star, and reach the EXIT unseen. Three halls, learnable patrols, a suspicion meter that fills as a cone lingers on you — and fades again if you break sight in time, because a warden who loses you searches your last spot, then settles back to his rounds. Chased down and caught, you simply try the hall again. All art is drawn in code and every sound is synthesized with WebAudio — the wardens' footsteps even pan and fade with their distance, so a careful thief can play by ear. WASD or arrows to move, Shift to sneak, M to mute. The game is plain static files under `game/` (no build step, no network); `main.ts` copies `game/` and `screenshots/` to the output directory and writes the dossier with the vendored make.fun library.

## Run it

```sh
node serve.ts    # play the game at http://localhost:8091
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts    # hand it in
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=cgkpfmz6&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
