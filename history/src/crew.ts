// 船上 7 位男性船员：头像与海面英雄共用同一套像素形象。
// 姿势和衣服颜色用来区分彼此，不代表真实职务。
import { C } from './pixel';

export type HairStyle = 'cap' | 'bandana' | 'slick' | 'spiky' | 'curly' | 'phones' | 'short';
export type Pose = 'steer' | 'wave' | 'idle' | 'cheer' | 'laptop' | 'nod' | 'point';

export interface Crew {
  hair: string;
  style: HairStyle;
  skin: string;
  shirt: string;
  shade: string;
  pose: Pose;
  x: number;
}

export const CREW: Crew[] = [
  { hair: '#1d1a3a', style: 'cap', skin: '#f2c79b', shirt: '#1d2b6b', shade: '#141f52', pose: 'steer', x: 4 },
  { hair: '#2b2440', style: 'bandana', skin: '#f6d2b0', shirt: C.coral, shade: '#d9584a', pose: 'wave', x: 16 },
  { hair: '#2a2458', style: 'slick', skin: '#e8b88a', shirt: C.white, shade: '#c9cbe8', pose: 'idle', x: 27 },
  { hair: '#ffd23f', style: 'spiky', skin: '#f2c79b', shirt: C.gold, shade: C.goldDk, pose: 'cheer', x: 38 },
  { hair: '#6b3f26', style: 'curly', skin: '#c98d62', shirt: '#4fbf8f', shade: '#33916a', pose: 'laptop', x: 52 },
  { hair: '#2b2440', style: 'phones', skin: '#f6d2b0', shirt: '#9b6cff', shade: '#7448d6', pose: 'nod', x: 62 },
  { hair: '#14112a', style: 'short', skin: '#e8b88a', shirt: '#6fd3ff', shade: '#3fa3d6', pose: 'point', x: 72 },
];

export const PORTRAIT = 48;

