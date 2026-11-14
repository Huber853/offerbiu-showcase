// 海面航程：小船向前航行时，开发历程按时间顺序在背景中浮现、靠近、再离去。
// 只使用 timeline 里已有的日期、标题、描述，不新增事件，也不展示内部代号。
import { C, pixelText, pixelTextWidth } from './pixel';
import type { Milestone } from './data/timeline';

export const VOYAGE_SPEED = 0.40;
const GAP = 240;
const LEAD = 190;
const OPEN = 320;

const TAG_COL: Record<string, string> = {
  起点: C.gold,
  提交: C.brand,
  文档: '#cfd6ff',
  功能: '#4fbf8f',
  安全: C.coral,
  设计: '#9b6cff',
};

export interface VoyageView {
  LW: number;
  LH: number;
  mobile: boolean;
  horizon: number;
  base: number;
  boatX: number;
  surf: (x: number) => number;
}

interface Board {
  ev: Milestone;
  icon: HTMLCanvasElement;
  mid: HTMLCanvasElement;
  near: HTMLCanvasElement;
  narrow: HTMLCanvasElement;
  full: HTMLCanvasElement;
}

const glyphW = (ch: string) => (/[^\x00-\x7F]/.test(ch) ? 12 : 6);
const wrapText = (g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) => {
  const widthOf = (s: string) => {
    const m = g.measureText(s).width;
    return m > 1 ? m : [...s].reduce((w, ch) => w + glyphW(ch), 0);
  };
  const fits = (s: string) => widthOf(s) <= maxW;
  const lines: string[] = [];
  let line = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const trial = line + chars[i];
    if (fits(trial) || !line) { line = trial; continue; }
    lines.push(line);
    line = chars[i];
    if (lines.length >= maxLines - 1) {
      const rest = line + chars.slice(i + 1).join('');
      if (fits(rest)) { lines.push(rest); return lines; }
      let cut = rest;
      while (cut.length && !fits(cut + '…')) cut = cut.slice(0, -1);
      lines.push((cut || rest.slice(0, 1)) + '…');
      return lines;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const mk = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g] as const;
};

// 把填充文字的抗锯齿收成实心像素，放大后仍然锐利
const harden = (g: CanvasRenderingContext2D, w: number, h: number) => {
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) d[i + 3] = d[i + 3] < 140 ? 0 : 255;
  g.putImageData(id, 0, 0);
};

const pixelBox = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, edge = C.ink) => {
  g.fillStyle = edge; g.fillRect(x, y, w, h);
  g.fillStyle = fill; g.fillRect(x + 1, y + 1, w - 2, h - 2);
};

const drawBuoy = (g: CanvasRenderingContext2D, cx: number, y: number, col: string) => {
  g.fillStyle = C.ink; g.fillRect(cx - 2, y, 5, 2); g.fillRect(cx - 1, y + 2, 3, 3);
  g.fillStyle = col; g.fillRect(cx - 1, y, 3, 2);
  g.fillStyle = '#b07a4a'; g.fillRect(cx, y + 2, 1, 3);
  g.fillStyle = C.white; g.fillRect(cx - 1, y, 1, 1);
};

const shortDate = (d: string) => (d.length >= 10 ? d.slice(5) : d);

const FONT = '12px FusionPixel, "Microsoft YaHei", monospace';

const paintBoard = (ev: Milestone, kind: 'date' | 'title' | 'full', titleMax = 84) => {
  const tagCol = TAG_COL[ev.tag] ?? C.brandHi;
  const g0 = document.createElement('canvas').getContext('2d')!;
  g0.font = FONT;
  const titles = kind === 'date' ? [] : wrapText(g0, ev.title, titleMax, 2);
  const descs = kind === 'full' ? wrapText(g0, ev.desc, 84, 1) : [];
  const date = shortDate(ev.date);
  const dateW = pixelTextWidth(date) + 1;
  const textW = kind === 'date' ? dateW : titleMax;
  const tw = 10 + textW + 6;
  const th = 6 + 8 + titles.length * 12 + (descs.length ? 3 + descs.length * 12 : 0) + 5 + 8;
  const [c, g] = mk(tw, th);
  g.font = FONT;
  g.textBaseline = 'top';
  pixelBox(g, 0, 0, tw, th - 7, '#5e3a24');
  pixelBox(g, 2, 2, tw - 4, th - 11, '#fff4d8');
  g.fillStyle = tagCol; g.fillRect(2, 2, 3, th - 11);
  g.fillStyle = C.gold; g.fillRect(3, 3, 1, 1); g.fillRect(tw - 5, 3, 1, 1);
  pixelText(g, date, 8, 5, C.goldDk);
  pixelText(g, date, 7, 4, C.gold);
  let y = 14;
  g.fillStyle = C.ink;
  for (const line of titles) { g.fillText(line, 8, y); y += 12; }
  if (descs.length) {
    y += 1;
    g.fillStyle = '#c9b48a';
    g.fillRect(8, y, tw - 16, 1);
    y += 3;
    g.fillStyle = '#3a3190';
    for (const line of descs) { g.fillText(line, 8, y); y += 12; }
  }
  drawBuoy(g, Math.floor(tw / 2), th - 7, tagCol);
  harden(g, tw, th);
  return c;
};

