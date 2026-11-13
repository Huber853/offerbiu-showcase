import { C, pixelText, pixelTextWidth } from './pixel';

// 首屏：夜色海面，涌浪真实起伏（多层 Gerstner 波），挂着 OFFERBIU 帆的小船随浪升降、俯仰，船上 7 个人。
// 全部代码逐像素绘制；旋转用三次错切（整数像素位移），保持像素锐利。
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const hash = (a: number, b: number) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;

const SEA = { deep: '#070b2e', d1: '#0b1444', d2: '#101d5e', d3: '#17297c', d4: '#22389e', mid: '#2c49c8', brand: C.brand, hi: '#6f8cff', hi2: '#a9bbff', foam: '#e8efff', white: '#ffffff' };

// ---------------- 波浪模型 ----------------
interface Wave { L: number; A: number; c: number; Q: number; ph: number }
interface WaterSample { h: number; x0: number; th: number }
// 1D Gerstner：水质点 x0 处的波面在 X = x0 - QA·sinθ，高度 A·cosθ；反解 x0 得到任意 x 的波高
function gerstner(ws: Wave[], x: number, t: number, out: WaterSample) {
  let h = 0;
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], k = TAU / w.L, qa = Math.min(w.Q * w.A, 0.72 / k);
    let x0 = x;
    for (let j = 0; j < 5; j++) x0 = x + qa * Math.sin(k * (x0 - w.c * t) + w.ph);
    const th = k * (x0 - w.c * t) + w.ph;
    h += w.A * Math.cos(th);
    if (i === 0) { out.x0 = x0; out.th = th; }
  }
  out.h = h;
  return out;
}

// ---------------- 船员 ----------------
interface Crew { hair: string; style: 'short' | 'cap' | 'bun' | 'long' | 'curly' | 'phones' | 'spiky'; skin: string; shirt: string; shade: string; pose: 'steer' | 'wave' | 'idle' | 'cheer' | 'laptop' | 'nod' | 'point'; x: number }
const CREW: Crew[] = [
  { hair: '#1d1a3a', style: 'cap', skin: '#f2c79b', shirt: '#1d2b6b', shade: '#141f52', pose: 'steer', x: 4 },
  { hair: '#ff8fc1', style: 'long', skin: '#f6d2b0', shirt: C.coral, shade: '#d9584a', pose: 'wave', x: 16 },
  { hair: '#2b2440', style: 'bun', skin: '#e8b88a', shirt: C.white, shade: '#c9cbe8', pose: 'idle', x: 27 },
  { hair: '#ffd23f', style: 'spiky', skin: '#f2c79b', shirt: C.gold, shade: C.goldDk, pose: 'cheer', x: 38 },
  { hair: '#6b3f26', style: 'curly', skin: '#c98d62', shirt: '#4fbf8f', shade: '#33916a', pose: 'laptop', x: 52 },
  { hair: '#2b2440', style: 'phones', skin: '#f6d2b0', shirt: '#9b6cff', shade: '#7448d6', pose: 'nod', x: 62 },
  { hair: '#14112a', style: 'short', skin: '#e8b88a', shirt: '#6fd3ff', shade: '#3fa3d6', pose: 'point', x: 72 },
];

// 船画布：宽 96，高 78；甲板第 54 行，静水吃水线第 64 行；桅杆 x=47..49
const BW = 96, BH = 78, DECK = 54, WL = 64, MAST = 48;