/** ox, oy 是头部 7× 包围盒的左上角（不含向上伸出的头发） */
export function drawPerson(
  g: CanvasRenderingContext2D,
  p: Crew,
  i: number,
  t: number,
  jolt: number,
  still: boolean,
  ox: number,
  oy: number,
) {
  const ph = t + i * 37;
  const beat = still ? 0 : Math.floor(ph / 12) % 2;
  const idleBob = still ? 0 : (Math.sin(ph / 23 + i) > 0.55 ? -1 : 0);
  const nod = p.pose === 'nod' && !still ? Math.floor(ph / 9) % 2 : 0;
  const x = ox;
  const y = oy + idleBob + jolt;
  const px = (cx: number, cy: number, c: string, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x + cx, y + cy, w, h); };
  const ink = C.ink;
  const hy = nod;
  const hp = (cx: number, cy: number, c: string, w = 1, h = 1) => px(cx, cy + hy, c, w, h);
  hp(0, 1, ink, 7, 6); hp(1, 0, ink, 5, 1);
  hp(1, 1, p.skin, 5, 5);
  const blink = !still && (ph % 211) < 6;
  if (blink) hp(4, 3, ink, 2, 1); else { hp(4, 3, ink); hp(5, 3, ink); }
  hp(5, 5, '#e98a7a');
  if (p.pose === 'cheer' || p.pose === 'wave') hp(4, 5, '#c0505a', 2, 1);
  if (p.style === 'cap') {
    hp(0, -1, ink, 7, 1); hp(1, 0, '#1d2b6b', 5, 2); hp(6, 1, '#1d2b6b', 2, 1); hp(2, 0, C.gold, 1, 1);
  } else if (p.style === 'bandana') {
    hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair, 2, 1);
    hp(0, 1, ink, 7, 2); hp(1, 1, '#c43c3c', 5, 1); hp(0, 2, '#8a2a2a', 1, 3);
  } else if (p.style === 'slick') {
    hp(1, 0, p.hair, 5, 2); hp(1, 1, p.hair, 5, 1); hp(5, 2, p.hair, 1, 1); hp(1, 0, '#3a3190', 1, 2);
  } else if (p.style === 'spiky') {
    hp(1, 0, p.hair, 5, 2); hp(1, -1, p.hair); hp(3, -2, p.hair); hp(5, -1, p.hair); hp(1, 2, p.hair);
  } else if (p.style === 'curly') {
    hp(0, 0, p.hair, 7, 2); hp(0, 2, p.hair, 2, 2); hp(-1, 1, p.hair, 1, 2);
  } else if (p.style === 'phones') {
    hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair);
    hp(0, -1, '#14112a', 7, 1); hp(-1, 2, '#ff7b6b', 2, 3); hp(6, 2, '#ff7b6b', 2, 3);
  } else {
    hp(1, 0, p.hair, 5, 2); hp(1, 2, p.hair, 2, 1);
  }
  px(0, 7, ink, 7, 7); px(1, 7, p.shirt, 5, 7); px(1, 7, p.shade, 1, 7);
  const arm = (cx: number, cy: number, w: number, h: number) => { px(cx, cy, ink, w + 2, h + 2); px(cx + 1, cy + 1, p.skin, w, h); };
  switch (p.pose) {
    case 'steer': {
      arm(5, 8, 2, 1);
      g.fillStyle = ink; g.fillRect(x + 8, y + 6, 5, 5);
      g.fillStyle = '#b07a4a'; g.fillRect(x + 9, y + 7, 3, 3);
      g.fillStyle = '#6a3f22';
      if (beat) { g.fillRect(x + 10, y + 6, 1, 5); g.fillRect(x + 8, y + 8, 5, 1); }
      else { g.fillRect(x + 9, y + 7, 1, 1); g.fillRect(x + 11, y + 9, 1, 1); g.fillRect(x + 11, y + 7, 1, 1); g.fillRect(x + 9, y + 9, 1, 1); }
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

/** 48×48 胸像：把船上同一套形象放大三倍，脸和发型占满画幅。 */
export function drawCrewPortrait(g: CanvasRenderingContext2D, p: Crew, i: number, still = true) {
  const s = PORTRAIT;
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, s, s);
  // 偏亮的夜空，深色头发也能分清
  const bg = ['#2a2a72', '#323888', '#2c4aa0', '#365cf5'];
  bg.forEach((c, r) => { g.fillStyle = c; g.fillRect(1, 1 + r * 11, s - 2, 12); });
  g.fillStyle = '#2c49c8'; g.fillRect(1, 38, s - 2, 9);
  g.fillStyle = '#8fb0ff'; g.fillRect(1, 38, s - 2, 2);
  const tmp = document.createElement('canvas');
  tmp.width = 16; tmp.height = 16;
  const tg = tmp.getContext('2d')!;
  tg.imageSmoothingEnabled = false;
  // 只取头和肩膀；留 3px 给向上的头发/帽子
  const ox = (p.pose === 'steer' || p.pose === 'point' || p.pose === 'laptop' || p.pose === 'wave') ? 2 : 4;
  drawPerson(tg, p, i, 90, 0, still, ox, 5);
  g.drawImage(tmp, 0, 0, 16, 16, 0, 0, s, s);
  g.fillStyle = C.ink;
  g.fillRect(0, 0, s, 2); g.fillRect(0, s - 2, s, 2); g.fillRect(0, 0, 2, s); g.fillRect(s - 2, 0, 2, s);
  g.fillStyle = C.gold;
  g.fillRect(2, 2, 3, 2); g.fillRect(s - 5, 2, 3, 2); g.fillRect(2, s - 4, 3, 2); g.fillRect(s - 5, s - 4, 3, 2);
}

export function paintTeamAvatars(root: ParentNode) {
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-crew]').forEach((c) => {
    const i = Number(c.dataset.crew);
    const p = CREW[i];
    if (!p) return;
    c.width = PORTRAIT;
    c.height = PORTRAIT;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    drawCrewPortrait(g, p, i, true);
  });
}
