import type { Sprite } from './types.js';

export function rectSprite(color: string): Sprite {
  return (ctx, x, y, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
}

export function imageSprite(img: HTMLImageElement): Sprite {
  return (ctx, x, y, w, h) => {
    ctx.drawImage(img, x, y, w, h);
  };
}

export function canvasIconSprite(kind: 'book' | 'film' | 'speech', color: string): Sprite {
  return (ctx, x, y, w, h) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (kind === 'book') {
      const bw = w * 0.7;
      const bh = h * 0.9;
      ctx.fillRect(x + (w - bw) / 2, y + (h - bh) / 2, bw, bh);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + (h - bh) / 2);
      ctx.lineTo(x + w / 2, y + (h + bh) / 2);
      ctx.stroke();
    } else if (kind === 'film') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy - r * 0.5, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.5, cy - r * 0.5, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.5, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'speech') {
      const sw = w * 0.8;
      const sh = h * 0.6;
      const px = x + (w - sw) / 2;
      const py = y + (h - sh) / 2;
      ctx.beginPath();
      ctx.roundRect(px, py, sw, sh, [4]);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + sw * 0.3, py + sh);
      ctx.lineTo(px + sw * 0.2, py + sh + 8);
      ctx.lineTo(px + sw * 0.15, py + sh);
      ctx.fill();
    }

    ctx.restore();
  };
}