function drawPerson(g: CanvasRenderingContext2D, p: Crew, i: number, t: number, jolt: number, still: boolean) {
  const ph = t + i * 37;
  const beat = still ? 0 : Math.floor(ph / 12) % 2;
  const idleBob = still ? 0 : (Math.sin(ph / 23 + i) > 0.55 ? -1 : 0);
  const nod = p.pose === 'nod' && !still ? Math.floor(ph / 9) % 2 : 0;
  const y = DECK - 13 + idleBob + jolt;
  const x = p.x;
  const px = (cx: number, cy: number, c: string, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x + cx, y + cy, w, h); };
  const ink = C.ink;
  const hy = nod; // 头部偏移（点头）
  // 头（5×5）+ 描边
  const hp = (cx: number, cy: number, c: string, w = 1, h = 1) => px(cx, cy + hy, c, w, h);
  hp(0, 1, ink, 7, 6); hp(1, 0, ink, 5, 1);
  hp(1, 1, p.skin, 5, 5);
  const blink = !still && (ph % 211) < 6;
  if (blink) hp(4, 3, ink, 2, 1); else { hp(4, 3, ink); hp(5, 3, ink); hp(4, 2, 'rgba(20,17,42,.0)'); }
  hp(5, 5, '#e98a7a');
  if (p.pose === 'cheer' || p.pose === 'wave') hp(4, 5, '#c0505a', 2, 1); // 张嘴笑
  // 发型
  if (p.style === 'cap') { hp(0, -1, ink, 7, 1); hp(1, 0, '#1d2b6b', 5, 2); hp(6, 1, '#1d2b6b', 2, 1); hp(2, 0, C.gold, 1, 1); }
  else if (p.style === 'long') { const sway = still ? 0 : Math.floor(ph / 15) % 2; hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair, 1, 5); hp(0 - sway, 2, p.hair, 1, 6); }
  else if (p.style === 'bun') { hp(1, 0, p.hair, 5, 2); hp(2, -2, ink, 3, 2); hp(2, -2, p.hair, 2, 2); hp(1, 2, p.hair, 1, 2); }
  else if (p.style === 'spiky') { hp(1, 0, p.hair, 5, 2); hp(1, -1, p.hair); hp(3, -2, p.hair); hp(5, -1, p.hair); hp(1, 2, p.hair); }
  else if (p.style === 'curly') { hp(0, 0, p.hair, 7, 2); hp(0, 2, p.hair, 2, 2); hp(-1, 1, p.hair, 1, 2); }
  else if (p.style === 'phones') { hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair); hp(0, -1, '#14112a', 7, 1); hp(-1, 2, '#ff7b6b', 2, 3); hp(6, 2, '#ff7b6b', 2, 3); }
  else { hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair, 2, 1); }
  // 身体（7×7）
  px(0, 7, ink, 7, 7); px(1, 7, p.shirt, 5, 7); px(1, 7, p.shade, 1, 7);
  const arm = (cx: number, cy: number, w: number, h: number) => { px(cx, cy, ink, w + 2, h + 2); px(cx + 1, cy + 1, p.skin, w, h); };
  switch (p.pose) {
    case 'steer': {
      arm(5, 8, 2, 1);
      // 舵轮（辐条随时间转动）
      g.fillStyle = ink; g.fillRect(x + 8, y + 6, 5, 5);
      g.fillStyle = '#b07a4a'; g.fillRect(x + 9, y + 7, 3, 3);
      g.fillStyle = '#6a3f22'; if (beat) { g.fillRect(x + 10, y + 6, 1, 5); g.fillRect(x + 8, y + 8, 5, 1); } else { g.fillRect(x + 9, y + 7, 1, 1); g.fillRect(x + 11, y + 9, 1, 1); g.fillRect(x + 11, y + 7, 1, 1); g.fillRect(x + 9, y + 9, 1, 1); }
      g.fillStyle = C.gold; g.fillRect(x + 10, y + 8, 1, 1);
      g.fillStyle = ink; g.fillRect(x + 10, y + 11, 1, 3);
      break;
    }
    case 'wave': beat ? arm(5, 0, 1, 6) : arm(6, 2, 2, 4); break;
    case 'cheer': if (beat) { arm(-2, 0, 1, 7); arm(6, 0, 1, 7); } else { arm(-2, 3, 1, 5); arm(6, 3, 1, 5); } break;
    case 'laptop': {
      px(4, 9, ink, 6, 5); px(5, 10, (Math.floor(ph / 20) % 3) ? '#cfd6ff' : '#fff2a8', 4, 2); px(5, 12, '#9aa6d6', 4, 1);
      px(6, 10, C.brand, 1, 1); break;
    }
    case 'point': { const f = beat ? 1 : 0; arm(5, 7 - f, 4, 1); px(11, 8 - f, p.skin); px(11, 7 - f, ink); break; }
    case 'nod': px(-1, 9, ink, 1, 2); break;
    default: if (!still && Math.floor(ph / 40) % 3 === 0) arm(-2, 8, 1, 3); break;
  }
}

