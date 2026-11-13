import { C, HERO_FRAMES, HERO_PAL, COIN_FRAMES, spriteCanvas, pixelText } from './pixel';
import { game as G } from './data/timeline';

// 店内小游戏：←→ 走，Shift 跑，空格跳。土狼时间、跳跃缓冲、落地压缩、硬币粒子。
interface Block { x: number; y: number; bump: number; cool: number }
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; coin?: boolean }

export function initGame(opts: { canvas: HTMLCanvasElement; wrap: HTMLElement; counter: HTMLElement; best: HTMLElement; floatLayer: HTMLElement; sound: HTMLButtonElement; reduced: boolean; soundLabels: [string, string] }) {
  const { canvas, wrap, counter, best, floatLayer, sound, reduced } = opts;
  const ctx = canvas.getContext('2d')!;
  const LH = 150; let LW = 320, K = 3, GROUND = LH - 22;
  let blocks: Block[] = [];
  const frames = {
    idle: HERO_FRAMES.idle.map((f) => spriteCanvas(f, HERO_PAL)),
    bob: spriteCanvas(HERO_FRAMES.idleBob, HERO_PAL),
    walk: HERO_FRAMES.walk.map((f) => spriteCanvas(f, HERO_PAL)),
    jump: spriteCanvas(HERO_FRAMES.jump, HERO_PAL),
    fall: spriteCanvas(HERO_FRAMES.fall, HERO_PAL),
  };
  const coins = COIN_FRAMES.map(({ f, pal }) => spriteCanvas(f, pal));
  const PW = 16, PH = 20;
  const p = { x: 24, y: 0, vx: 0, vy: 0, ground: true, face: 1, anim: 0, coyote: 0, buffer: 0, squash: 0, idleT: 0 };
  const parts: Part[] = [];
  const keys = new Set<string>();
  let count = 0, bestN = Number(localStorage.getItem('offerbiu-best') || 0), active = false, visible = true, t = 0, jumpHeld = false;
  best.textContent = String(bestN).padStart(3, '0');

  // ---- 音效（默认关闭） ----
  let ac: AudioContext | null = null, soundOn = false;
  const beep = (f: number, d = 0.08, type: OscillatorType = 'square', when = 0) => {
    if (!soundOn) return; ac ??= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.05, ac.currentTime + when); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + d);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + when); o.stop(ac.currentTime + when + d + 0.02);
  };
  sound.addEventListener('click', () => { soundOn = !soundOn; sound.textContent = opts.soundLabels[soundOn ? 0 : 1]; sound.setAttribute('aria-pressed', String(soundOn)); if (soundOn) beep(880); });

  const layout = () => {
    const cw = wrap.clientWidth;
    K = cw >= 900 ? 3 : 2;
    LW = Math.max(160, Math.floor(cw / K));
    canvas.width = LW; canvas.height = LH; canvas.style.width = `${LW * K}px`; canvas.style.height = `${LH * K}px`;
    ctx.imageSmoothingEnabled = false;
    GROUND = LH - 22;
    const n = Math.max(3, Math.min(7, Math.floor((LW - 40) / 52)));
    const gap = (LW - 40) / n;
    blocks = Array.from({ length: n }, (_, i) => ({ x: Math.round(28 + gap * i + gap / 2 - 8), y: GROUND - (i % 2 ? 60 : 46), bump: 0, cool: 0 }));
    if (p.y === 0) p.y = GROUND - PH;
    p.x = Math.min(p.x, LW - PW);
  };

  new IntersectionObserver(([e]) => { active = e.intersectionRatio > 0.45; visible = e.isIntersecting; if (!active) keys.clear(); }, { threshold: [0, 0.45, 1] }).observe(canvas);
  const map: Record<string, string> = { ArrowLeft: 'L', ArrowRight: 'R', KeyA: 'L', KeyD: 'R', Space: 'J', ArrowUp: 'J', KeyW: 'J', ShiftLeft: 'S', ShiftRight: 'S' };
  addEventListener('keydown', (e) => { const k = map[e.code]; if (!k || !active) return; e.preventDefault(); if (k === 'J' && !keys.has('J')) p.buffer = 7; keys.add(k); });
  addEventListener('keyup', (e) => { const k = map[e.code]; if (k) keys.delete(k); });
  addEventListener('blur', () => keys.clear());
  document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((b) => {
    const k = b.dataset.key!;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (k === 'J') p.buffer = 7; keys.add(k); b.classList.add('down'); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { keys.delete(k); b.classList.remove('down'); });
  });
  canvas.addEventListener('pointerdown', () => { p.buffer = 7; keys.add('J'); setTimeout(() => keys.delete('J'), 160); });

  const floatText = (text: string, bx: number, by: number) => {
    const el = document.createElement('div'); el.className = 'float-text'; el.textContent = text;
    el.style.left = `${(bx + 8) * K}px`; el.style.top = `${by * K}px`;
    floatLayer.appendChild(el); setTimeout(() => el.remove(), 1100);
  };
  const dust = (x: number, y: number, n: number) => { for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 0.6, life: 18, max: 18, c: '#8e86c9' }); };

  const hit = (b: Block) => {
    if (b.cool > 0) return;
    b.bump = 10; b.cool = 14; count++;
    counter.textContent = String(count).padStart(3, '0');
    counter.parentElement!.classList.remove('pulse'); void counter.offsetWidth; counter.parentElement!.classList.add('pulse');
    if (count > bestN) { bestN = count; localStorage.setItem('offerbiu-best', String(bestN)); best.textContent = String(bestN).padStart(3, '0'); }
    parts.push({ x: b.x + 4, y: b.y - 8, vx: 0, vy: -3.2, life: 34, max: 34, c: C.gold, coin: true });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; parts.push({ x: b.x + 8, y: b.y, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4 - 0.8, life: 22, max: 22, c: i % 2 ? C.gold : C.white }); }
    floatText(G.popTexts[(count - 1) % G.popTexts.length], b.x, b.y - 16);
    beep(988, 0.07); beep(1319, 0.2, 'square', 0.07);
  };

  const update = () => {
    t++;
    const dir = (keys.has('R') ? 1 : 0) - (keys.has('L') ? 1 : 0);
    const run = keys.has('S'), max = run ? 2.4 : 1.3, accel = p.ground ? 0.22 : 0.14;
    if (dir) { p.vx += dir * accel; p.face = dir; } else p.vx *= p.ground ? 0.72 : 0.92;
    if (Math.abs(p.vx) > max) p.vx = Math.sign(p.vx) * Math.max(max, Math.abs(p.vx) * 0.92);
    if (Math.abs(p.vx) < 0.03) p.vx = 0;
    if (p.buffer > 0) p.buffer--;
    if (p.ground) p.coyote = 6; else if (p.coyote > 0) p.coyote--;
    if (p.buffer > 0 && p.coyote > 0) { p.vy = run ? -4.4 : -4.1; p.ground = false; p.coyote = 0; p.buffer = 0; p.squash = -6; jumpHeld = true; beep(523, 0.06); dust(p.x + 8, p.y + PH, 3); }
    if (!keys.has('J')) jumpHeld = false;
    p.vy += !jumpHeld && p.vy < 0 ? 0.5 : 0.24;
    p.vy = Math.min(p.vy, 5);
    const prevY = p.y, wasGround = p.ground;
    p.x += p.vx; p.y += p.vy; p.ground = false;
    p.x = Math.max(0, Math.min(LW - PW, p.x));
    const L = p.x + 4, R = p.x + 12;
    for (const b of blocks) {
      if (R <= b.x || L >= b.x + 16) continue;
      const bottom = b.y + 16;
      if (p.vy < 0 && prevY >= bottom - 0.5 && p.y < bottom) { p.y = bottom; p.vy = 0.5; hit(b); }
      else if (p.vy >= 0 && prevY + PH <= b.y + 0.5 && p.y + PH >= b.y) { p.y = b.y - PH; p.vy = 0; p.ground = true; }
    }
    if (p.y + PH >= GROUND) { p.y = GROUND - PH; p.vy = 0; p.ground = true; }
    if (p.ground && !wasGround) { p.squash = 6; dust(p.x + 8, p.y + PH, 5); beep(196, 0.04, 'triangle'); }
    if (p.ground && run && Math.abs(p.vx) > 2 && t % 6 === 0) dust(p.x + (p.face > 0 ? 3 : 13), p.y + PH, 1);
    if (p.squash > 0) p.squash--; else if (p.squash < 0) p.squash++;
    p.anim += Math.abs(p.vx) * (run ? 0.16 : 0.13);
    p.idleT = Math.abs(p.vx) < 0.1 && p.ground ? p.idleT + 1 : 0;
    for (const b of blocks) { if (b.bump > 0) b.bump--; if (b.cool > 0) b.cool--; }
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.x += q.vx; q.y += q.vy; q.vy += q.coin ? 0.16 : 0.08; if (--q.life <= 0) parts.splice(i, 1); }
  };

  const draw = () => {
    // 背景墙
    ctx.fillStyle = '#211b57'; ctx.fillRect(0, 0, LW, LH);
    ctx.fillStyle = '#251f61'; for (let x = 0; x < LW; x += 12) ctx.fillRect(x, 0, 6, GROUND);
    ctx.fillStyle = '#1a1548'; ctx.fillRect(0, GROUND - 14, LW, 2); ctx.fillStyle = '#2d2675'; ctx.fillRect(0, GROUND - 12, LW, 12);
    // 窗外夜景
    const wx = Math.floor(LW * 0.08), ww = Math.min(90, Math.floor(LW * 0.3));
    ctx.fillStyle = C.ink; ctx.fillRect(wx - 2, 12, ww + 4, 48);
    ctx.fillStyle = '#18123e'; ctx.fillRect(wx, 14, ww, 44); ctx.fillStyle = '#2f1f5a'; ctx.fillRect(wx, 40, ww, 18);
    ctx.fillStyle = '#2a2468'; for (let i = 0; i < ww; i += 9) ctx.fillRect(wx + i, 58 - ((i * 7) % 22) - 8, 7, ((i * 7) % 22) + 8);
    ctx.fillStyle = C.gold; for (let i = 3; i < ww; i += 9) if ((i + Math.floor(t / 90)) % 3) ctx.fillRect(wx + i, 50 - ((i * 5) % 10), 1, 1);
    ctx.fillStyle = C.warm; ctx.fillRect(wx + ww - 14, 18, 5, 5);
    ctx.fillStyle = C.ink; ctx.fillRect(wx + ww / 2 - 1, 14, 2, 44); ctx.fillRect(wx, 35, ww, 2);
    // 岗位墙
    const bx = LW - Math.min(120, Math.floor(LW * 0.4)) - 8, bw = Math.min(120, Math.floor(LW * 0.4));
    ctx.fillStyle = '#5a3b2a'; ctx.fillRect(bx - 2, 10, bw + 4, 46); ctx.fillStyle = '#8a5a3a'; ctx.fillRect(bx, 12, bw, 42);
    pixelText(ctx, 'JOBS', bx + 4, 15, C.cream);
    const cols = [C.cream, C.white, '#ffd98a', '#cfe0ff'];
    for (let i = 0; i < Math.floor((bw - 8) / 14); i++) for (let j = 0; j < 2; j++) {
      const cx = bx + 4 + i * 14, cy = 25 + j * 14 + ((i + j) % 2);
      ctx.fillStyle = cols[(i + j) % 4]; ctx.fillRect(cx, cy, 11, 11);
      ctx.fillStyle = (i + j) % 3 ? C.brand : C.coral; ctx.fillRect(cx + 1, cy + 1, 4, 3); ctx.fillStyle = '#9aa6d6'; ctx.fillRect(cx + 1, cy + 6, 8, 1); ctx.fillRect(cx + 1, cy + 8, 6, 1);
      ctx.fillStyle = C.coral; ctx.fillRect(cx + 5, cy - 1, 1, 1);
    }
    // 吊灯
    for (const lx of [Math.floor(LW * 0.33), Math.floor(LW * 0.66)]) {
      const sw = reduced ? 0 : Math.round(Math.sin(t / 50 + lx) * 1.5);
      ctx.fillStyle = C.ink; ctx.fillRect(lx, 0, 1, 10);
      ctx.fillStyle = 'rgba(255,233,168,.07)'; for (let i = 0; i < 60; i++) ctx.fillRect(lx + sw - 3 - Math.floor(i / 2.2), 14 + i, 7 + Math.floor(i / 1.1), 1);
      ctx.fillStyle = C.brand; ctx.fillRect(lx + sw - 4, 10, 9, 3); ctx.fillStyle = C.warm; ctx.fillRect(lx + sw - 2, 13, 5, 2);
    }
    // 地板
    ctx.fillStyle = '#7a4b2c'; ctx.fillRect(0, GROUND, LW, LH - GROUND);
    ctx.fillStyle = '#9a6238'; ctx.fillRect(0, GROUND, LW, 2);
    ctx.fillStyle = '#5e3820'; for (let y = GROUND + 6; y < LH; y += 6) { ctx.fillRect(0, y, LW, 1); for (let x = ((y / 6) % 2) * 12; x < LW; x += 24) ctx.fillRect(x, y - 5, 1, 5); }
    // 方块
    for (const b of blocks) {
      const off = b.bump > 0 ? -Math.round(Math.sin((b.bump / 10) * Math.PI) * 5) : 0;
      const y = b.y + off, used = b.cool > 0;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x + 2, GROUND - 1, 12, 1);
      ctx.fillStyle = C.ink; ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = used ? C.goldDk : C.gold; ctx.fillRect(b.x + 1, y + 1, 14, 14);
      ctx.fillStyle = used ? '#a06d00' : '#fff2a8'; ctx.fillRect(b.x + 1, y + 1, 14, 1); ctx.fillRect(b.x + 1, y + 1, 1, 14);
      ctx.fillStyle = C.goldDk; ctx.fillRect(b.x + 1, y + 14, 14, 1); ctx.fillRect(b.x + 14, y + 1, 1, 14);
      ctx.fillStyle = C.ink; for (const [rx, ry] of [[2, 2], [13, 2], [2, 13], [13, 13]]) ctx.fillRect(b.x + rx, y + ry, 1, 1);
      const shine = reduced ? 0 : Math.floor(t / 8) % 4 === 0 ? 1 : 0;
      pixelText(ctx, '?', b.x + 5, y + 4 - shine, used ? '#7a5200' : C.ink);
    }
    // 粒子
    for (const q of parts) {
      if (q.coin) { const f = coins[Math.floor((q.max - q.life) / 3) % 4]; ctx.globalAlpha = Math.min(1, q.life / 8); ctx.drawImage(f, Math.round(q.x), Math.round(q.y)); ctx.globalAlpha = 1; continue; }
      ctx.globalAlpha = q.life / q.max; ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); ctx.globalAlpha = 1;
    }
    // 主角
    let img: HTMLCanvasElement;
    if (!p.ground) img = p.vy < 0 ? frames.jump : frames.fall;
    else if (Math.abs(p.vx) > 0.15) img = frames.walk[Math.floor(p.anim) % 4];
    else img = Math.floor(p.idleT / 150) % 2 === 1 && p.idleT % 150 < 8 ? frames.idle[1] : Math.floor(p.idleT / 30) % 2 ? frames.bob : frames.idle[0];
    const sq = p.squash > 0 ? 1 - p.squash * 0.035 : p.squash < 0 ? 1 + -p.squash * 0.03 : 1;
    const w = Math.round(PW * (2 - sq)), h = Math.round(PH * sq);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(Math.round(p.x + 3), GROUND - 1 - (p.y + PH < GROUND - 1 ? 0 : 0), 10, 1);
    ctx.save();
    ctx.translate(Math.round(p.x + PW / 2), Math.round(p.y + PH));
    ctx.scale(p.face, 1);
    ctx.drawImage(img, -Math.round(w / 2), -h, w, h);
    ctx.restore();
  };

  let last = 0, acc = 0;
  const loop = (now: number) => {
    requestAnimationFrame(loop);
    if (!visible) { last = now; return; }
    acc += Math.min(100, now - (last || now)); last = now;
    let n = 0; while (acc >= 16.67 && n < 4) { update(); acc -= 16.67; n++; }
    if (n) draw();
  };
  addEventListener('resize', layout);
  layout(); draw();
  requestAnimationFrame(loop);
}

// 结尾小人挥手（静态绘制在小画布上）
export function drawMascot(canvas: HTMLCanvasElement) {
  const img = spriteCanvas(HERO_FRAMES.jump, HERO_PAL);
  canvas.width = 16; canvas.height = 20;
  const c = canvas.getContext('2d')!; c.drawImage(img, 0, 0);
}
