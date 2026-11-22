// Every sound in the game is synthesized with WebAudio — no audio files.
// Soft taps for footsteps (the player's, and the wardens', placed by distance
// so a careful player can hear where a guard is), a rising sting for a near
// miss, a two-tone alarm while chased, and small chimes for the gem and the
// escape. The context wakes on the first key or click, as browsers require.

let context = null;
let master = null;

export function wakeAudio() {
  if (context) {
    if (context.state === 'suspended') context.resume();
    return;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  context = new Ctor();
  master = context.createGain();
  master.gain.value = 0.5;
  master.connect(context.destination);
}

function tone(freqFrom, freqTo, seconds, type, volume, when = 0) {
  if (!context || !master) return;
  const start = context.currentTime + when;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + seconds);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

function tap(volume, pan, pitch) {
  if (!context || !master) return;
  const start = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const panner = context.createStereoPanner ? context.createStereoPanner() : null;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, start);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, start + 0.07);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
  osc.connect(gain);
  if (panner) {
    panner.pan.value = pan;
    gain.connect(panner).connect(master);
  } else {
    gain.connect(master);
  }
  osc.start(start);
  osc.stop(start + 0.1);
}

/** The player's own step: quiet, centred. */
export function playPlayerStep() {
  tap(0.10, 0, 190);
}

/** A warden's step: volume and pan follow his distance and bearing. */
export function playGuardStep(distanceToPlayer, bearing) {
  const volume = Math.max(0, 0.22 * (1 - distanceToPlayer / 460));
  if (volume <= 0.01) return;
  tap(volume, Math.max(-0.8, Math.min(0.8, Math.sin(bearing) * 0.8)), 120);
}

/** A short rising sting: someone has half-seen you. */
export function playNearMiss() {
  tone(520, 880, 0.16, 'triangle', 0.16);
}

/** The alarm, while a chase is on: two hard tones, repeating is the caller's job. */
export function playAlarmHorn() {
  tone(392, 392, 0.14, 'square', 0.07);
  tone(311, 311, 0.16, 'square', 0.07, 0.16);
}

/** The Meridian Star leaves its pedestal. */
export function playGemChime() {
  tone(1318, 1318, 0.12, 'sine', 0.14);
  tone(1760, 1760, 0.2, 'sine', 0.12, 0.09);
}

/** A low thud for the hand on your shoulder. */
export function playCaught() {
  tone(160, 55, 0.4, 'sawtooth', 0.2);
}

/** A small major arpeggio for a clean escape. */
export function playEscapeJingle() {
  tone(523, 523, 0.12, 'triangle', 0.14);
  tone(659, 659, 0.12, 'triangle', 0.14, 0.11);
  tone(784, 784, 0.22, 'triangle', 0.15, 0.22);
}