function drawBoat(g: CanvasRenderingContext2D, t: number, jolt: number, wind: number, still: boolean) {
  g.clearRect(0, 0, BW, BH);
  const ink = C.ink, wood = '#8a5a3a', woodDk = '#5e3a24';
  const rope = 'rgba(20,17,42,.7)';
  // 支索（桅顶 → 船头 / 船尾）
  const line = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    g.fillStyle = c; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1);
  };
  line(MAST, 4, 90, DECK - 4, rope);
  line(MAST - 1, 4, 6, DECK - 1, rope);
  // 桅杆
  g.fillStyle = ink; g.fillRect(MAST - 1, 2, 3, DECK - 1);
  g.fillStyle = wood; g.fillRect(MAST, 3, 1, DECK - 3);
  g.fillStyle = '#b07a4a'; g.fillRect(MAST, 3, 1, 2);
  // 瞭望台
  g.fillStyle = ink; g.fillRect(MAST - 3, 8, 7, 3); g.fillStyle = woodDk; g.fillRect(MAST - 2, 9, 5, 1);
  // 旗（金色，飘动）
  const f = still ? 0 : Math.floor(t / 7) % 3;
  const flag = [9, 11, 10, 8];
  flag.forEach((w, r) => { const wob = f === 1 ? (r % 2) : f === 2 ? ((r + 1) % 2) : 0; g.fillStyle = ink; g.fillRect(MAST + 2, 1 + r, w + wob + 1, 1); g.fillStyle = r === 0 ? '#fff2a8' : C.gold; g.fillRect(MAST + 2, 1 + r, w + wob, 1); });
  g.fillStyle = ink; g.fillRect(MAST + 2, 5, 6, 1);
  // 前帆（三角）
  const jt = { x: MAST + 3, y: 12 }, jb = { x: MAST + 3, y: 36 }, jf = { x: 84, y: 40 };
  for (let y = jt.y; y <= jf.y; y++) {
    const xr = Math.round(jt.x + ((jf.x - jt.x) * (y - jt.y)) / (jf.y - jt.y));
    const xl = y <= jb.y ? jt.x : Math.round(jb.x + ((jf.x - jb.x) * (y - jb.y)) / (jf.y - jb.y));
    if (xr - xl < 1) continue;
    const bel = still ? 1 : Math.round(1 + Math.sin(t / 40) * 0.6 + wind * 0.5);
    g.fillStyle = ink; g.fillRect(xl, y, xr - xl + 1 + bel, 1);
    g.fillStyle = C.cream; g.fillRect(xl + 1, y, xr - xl - 1 + bel, 1);
    g.fillStyle = '#eadfc2'; g.fillRect(xr - 1, y, bel + 1, 1);
    if (y >= jf.y - 3) { g.fillStyle = C.brand; g.fillRect(xl + 1, y, xr - xl - 1 + bel, 1); }
  }
  // 主帆（方帆，被风吹鼓）—— 比以前小很多，露出桅杆
  const top = 13, bot = 36, sl = MAST - 21, sr = MAST + 21;
  const puff = still ? 3 : 3 + Math.sin(t / 55) * 0.8 + wind;
  for (let y = top; y <= bot; y++) {
    const k = (y - top) / (bot - top);
    const bulge = Math.round(Math.sin(k * Math.PI) * puff);
    const l = sl + Math.round(k * 1), r = sr + bulge;
    g.fillStyle = ink; g.fillRect(l - 1, y, r - l + 2, 1);
    g.fillStyle = C.cream; g.fillRect(l, y, r - l, 1);
    g.fillStyle = '#eadfc2'; g.fillRect(r - 5 - Math.floor(bulge / 2), y, 5 + Math.floor(bulge / 2), 1);
    g.fillStyle = '#fffdf5'; g.fillRect(l, y, 2, 1);
    if (y === top + 1 || y === bot - 2) { g.fillStyle = C.brand; g.fillRect(l, y, r - l, 2); }
  }
  // 帆缝线
  g.fillStyle = 'rgba(160,140,100,.35)'; for (let x = sl + 7; x < sr; x += 7) g.fillRect(x, top + 4, 1, bot - top - 7);
  // 帆桁
  g.fillStyle = ink; g.fillRect(sl - 3, top - 2, sr - sl + 7, 3); g.fillRect(sl - 3, bot + 1, sr - sl + 8, 3);
  g.fillStyle = wood; g.fillRect(sl - 2, top - 1, sr - sl + 5, 1); g.fillRect(sl - 2, bot + 2, sr - sl + 6, 1);
  // 帆上字：两行 OFFER / BIU
  const l1 = 'OFFER', l2 = 'BIU';
  const cx = MAST + 1;
  pixelText(g, l1, cx - Math.floor(pixelTextWidth(l1) / 2) + 1, top + 5, C.brandDk);
  pixelText(g, l1, cx - Math.floor(pixelTextWidth(l1) / 2), top + 4, C.brand);
  pixelText(g, l2, cx - Math.floor(pixelTextWidth(l2) / 2) + 1, top + 14, C.brandDk);
  pixelText(g, l2, cx - Math.floor(pixelTextWidth(l2) / 2), top + 13, C.brand);
  // 帆脚索
  line(sl - 2, bot + 3, 8, DECK - 1, rope);
  line(sr + 3, bot + 3, 80, DECK - 1, rope);
  // 7 位船员（站在船舷后）
  CREW.forEach((p, i) => drawPerson(g, p, i, t, jolt, still));
  // 船体
  const rows = 14;
  for (let r = 0; r < rows; r++) {
    const y = DECK + r;
    const l = 5 + Math.floor(r * 0.55) - (r < 2 ? 2 : 0);
    const rr = 88 - Math.floor(Math.pow(r, 1.35) * 1.2) + (r < 3 ? 4 - r : 0);
    g.fillStyle = ink; g.fillRect(l - 1, y, rr - l + 2, 1);
    const c = r < 1 ? C.gold : r < 2 ? '#c98f00' : r === 4 || r === 5 ? C.brand : r === 6 ? C.brandDk : r > 10 ? '#d9584a' : r === 10 ? ink : C.cream;
    g.fillStyle = c; g.fillRect(l, y, rr - l, 1);
    if (r >= 2 && r <= 3) { g.fillStyle = '#ffffff'; g.fillRect(l + 2, y, rr - l - 10, 1); }
    if (r >= 7 && r <= 9) { g.fillStyle = '#eadfc2'; g.fillRect(rr - 8, y, 7, 1); }
    if (r > 10) { g.fillStyle = '#b8443a'; g.fillRect(l, y, 4, 1); }
  }
  // 船头高起
  g.fillStyle = ink; g.fillRect(88, DECK - 5, 3, 7); g.fillRect(86, DECK - 3, 3, 3);
  g.fillStyle = C.gold; g.fillRect(89, DECK - 4, 1, 5);
  // 舷窗
  for (let i = 0; i < 5; i++) { const x = 18 + i * 13; g.fillStyle = ink; g.fillRect(x - 1, DECK + 7, 5, 3); g.fillStyle = (i + Math.floor(t / 40)) % 5 === 0 && !still ? '#fff2a8' : '#6fd3ff'; g.fillRect(x, DECK + 8, 3, 1); }
  g.fillStyle = ink; g.fillRect(6, DECK + rows, 80, 1);
}

interface Spray { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string }
interface Wake { x: number; life: number; max: number; j: number }

