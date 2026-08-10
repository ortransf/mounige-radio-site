export interface GameLoop {
  start(): void;
  stop(): void;
}

export function createGameLoop(
  update: (dt: number) => void,
  render: () => void,
): GameLoop {
  let isRunning = false;
  let lastTime = 0;
  const maxDt = 0.05;

  function frame(currentTime: number) {
    if (!isRunning) return;

    let dt = (currentTime - lastTime) / 1000;
    if (dt > maxDt) dt = maxDt;
    lastTime = currentTime;

    update(dt);
    render();

    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      lastTime = performance.now();
      requestAnimationFrame(frame);
    },
    stop() {
      isRunning = false;
    },
  };
}
