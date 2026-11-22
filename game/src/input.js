// Keyboard state: WASD and the arrow keys steer, Shift sneaks, and Enter /
// R / M are read as one-shot presses by the game screens. Also tracks the
// mouse position for players who like to click toward a doorway (the game
// reads `pointer` but never requires it).

const held = new Set();
const pressed = new Set();
const pointer = { x: 0, y: 0, down: false };

export function bindInput(canvas) {
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(event.key.toLowerCase());
    held.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => held.clear());
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    pointer.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('pointerdown', () => {
    pointer.down = true;
  });
  window.addEventListener('pointerup', () => {
    pointer.down = false;
  });
}

/** The movement vector and sneak flag the player update consumes. */
export function readMoveInput() {
  let x = 0;
  let y = 0;
  if (held.has('a') || held.has('arrowleft')) x -= 1;
  if (held.has('d') || held.has('arrowright')) x += 1;
  if (held.has('w') || held.has('arrowup')) y -= 1;
  if (held.has('s') || held.has('arrowdown')) y += 1;
  return { x, y, sneak: held.has('shift') };
}

/** True once per physical press of the named key ('enter', 'r', 'm', ' '). */
export function wasPressed(key) {
  return pressed.has(key);
}

/** Call at the end of each frame so one-shot presses do not repeat. */
export function endFrameInput() {
  pressed.clear();
}

export function getPointer() {
  return pointer;
}