export function initHero(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d')!;
  const mk = (w: number, h: number, read = false) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: read })!; x.imageSmoothingEnabled = false; return [c, x] as const; };
  const [boatC, bctx] = mk(BW, BH, true);
  const PAD = 28, RW = BW + PAD * 2, RH = BH + PAD * 2;
    let S = 4, LW = 360, LH = 225;
  const r = rng(23);
  const stars = Array.from({ length: 110 }, () => [r(), r() * 0.5, r() * 6, r() > 0.88 ? 2 : 1]);
  const clouds = Array.from({ length: 7 }, (_, i) => ({ x: r() * 700, y: 0.08 + r() * 0.3, w: 24 + Math.floor(r() * 40), v: 0.02 + r() * 0.05, layer: i % 2 }));
  const gulls = Array.from({ length: 4 }, () => ({ x: r() * 400, y: 0.18 + r() * 0.2, v: 0.12 + r() * 0.12, ph: r() * 10 }));
  const spray: Spray[] = [];
  const wake: Wake[] = [];

  // 波浪参数（按屏幕尺寸）
  let main: Wave[] = [], fore: Wave[] = [], mids: { f: number; w: Wave[]; fill: string; rim: string; cap: string; shade: string }[] = [];
  const buildWaves = () => {
    const m = mobile(), f = m ? 0.68 : 1;
    main = [
      { L: 200 * f, A: (m ? 8 : 10.5), c: -0.62, Q: 0.85, ph: 0.4 },
      { L: 94 * f, A: (m ? 2.6 : 3.4), c: -0.44, Q: 0.7, ph: 1.7 },
      { L: 51 * f, A: 1.5, c: 0.28, Q: 0.5, ph: 2.9 },
      { L: 27, A: 0.7, c: -0.65, Q: 0.4, ph: 0.3 },
    ];
    fore = [
      { L: 70 * f, A: m ? 2.2 : 3, c: -1.15, Q: 0.85, ph: 2.2 },
      { L: 31, A: 1.1, c: -0.8, Q: 0.6, ph: 0.9 },
      { L: 17, A: 0.5, c: 0.5, Q: 0.4, ph: 1.3 },
    ];
    const mk3 = (s: number, sp: number, ph: number): Wave[] => [
      { L: 200 * f * s, A: 10 * s * s * 1.2, c: -0.62 * sp, Q: 0.8, ph },
      { L: 70 * f * s, A: 2.4 * s * s, c: -0.4 * sp, Q: 0.6, ph: ph * 2.3 },
      { L: 23 * s + 8, A: 0.6, c: 0.3 * sp, Q: 0.4, ph: ph * 1.7 },
    ];
    mids = [
      { f: 0.16, w: mk3(0.34, 0.32, 1.1), fill: '#0f1a52', rim: '#24379a', cap: 'rgba(169,187,255,.55)', shade: '#0b1444' },
      { f: 0.42, w: mk3(0.5, 0.48, 2.6), fill: '#13215f', rim: '#2c44b4', cap: 'rgba(200,212,255,.7)', shade: '#0d1750' },
      { f: 0.72, w: mk3(0.68, 0.66, 4.1), fill: '#172878', rim: '#3654d2', cap: '#c9d4ff', shade: '#101d5e' },
    ];
  };

  const resize = () => {
    const vw = innerWidth, vh = Math.max(innerHeight, 560);
    S = vw < 700 ? 3 : Math.max(3, Math.min(6, Math.floor(vh / 200)));
    LW = Math.ceil(vw / S); LH = Math.ceil(vh / S);
    canvas.width = LW; canvas.height = LH;
    canvas.style.width = `${LW * S}px`; canvas.style.height = `${LH * S}px`;
    ctx.imageSmoothingEnabled = false;
    buildWaves();
    boat.init = false;
    if (reduced) { settle(T0); draw(T0); }
  };

  const mobile = () => LW < 200;
  const horizon = () => Math.floor(LH * (mobile() ? 0.6 : 0.5));
  const boatBaseX = () => (mobile() ? Math.floor(LW / 2) + 2 : Math.floor(LW * 0.71));
  const base = () => Math.floor(LH * (mobile() ? 0.865 : 0.8));
  const env = (t: number) => (reduced ? 1 : 0.86 + 0.14 * Math.sin(t * 0.0037) + 0.06 * Math.sin(t * 0.011));

  // 主浪面缓存（每帧一次）
  let mY = new Float32Array(0), mX0 = new Float32Array(0), mTh = new Float32Array(0);
  const smp: WaterSample = { h: 0, x0: 0, th: 0 };
  const mainAt = (x: number, t: number) => {
    const e = env(t);
    main[0].A *= e; main[1].A *= e;
    gerstner(main, x, t, smp);
    main[0].A /= e; main[1].A /= e;
    return base() - smp.h;
  };
  const fillMain = (t: number) => {
    if (mY.length !== LW + 2) { mY = new Float32Array(LW + 2); mX0 = new Float32Array(LW + 2); mTh = new Float32Array(LW + 2); }
    for (let x = 0; x < LW + 2; x++) { mY[x] = mainAt(x - 1, t); mX0[x] = smp.x0; mTh[x] = smp.th; }
  };
  const surf = (x: number) => { const i = clamp(x + 1, 0, LW + 0.999); const a = Math.floor(i), f = i - a; return mY[a] * (1 - f) + mY[Math.min(LW + 1, a + 1)] * f; };

  // ---------------- 船的物理 ----------------
  const boat = { init: false, x: 0, y: 0, vy: 0, a: 0, va: 0, surge: 0, jolt: 0, prevVy: 0, bowSub: 0 };
  const T0 = 260;
  const hullTarget = (cx: number) => {
    // 在船体下方 11 个点采样水面，做最小二乘直线：高度 = 均值，倾角 = 斜率
    let sy = 0, sxy = 0, sxx = 0; const n = 11, half = 36;
    const ys: number[] = [];
    for (let i = 0; i < n; i++) { const dx = -half + (2 * half * i) / (n - 1); const y = surf(cx + dx); ys.push(y); sy += y; }
    const my = sy / n;
    for (let i = 0; i < n; i++) { const dx = -half + (2 * half * i) / (n - 1); sxy += dx * (ys[i] - my); sxx += dx * dx; }
    return { y: my, slope: sxy / sxx };
  };
  const settle = (t: number) => {
    fillMain(t);
    boat.x = boatBaseX(); boat.surge = 0;
    const h = hullTarget(boat.x);
    boat.y = h.y; boat.a = clamp(Math.atan(h.slope) * 0.8, -0.21, 0.21); if (reduced && Math.abs(boat.a) < 0.08) boat.a = 0; boat.vy = 0; boat.va = 0; boat.init = true;
  };
  const stepBoat = (t: number) => {
    if (!boat.init) settle(t);
    const h = hullTarget(boat.x);
    // 顺坡下滑时往前冲一点，爬坡时减速
    boat.surge += (clamp(h.slope * 22, -7, 7) - boat.surge) * 0.025;
    boat.x = boatBaseX() + boat.surge;
    const ta = clamp(Math.atan(h.slope) * 0.8, -0.21, 0.21);
    boat.vy += (h.y - boat.y) * 0.03 - boat.vy * 0.16;
    boat.y += boat.vy;
    boat.va += (ta - boat.a) * 0.035 - boat.va * 0.2;
    boat.a += boat.va;
    const acc = boat.vy - boat.prevVy; boat.prevVy = boat.vy;
    boat.jolt += (clamp(acc * 9, -1, 1) - boat.jolt) * 0.3;
  };

  // ---------------- 绘制：天空（沿用） ----------------
  const drawSky = (t: number, sy: number) => {
    const H = horizon();
    const bands = ['#070520', '#0c0930', '#120d3e', '#1a124c', '#241858', '#331f62', '#4a2768', '#6a3168', '#8f3d66', '#b6505f'];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, Math.floor((H * i) / bands.length), LW, Math.ceil(H / bands.length) + 1); });
    for (const [fx, fy, ph, sz] of stars) {
      if (!reduced && Math.sin(t / 28 + ph) < -0.55) continue;
      const x = Math.floor(fx * LW), y = Math.floor(fy * H + sy * 0.04);
      ctx.fillStyle = sz > 1 ? C.warm : '#c9c6ff'; ctx.fillRect(x, y, 1, 1);
      if (sz > 1) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
    }
    const mx = mobile() ? LW - 34 : Math.floor(LW * 0.83), my = Math.floor(H * 0.18 + sy * 0.08);
    for (const [rad, a] of [[22, 0.04], [16, 0.05], [12, 0.06]] as [number, number][]) {
      ctx.fillStyle = `rgba(255,233,168,${a})`;
      for (let yy = -rad; yy <= rad; yy++) { const w = Math.floor(Math.sqrt(rad * rad - yy * yy)); ctx.fillRect(mx + 8 - w, my + 8 + yy, w * 2 + 1, 1); }
    }
    for (let yy = -9; yy <= 9; yy++) for (let xx = -9; xx <= 9; xx++) {
      const a = xx * xx + yy * yy <= 81, b = (xx - 5) * (xx - 5) + (yy + 3) * (yy + 3) <= 56;
      if (a && !b) { ctx.fillStyle = xx < -5 || yy > 5 ? '#e8cf86' : C.warm; ctx.fillRect(mx + 8 + xx, my + 8 + yy, 1, 1); }
    }
    for (const c of clouds) {
      const x = Math.floor(((c.x + (reduced ? 0 : t) * c.v) % (LW + 100)) - 50), y = Math.floor(c.y * H + sy * (c.layer ? 0.1 : 0.05));
      ctx.fillStyle = c.layer ? 'rgba(120,80,160,.42)' : 'rgba(70,50,130,.5)';
      ctx.fillRect(x, y, c.w, 4); ctx.fillRect(x + 4, y - 3, c.w - 10, 3); ctx.fillRect(x + 9, y - 5, Math.floor(c.w / 3), 2);
      ctx.fillStyle = 'rgba(255,170,150,.22)'; ctx.fillRect(x + 2, y + 4, c.w - 6, 1);
    }
    for (const s of gulls) {
      const x = Math.floor(((s.x + (reduced ? 0 : t) * s.v) % (LW + 40)) - 20), y = Math.floor(s.y * H + Math.sin(t / 30 + s.ph) * 2);
      const up = !reduced && Math.floor(t / 10 + s.ph) % 2 === 0;
      ctx.fillStyle = '#e8e4ff';
      if (up) { ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x + 3, y + 1, 1, 1); ctx.fillRect(x + 4, y, 1, 1); }
      else { ctx.fillRect(x, y + 2, 2, 1); ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x + 3, y + 2, 2, 1); ctx.fillRect(x + 2, y + 1, 1, 1); }
    }
    return mx + 8;
  };

  const drawFarSea = (t: number, sy: number) => {
    const H = horizon();
    const ix = mobile() ? 8 : Math.floor(LW * 0.93) - 30;
    if (!mobile() || LW > 120) {
      ctx.fillStyle = '#140f3a'; ctx.fillRect(ix, H - 4, 34, 4); ctx.fillRect(ix + 6, H - 7, 18, 3); ctx.fillRect(ix + 10, H - 9, 8, 2);
      ctx.fillStyle = C.cream; ctx.fillRect(ix + 13, H - 21, 3, 12); ctx.fillStyle = C.coral; ctx.fillRect(ix + 13, H - 17, 3, 2); ctx.fillRect(ix + 13, H - 12, 3, 2);
      ctx.fillStyle = C.ink; ctx.fillRect(ix + 12, H - 24, 5, 3);
      const on = reduced || Math.floor(t / 20) % 4;
      ctx.fillStyle = on ? C.gold : '#6b5b1f'; ctx.fillRect(ix + 13, H - 23, 3, 2);
      if (!reduced) {
        const side = Math.floor(t / 40) % 2 ? 1 : -1;
        ctx.fillStyle = 'rgba(255,233,168,.12)';
        for (let i = 1; i < 40; i++) ctx.fillRect(side > 0 ? ix + 16 + i : ix + 13 - i, H - 23 + Math.floor(-i / 10), 1, 2 + Math.floor(i / 8));
      }
    }
    const sea = [SEA.d3, SEA.d2, SEA.d2, SEA.d1, SEA.d1, SEA.deep];
    const span = LH - H;
    sea.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, H + Math.floor((span * i) / sea.length), LW, Math.ceil(span / sea.length) + 1); });
    ctx.fillStyle = '#ff9a8a'; ctx.fillRect(0, H, LW, 1);
    ctx.fillStyle = 'rgba(255,154,138,.35)'; ctx.fillRect(0, H + 1, LW, 1);
    // 远处浪纹（向左流动）
    for (let row = 0; row < 6; row++) {
      const y = H + 3 + Math.floor(row * row * 0.5 + row * 1.4);
      const len = 3 + Math.floor(row * 0.7), gap = 14 + row * 3, sp = 0.12 + row * 0.05;
      const off = Math.floor((reduced ? 0 : t) * sp + row * 37 + sy * 0.02) % gap;
      ctx.fillStyle = 'rgba(169,187,255,.35)';
      for (let x = -off; x < LW; x += gap) if (hash(Math.floor((x + off) / gap), row) > 0.35) ctx.fillRect(x, y, len, 1);
    }
  };

  // 中景涌浪（三层视差，越近越大越快）
  const tmp: WaterSample = { h: 0, x0: 0, th: 0 };
  const drawMids = (t: number) => {
    const H = horizon(), span = base() - H;
    const e = env(t);
    for (const m of mids) {
      const b = H + Math.round(span * m.f);
      const amp0 = m.w[0].A;
      for (let x = 0; x < LW; x++) {
        m.w[0].A = amp0 * e;
        gerstner(m.w, x, t, tmp);
        const s = Math.round(b - tmp.h);
        ctx.fillStyle = m.fill; ctx.fillRect(x, s, 1, LH - s);
        ctx.fillStyle = m.rim; ctx.fillRect(x, s, 1, 1);
        const c = Math.cos(tmp.th);
        if (c > 0.6) { ctx.fillStyle = m.rim; ctx.fillRect(x, s + 1, 1, 1); }
        if (c < -0.2) { ctx.fillStyle = m.shade; ctx.fillRect(x, s + 2, 1, 1); }
        // 浪尖白帽：跟着浪峰走
        if (c > 0.9 && hash(Math.floor(tmp.th * 9), Math.floor(t / 8)) > 0.25) { ctx.fillStyle = m.cap; ctx.fillRect(x, s - (c > 0.97 ? 1 : 0), 1, 1); }
        // 水面纹理：跟着水质点走
        if (hash(Math.floor(tmp.x0 / 4), Math.round(m.f * 100)) > 0.72) { ctx.fillStyle = m.shade; ctx.fillRect(x, s + 3 + (Math.floor(tmp.x0 / 4) % 3), 1, 1); }
      }
      m.w[0].A = amp0;
    }
  };

  // 月光倒影（碎光柱），压在中景浪上
  const drawMoonPath = (t: number, moonX: number) => {
    const H = horizon(), end = base() + 4;
    for (let y = H + 2; y < end; y += 2) {
      const k = (y - H) / (LH - H);
      const w = Math.floor(2 + k * 14 * hash(y, Math.floor(t / 7)));
      const jit = Math.floor((hash(y * 3, Math.floor(t / 9)) - 0.5) * (4 + k * 10));
      if (hash(y, Math.floor(t / 11)) < 0.25) continue;
      ctx.fillStyle = k < 0.3 ? 'rgba(255,233,168,.75)' : 'rgba(255,233,168,.45)';
      ctx.fillRect(moonX - Math.floor(w / 2) + jit, y, w, 1);
    }
  };

  // 主涌浪：一列一列画，颜色按离水面深度分层；迎月光的坡更亮；浪峰白沫、前坡飞沫跟着波相位走
  const BANDS: [number, string][] = [[3, SEA.brand], [7, SEA.mid], [13, SEA.d4], [22, SEA.d3], [34, SEA.d2]];
  const drawMainCol = (x: number, t: number, start: number, moonX: number, front: boolean) => {
    const sf = mY[x + 1], s = Math.round(sf);
    const slope = (mY[x + 2] - mY[x]) / 2;
    const th = mTh[x + 1], x0 = mX0[x + 1];
    const cth = Math.cos(th), sth = Math.sin(th);
    const from = Math.max(s, start);
    // 底色分层
    let prev = s;
    const lit = clamp(Math.round(slope * 7), 0, 3);
    const tops: [number, string][] = [[1 + lit, SEA.hi2], [3 + lit, SEA.hi], ...BANDS.map(([o, c]) => [o + lit, c] as [number, string])];
    for (const [o, c] of tops) {
      const y1 = Math.min(LH, s + o);
      const a = Math.max(prev, from);
      if (a < y1) { ctx.fillStyle = c; ctx.fillRect(x, a, 1, y1 - a); }
      prev = y1;
    }
    if (prev < LH) { const a = Math.max(prev, from); ctx.fillStyle = SEA.d1; ctx.fillRect(x, a, 1, LH - a); }
    // 背光坡压暗一行
    if (slope < -0.12 && from <= s) { ctx.fillStyle = SEA.hi; ctx.fillRect(x, s, 1, 1); }
    // 水下纹理（跟随水质点，来回摆动）
    for (const [k, c, th2] of [[6, SEA.hi, 0.62], [11, SEA.brand, 0.6], [18, SEA.mid, 0.55], [28, SEA.d4, 0.5]] as [number, string, number][]) {
      const key = Math.floor((x0 + k * 13) / 4);
      const yy = s + k + lit + Math.round(Math.sin(x0 * 0.08 + k) * 1.4);
      if (yy >= from && yy < LH && hash(key, k * 31) > th2) { ctx.fillStyle = c; ctx.fillRect(x, yy, 2, 1); }
    }
    // 月光闪烁
    if (Math.abs(x - moonX) < 26 && hash(x, Math.floor(t / 5)) > 0.8) { const yy = s + 2 + Math.floor(hash(x * 3, Math.floor(t / 5)) * 10); if (yy >= from) { ctx.fillStyle = 'rgba(255,233,168,.8)'; ctx.fillRect(x, yy, 1, 1); } }
    if (front) return;
    // 浪峰：白帽
    const big = main[0].A * env(t) > 8.5;
    if (cth > 0.94) { ctx.fillStyle = SEA.white; ctx.fillRect(x, s - 1, 1, 1); ctx.fillStyle = SEA.foam; ctx.fillRect(x, s, 1, 1); }
    else if (cth > 0.8 && hash(Math.floor(th * 40), Math.floor(t / 6)) > 0.3) { ctx.fillStyle = SEA.foam; ctx.fillRect(x, s - 1, 1, 2); }
    // 前坡（浪向左走，前坡在浪峰左侧，sinθ<0）：滚落的白沫
    if (sth < 0 && cth > 0.15) {
      const d = Math.floor((1 - cth) * 10);
      if (hash(Math.floor(th * 30), Math.floor(t / 5)) > 0.45 - (big ? 0.15 : 0)) { ctx.fillStyle = SEA.foam; ctx.fillRect(x, s + 1 + Math.floor(hash(x, Math.floor(t / 5)) * (2 + d)), 1, 1); }
    }
    // 背坡：浪峰过后留下的泡沫花边（随水质点）
    if (sth > 0 && cth > -0.4 && hash(Math.floor(x0 / 2), 77) > 0.55) { ctx.fillStyle = 'rgba(232,239,255,.55)'; ctx.fillRect(x, s + 2 + Math.floor(hash(Math.floor(x0 / 2), 5) * 4), 1, 1); }
    // 星点高光
    if (hash(x, Math.floor(t / 6)) > 0.95) { ctx.fillStyle = SEA.hi2; ctx.fillRect(x, s + 4 + Math.floor(hash(x, 7) * 8), 1, 1); }
  };

  const drawForeground = (t: number) => {
    const y0 = LH - (mobile() ? 7 : 10);
    for (let x = 0; x < LW; x++) {
      gerstner(fore, x, t, tmp);
      const s = Math.round(y0 - tmp.h);
      const c = Math.cos(tmp.th);
      ctx.fillStyle = SEA.d1; ctx.fillRect(x, s, 1, LH - s);
      ctx.fillStyle = SEA.d2; ctx.fillRect(x, s + 2, 1, 2);
      ctx.fillStyle = c > 0.3 ? SEA.mid : SEA.d4; ctx.fillRect(x, s, 1, 2);
      if (c > 0.85) { ctx.fillStyle = SEA.foam; ctx.fillRect(x, s - 1, 1, 1); if (c > 0.96) ctx.fillRect(x, s - 2, 1, 1); }
      else if (Math.sin(tmp.th) < 0 && c > 0.3 && hash(Math.floor(tmp.th * 25), Math.floor(t / 4)) > 0.5) { ctx.fillStyle = 'rgba(232,239,255,.8)'; ctx.fillRect(x, s + 1 + Math.floor(hash(x, Math.floor(t / 4)) * 3), 1, 1); }
      if (hash(Math.floor(tmp.x0 / 3), 9) > 0.8) { ctx.fillStyle = SEA.d3; ctx.fillRect(x, s + 4, 2, 1); }
    }
  };

  // 像素风旋转（RotSprite 思路）：Scale2x 连做三次放大到 8 倍，最近邻旋转，再最近邻缩回 1 倍。
  // 结果仍在整数像素网格上、无模糊，且比直接错切更少断线和重复像素，帆上的字在倾斜时也清楚。
  const UP = 8;
  const [bigC, bigX] = mk(BW * UP, BH * UP);
  const [rot8, r8x] = mk(RW * UP, RH * UP);
  const [rot1, r1x] = mk(RW, RH);
  let prevSprite: Uint32Array | null = null;
  const scale2x = (src: Uint32Array, w: number, h: number) => {
    const out = new Uint32Array(w * h * 4), W2 = w * 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const P = src[y * w + x];
      const A = y > 0 ? src[(y - 1) * w + x] : P, D = y < h - 1 ? src[(y + 1) * w + x] : P;
      const Cc = x > 0 ? src[y * w + x - 1] : P, B = x < w - 1 ? src[y * w + x + 1] : P;
      const o = y * 2 * W2 + x * 2;
      out[o] = Cc === A && Cc !== D && A !== B ? A : P;
      out[o + 1] = A === B && A !== Cc && B !== D ? B : P;
      out[o + W2] = D === Cc && D !== B && Cc !== A ? Cc : P;
      out[o + W2 + 1] = B === D && B !== A && D !== Cc ? D : P;
    }
    return out;
  };
  const refreshBig = () => {
    const id = bctx.getImageData(0, 0, BW, BH);
    const src = new Uint32Array(id.data.buffer);
    if (prevSprite && prevSprite.length === src.length) { let same = true; for (let i = 0; i < src.length; i++) if (src[i] !== prevSprite[i]) { same = false; break; } if (same) return; }
    prevSprite = src.slice();
    let a = src, w = BW, h = BH;
    for (let k = 0; k < 3; k++) { a = scale2x(a, w, h); w *= 2; h *= 2; }
    const out = bigX.createImageData(w, h); new Uint32Array(out.data.buffer).set(a); bigX.putImageData(out, 0, 0);
  };
  const blitBoat = (a: number, px: number, py: number) => {
    const PX = BW / 2, PY = WL;
    if (Math.abs(a) < 0.012) { ctx.drawImage(boatC, px - PX, py - PY); return; }
    refreshBig();
    r8x.setTransform(1, 0, 0, 1, 0, 0); r8x.clearRect(0, 0, RW * UP, RH * UP);
    r8x.imageSmoothingEnabled = false;
    r8x.translate((PAD + PX) * UP, (PAD + PY) * UP); r8x.rotate(a);
    r8x.drawImage(bigC, -PX * UP, -PY * UP);
    r1x.clearRect(0, 0, RW, RH); r1x.imageSmoothingEnabled = false;
    r1x.drawImage(rot8, 0, 0, RW * UP, RH * UP, 0, 0, RW, RH);
    ctx.drawImage(rot1, px - PAD - PX, py - PAD - PY);
  };
  const toWorld = (bx: number, by: number) => {
    const ca = Math.cos(boat.a), sa = Math.sin(boat.a);
    const dx = bx - BW / 2, dy = by - WL;
    return { x: Math.round(boat.x) + dx * ca - dy * sa, y: Math.round(boat.y) + 1 + dx * sa + dy * ca };
  };

  const stepFx = (t: number) => {
    // 船头浪花：船头往水里扎得越快，溅得越高越多
    const bow = toWorld(91, WL - 1);
    const sub = bow.y - surf(bow.x);
    const dSub = sub - boat.bowSub; boat.bowSub = sub;
    const power = clamp(dSub * 2.2 + 0.35 + Math.max(0, sub) * 0.08, 0, 4);
    const n = Math.floor(power) + (Math.random() < power % 1 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const up = 0.6 + Math.random() * (0.8 + power * 0.5);
      spray.push({ x: bow.x - 1 + Math.random() * 3, y: Math.min(bow.y, surf(bow.x)) - 1, vx: 0.2 + Math.random() * (0.6 + power * 0.25), vy: -up, life: 24, max: 24, c: Math.random() > 0.3 ? SEA.foam : SEA.hi2 });
    }
    // 船舷两侧的水花（船落下拍水时）
    if (boat.vy > 0.25) for (let i = 0; i < 2; i++) { const p = toWorld(10 + Math.random() * 76, WL); spray.push({ x: p.x, y: surf(p.x) - 1, vx: (Math.random() - 0.5) * 0.8, vy: -0.4 - Math.random() * boat.vy * 1.6, life: 16, max: 16, c: SEA.foam }); }
    // 尾迹：船尾留下泡沫，漂向后方
    if (t % 2 === 0) { const st = toWorld(6, WL); wake.push({ x: st.x - Math.random() * 2, life: 110, max: 110, j: Math.random() }); }
    for (let i = wake.length - 1; i >= 0; i--) { const w = wake[i]; w.x -= 0.45 + w.j * 0.25; w.life--; if (w.life <= 0 || w.x < -4) wake.splice(i, 1); }
    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.085; p.vx *= 0.985; p.life--;
      if (p.life <= 0 || (p.vy > 0 && p.y > surf(p.x) + 1)) spray.splice(i, 1);
    }
    if (spray.length > 500) spray.splice(0, spray.length - 500);
  };

  const draw = (t: number) => {
    const sy = scrollY / S;
    const moonX = drawSky(t, sy);
    drawFarSea(t, sy);
    drawMids(t);
    drawMoonPath(t, moonX);
    fillMain(t);
    for (let x = 0; x < LW; x++) drawMainCol(x, t, -999, moonX, false);
    // 尾迹泡沫（贴着水面）
    for (const w of wake) {
      const k = w.life / w.max, spread = Math.floor((1 - k) * 4);
      const y = Math.round(surf(w.x));
      ctx.fillStyle = k > 0.5 ? SEA.foam : 'rgba(232,239,255,.55)';
      ctx.fillRect(Math.round(w.x), y + (w.j > 0.5 ? 0 : 1), 2, 1);
      if (spread && w.j > 0.3) ctx.fillRect(Math.round(w.x) + 1, y + 1 + spread, 1, 1);
    }
    // 船
    drawBoat(bctx, t, Math.round(boat.jolt), clamp(-boat.va * 20, -1, 1), reduced);
    const px = Math.round(boat.x), py = Math.round(boat.y) + 1;
    blitBoat(boat.a, px, py);
    // 船体前方的水：盖住吃水线以下（随船体倾斜）
    const ta = Math.tan(boat.a), half = Math.floor((BW / 2 - 3) * Math.cos(boat.a));
    for (let x = px - half; x <= px + half - 4; x++) {
      if (x < 0 || x >= LW) continue;
      const wl = Math.round(py + (x - px) * ta);
      const s = Math.round(mY[x + 1]);
      const start = Math.max(s, wl);
      drawMainCol(x, t, start, moonX, true);
      // 船体与水面交界的白沫
      if (hash(x, Math.floor(t / 4)) > 0.35) { ctx.fillStyle = SEA.foam; ctx.fillRect(x, start, 1, 1); }
      if (start > s && hash(x * 5, Math.floor(t / 3)) > 0.7) { ctx.fillStyle = SEA.white; ctx.fillRect(x, start - 1, 1, 1); }
    }
    // 飞沫
    for (const p of spray) { ctx.globalAlpha = Math.min(1, p.life / 10); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
    ctx.globalAlpha = 1;
    drawForeground(t);
  };

  let visible = true, t = 0, last = 0, acc = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  addEventListener('resize', resize);
  resize();
  if (reduced) { addEventListener('scroll', () => visible && draw(T0), { passive: true }); return; }
  t = T0; settle(t);
  const loop = (now: number) => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) { last = now; return; }
    acc += Math.min(100, now - (last || now)); last = now;
    let stepped = false;
    while (acc >= 16.67) { t++; acc -= 16.67; fillMain(t); stepBoat(t); stepFx(t); stepped = true; }
    if (stepped) draw(t);
  };
  requestAnimationFrame(loop);
}
