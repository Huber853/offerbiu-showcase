// 原创像素绘制工具：5×7 字库、精灵图、调色板
export const C = {
  night: '#0e0b26', night2: '#16123a', navy: '#1d1a4d', indigo: '#2a2468', violet: '#3a3190',
  brand: '#365cf5', brandHi: '#6f8cff', brandDk: '#2440b8', deep: '#1d2b6b',
  gold: '#ffd23f', goldDk: '#c98f00', cream: '#fff8e6', warm: '#ffe9a8',
  coral: '#ff7b6b', ink: '#14112a', white: '#ffffff', grey: '#6c6a8f',
};

const G5: Record<string, string> = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  R: '11110 10001 10001 11110 10100 10010 10001', S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010',
  Y: '10001 10001 01010 00100 00100 00100 00100', '0': '01110 10011 10101 10101 11001 10001 01110',
  '1': '00100 01100 00100 00100 00100 00100 01110', '2': '01110 10001 00001 00110 01000 10000 11111',
  '3': '11110 00001 00001 01110 00001 00001 11110', '4': '00010 00110 01010 10010 11111 00010 00010',
  '5': '11111 10000 11110 00001 00001 10001 01110', '6': '00110 01000 10000 11110 10001 10001 01110',
  '7': '11111 00001 00010 00100 01000 01000 01000', '8': '01110 10001 10001 01110 10001 10001 01110',
  '9': '01110 10001 10001 01111 00001 00010 01100', '?': '01110 10001 00001 00110 00100 00000 00100',
  '!': '00100 00100 00100 00100 00100 00000 00100', '.': '00000 00000 00000 00000 00000 00000 00100',
  ' ': '00000 00000 00000 00000 00000 00000 00000', '-': '00000 00000 00000 01110 00000 00000 00000',
};

export function pixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, s = 1) {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  for (const ch of text.toUpperCase()) {
    const rows = (G5[ch] ?? G5[' ']).split(' ');
    rows.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '1') ctx.fillRect(cx + rx * s, Math.round(y) + ry * s, s, s); });
    cx += 6 * s;
  }
}
export const pixelTextWidth = (text: string, s = 1) => text.length * 6 * s - s;

export type Sprite = string[];
export function spriteCanvas(sp: Sprite, pal: Record<string, string>): HTMLCanvasElement {
  const w = Math.max(...sp.map((r) => r.length)); const c = document.createElement('canvas');
  c.width = w; c.height = sp.length; const x = c.getContext('2d')!;
  sp.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (pal[k]) { x.fillStyle = pal[k]; x.fillRect(rx, ry, 1, 1); } } });
  return c;
}

// ---------------- 主角：求职小人（16×20，原创） ----------------
export const HERO_PAL: Record<string, string> = {
  o: C.ink, h: '#2b2440', H: '#453a6b', s: '#f2c79b', S: '#d9a273', r: '#ff9a8a',
  b: C.brand, B: C.brandDk, w: C.white, y: C.gold, d: C.deep, k: '#0b0a1c',
};
const HEAD = [
  '.....oooooo.....',
  '....ohhhhhhoo...',
  '...ohhHhhhhhho..',
  '...ohhhhhhhhho..',
  '...ohhsssshhho..',
  '...ohssssosso...',
  '...osssssosso...',
  '....ossrssssSo..',
  '.....ossssSoo...',
  '......ooooo.....',
];
const BODY_IDLE = [
  '.....obbwbbo....',
  '....obbbwbbbo...',
  '...osbbbwbbbso..',
  '...osbbbybbbso..',
  '....oBbbbbbBo...',
];
const BODY_SWING_A = [
  '.....obbwbbo....',
  '....obbbwbbbo...',
  '...obbbbwbbbso..',
  '..osbbbbybbbo...',
  '..oo.oBbbbbBo...',
];
const BODY_SWING_B = [
  '.....obbwbbo....',
  '....obbbwbbbo...',
  '...osbbbwbbbbo..',
  '....obbbybbbbso.',
  '....oBbbbbbo.oo.',
];
const LEGS_STAND = ['....odddddddo...', '....odddoddddo..', '....oddo.oddo...', '....okkko.okkko.', '....ooooo.ooooo.'].map((r) => r.slice(0, 16));
const LEGS_STRIDE = ['....odddddddo...', '...oddddoodddo..', '..oddo....oddo..', '.okkko....okkko.', '.ooooo....ooooo.'];
const LEGS_PASS = ['....odddddddo...', '.....oddddddo...', '.....oddooddo...', '.....okkkokkko..', '.....oooooooo...'];
const BODY_JUMP = [
  '..os.obbwbbo.so.',
  '...oobbbwbbboo..',
  '....obbbwbbbo...',
  '....obbbybbbo...',
  '....oBbbbbbBo...',
];
const LEGS_JUMP = ['....odddddddo...', '...odddoodddo...', '..oddo...okkko..', '.okkko....ooo...', '.ooo............'];
const LEGS_FALL = ['....odddddddo...', '....oddddddddo..', '...oddo...oddo..', '...okkko..okkko.', '...oooo...oooo..'];
const BODY_FALL = [
  '.....obbwbbo....',
  'oso.obbbwbbbo.so',
  '.ooobbbbwbbbooo.',
  '....obbbybbbo...',
  '....oBbbbbbBo...',
];
const HEAD_BLINK = HEAD.map((r, i) => (i === 5 ? '...ohssssssss...' : r));

export const HERO_FRAMES = {
  idle: [[...HEAD, ...BODY_IDLE, ...LEGS_STAND], [...HEAD_BLINK, ...BODY_IDLE, ...LEGS_STAND]],
  idleBob: [...HEAD, ...BODY_IDLE.slice(0, 4), '....oBbbbbbBo...', ...LEGS_PASS],
  walk: [
    [...HEAD, ...BODY_SWING_A, ...LEGS_STRIDE],
    [...HEAD, ...BODY_IDLE, ...LEGS_PASS],
    [...HEAD, ...BODY_SWING_B, ...LEGS_STRIDE],
    [...HEAD, ...BODY_IDLE, ...LEGS_PASS],
  ],
  jump: [...HEAD, ...BODY_JUMP, ...LEGS_JUMP],
  fall: [...HEAD, ...BODY_FALL, ...LEGS_FALL],
};

// offer 硬币（8×8，四帧旋转）
const COIN_PAL = { o: C.ink, y: C.gold, Y: '#fff2a8', d: C.goldDk };
export const COIN_FRAMES = [
  ['..oooo..', '.oyyyyo.', 'oyYyydyo', 'oyYyydyo', 'oyYyydyo', 'oyYyydyo', '.oyyddo.', '..oooo..'],
  ['...oo...', '..oyyo..', '.oyYdyo.', '.oyYdyo.', '.oyYdyo.', '.oyYdyo.', '..oydo..', '...oo...'],
  ['...oo...', '...oo...', '...oo...', '...oo...', '...oo...', '...oo...', '...oo...', '...oo...'],
  ['...oo...', '..oyyo..', '.oydYyo.', '.oydYyo.', '.oydYyo.', '.oydYyo.', '..odyo..', '...oo...'],
].map((f) => ({ f, pal: COIN_PAL }));
