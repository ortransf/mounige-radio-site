export interface CanvasSetup {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export function setupCanvas(canvas: HTMLCanvasElement, wrapper: HTMLElement): CanvasSetup {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d')!;

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.scale(dpr, dpr);
  }

  resize();

  const observer = new ResizeObserver(() => resize());
  observer.observe(wrapper);

  return {
    ctx,
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  };
}