const paintIcon = (ev: Milestone) => {
  const col = TAG_COL[ev.tag] ?? C.brandHi;
  const [c, g] = mk(15, 20);
  // 小旗
  g.fillStyle = C.ink; g.fillRect(6, 0, 2, 12);
  g.fillStyle = '#b07a4a'; g.fillRect(6, 0, 1, 11);
  g.fillStyle = C.ink; g.fillRect(8, 1, 6, 5);
  g.fillStyle = col; g.fillRect(8, 1, 5, 4);
  g.fillStyle = C.white; g.fillRect(8, 1, 1, 1);
  drawBuoy(g, 7, 12, col);
  return c;
};

export function createVoyage(milestones: Milestone[], reduced: boolean) {
  // 时间正序：最早的「起点」先出现，最后一项最后经过
  const events = [...milestones].slice().reverse();
  const LOOP = LEAD + Math.max(0, events.length - 1) * GAP + OPEN;
  let voyage = 0;
  let boards: Board[] | null = null;

  const build = () => {
    boards = events.map((ev) => ({
      ev,
      icon: paintIcon(ev),
      mid: paintBoard(ev, 'date'),
      near: paintBoard(ev, 'title'),
      narrow: paintBoard(ev, 'title', 60),
      full: paintBoard(ev, 'full'),
    }));
  };
  build();
  const ready = document.fonts?.ready;
  if (ready) ready.then(() => build()).catch(() => {});

  const settleX = LEAD - 36;

  const worldOf = (i: number) => LEAD + i * GAP;

  const visit = (fn: (b: Board, rel: number) => void) => {
    if (!boards) return;
    for (let i = 0; i < boards.length; i++) {
      const base = worldOf(i);
      for (const k of [-1, 0, 1] as const) {
        const rel = base + k * LOOP - voyage;
        if (rel < -170 || rel > 300) continue;
        fn(boards[i], rel);
      }
    }
  };

  const screenOf = (v: VoyageView, rel: number) => {
    // 从画面右侧前方进入，在船的左侧海域擦身而过，再向左退去
    const pass = v.mobile ? 0 : 74;
    return v.boatX - pass + rel;
  };

  const depth = (rel: number) => {
    // 1 = 眼前，0 = 远处地平线
    if (rel >= 0) return Math.max(0, 1 - rel / 250);
    return Math.max(0, 1 + rel / 160);
  };

  const drawScenery = (ctx: CanvasRenderingContext2D, v: VoyageView, t: number) => {
    // 远岛随航程缓慢左移，循环出现，避免只有一座灯塔呆在原地
    const H = v.horizon;
    const islands = [0, 740, 1280, 1910];
    const shapes = [0, 1, 2, 1];
    const par = 0.14;
    for (let n = 0; n < islands.length; n++) {
      const span = 2200;
      let ix = Math.round(islands[n] - (voyage * par) % span);
      if (ix < -60) ix += span;
      if (ix > v.LW + 40) continue;
      const kind = shapes[n];
      ctx.fillStyle = '#140f3a';
      if (kind === 0) {
        ctx.fillRect(ix, H - 4, 34, 4); ctx.fillRect(ix + 6, H - 7, 18, 3); ctx.fillRect(ix + 10, H - 9, 8, 2);
        ctx.fillStyle = C.cream; ctx.fillRect(ix + 13, H - 21, 3, 12);
        ctx.fillStyle = C.coral; ctx.fillRect(ix + 13, H - 17, 3, 2); ctx.fillRect(ix + 13, H - 12, 3, 2);
        ctx.fillStyle = C.ink; ctx.fillRect(ix + 12, H - 24, 5, 3);
        const on = reduced || Math.floor(t / 20) % 4;
        ctx.fillStyle = on ? C.gold : '#6b5b1f'; ctx.fillRect(ix + 13, H - 23, 3, 2);
      } else if (kind === 1) {
        ctx.fillRect(ix, H - 3, 22, 3); ctx.fillRect(ix + 4, H - 6, 12, 3); ctx.fillRect(ix + 8, H - 8, 6, 2);
        ctx.fillStyle = '#1d2b6b'; ctx.fillRect(ix + 10, H - 14, 2, 6);
        ctx.fillStyle = C.gold; ctx.fillRect(ix + 10, H - 15, 2, 1);
      } else {
        ctx.fillRect(ix, H - 5, 40, 5); ctx.fillRect(ix + 8, H - 9, 20, 4); ctx.fillRect(ix + 14, H - 12, 10, 3);
        ctx.fillStyle = C.cream; ctx.fillRect(ix + 18, H - 20, 2, 8);
        ctx.fillStyle = C.brand; ctx.fillRect(ix + 20, H - 18, 6, 4);
      }
    }
  };

  const blit = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, alpha: number) => {
    if (alpha <= 0.02) return;
    const dx = Math.round(x - img.width / 2), dy = Math.round(y - img.height);
    if (alpha < 0.995) ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy);
    if (alpha < 0.995) ctx.globalAlpha = 1;
  };

  const drawMarks = (ctx: CanvasRenderingContext2D, v: VoyageView, t: number, mode: 'far' | 'near') => {
    if (!boards) return;
    const items: { b: Board; rel: number; x: number; y: number; d: number }[] = [];
    visit((b, rel) => {
      const d = depth(rel);
      const x = screenOf(v, rel);
      if (x < -40 || x > v.LW + 40) return;
      const approach = Math.max(0, 1 - Math.max(0, rel) / 240);
      const waterY = v.surf(Math.max(0, Math.min(v.LW - 1, x))) - (reduced ? 0 : Math.sin(t / 18 + rel * 0.04) * 1.2);
      const farY = v.horizon + 6;
      let y = farY + (waterY - farY) * Math.pow(Math.min(1, approach * 1.15), 0.75);
      if (v.mobile) {
        const mid = v.horizon + Math.max(16, Math.floor((v.base - v.horizon) * 0.32));
        y = farY + (mid - farY) * Math.pow(Math.min(1, approach * 1.15), 0.75);
      }
      items.push({ b, rel, x, y, d });
    });
    items.sort((a, c) => a.d - c.d);
    const fadeLeft = v.mobile ? Math.floor(v.LW * 0.28) : v.LW * 0.37;
    for (const it of items) {
      const far = it.d < 0.38;
      if (mode === 'far' && !far) continue;
      if (mode === 'near' && far) continue;
      // 还在船前方（右侧）时只显示小旗或日期牌，避免大木牌挡住船帆
      const rightOfBow = it.x > v.boatX + (v.mobile ? 20 : 36);
      const leftOfHull = v.mobile ? (it.d > 0.5 && it.x < v.LW - 18) : (it.x < v.boatX - 64);
      let img = it.b.icon;
      if (rightOfBow && it.d > 0.32) img = it.b.mid;
      if (leftOfHull && it.d > 0.48) img = v.mobile ? it.b.narrow : it.b.near;
      if (leftOfHull && it.d > 0.78 && !v.mobile) img = it.b.full;
      const topLimit = v.mobile ? v.horizon + 4 : Math.floor(v.LH * 0.55);
      if (img === it.b.full && it.y - img.height < topLimit) img = it.b.near;
      let a = it.d > 0.15 ? Math.min(1, (it.d - 0.08) / 0.22) : it.d / 0.15 * 0.6;
      if (it.x < fadeLeft) a *= Math.max(0, (it.x - (fadeLeft - 28)) / 28);
      if (it.rel > 220) a *= Math.max(0, 1 - (it.rel - 220) / 70);
      const lane = (it.b.ev.date.charCodeAt(8) % 3 - 1) * (v.mobile ? 3 : 6);
      blit(ctx, img, it.x + lane, it.y, a);
    }
  };

  const hold = () => {
    let best = 1e9;
    for (let i = 0; i < events.length; i++) {
      let r = (worldOf(i) - voyage) % LOOP;
      if (r > LOOP / 2) r -= LOOP;
      if (r < -LOOP / 2) r += LOOP;
      const d = Math.abs(r);
      if (d < best) best = d;
    }
    return best < 80 ? 0.48 + 0.52 * (best / 80) : 1;
  };

  return {
    get offset() { return voyage; },
    get speed() { return reduced ? 0 : VOYAGE_SPEED * hold(); },
    get loop() { return LOOP; },
    settle() { voyage = reduced ? settleX : 0; },
    step() { if (!reduced) voyage += VOYAGE_SPEED * hold(); },
    drawScenery,
    drawFar: (ctx: CanvasRenderingContext2D, v: VoyageView, t: number) => drawMarks(ctx, v, t, 'far'),
    drawNear: (ctx: CanvasRenderingContext2D, v: VoyageView, t: number) => drawMarks(ctx, v, t, 'near'),
  };
}
