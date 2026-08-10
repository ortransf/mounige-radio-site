export interface InputState {
  isDown(code: string): boolean;
  destroy(): void;
}

export function createInputState(): InputState {
  const pressed = new Set<string>();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      pressed.add(e.code);
      e.preventDefault();
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    pressed.delete(e.code);
  }

  function handlePointerDown() {
    pressed.add('Tap');
  }

  function handlePointerUp() {
    pressed.delete('Tap');
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointerup', handlePointerUp);

  return {
    isDown(code: string): boolean {
      return (
        pressed.has(code) ||
        (code === 'Jump' && (pressed.has('Space') || pressed.has('ArrowUp') || pressed.has('Tap')))
      );
    },
    destroy() {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    },
  };
}
