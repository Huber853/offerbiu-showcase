import { asset } from './asset';
import { milestones, tagArt, ui, type Milestone } from './data/timeline';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const TAG_CLASS: Record<string, string> = { 起点: 't-origin', 提交: 't-commit', 文档: 't-docs', 功能: 't-feature', 安全: 't-security', 设计: 't-design' };
const md = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? { md: `${d.slice(5, 7)}.${d.slice(8, 10)}`, y: d.slice(0, 4) } : { md: d, y: '' });

export function posterHTML(m: Milestone, i: number) {
  const n = milestones.length - i; const d = md(m.date);
  return `
  <article class="poster ${i % 2 ? 'right' : 'left'}" data-i="${i}">
    <div class="poster-light"></div>
    <div class="poster-frame">
      <header class="poster-head"><span class="brand-mini"><img src="${asset('/images/brand/logo.svg')}" alt="" />OFFERBIU</span><span class="no">No.${String(n).padStart(2, '0')}</span></header>
      <div class="poster-date"><b>${esc(d.md)}</b><span>${esc(d.y)}</span><em class="tag ${TAG_CLASS[m.tag] ?? ''}">${esc(m.tag)}</em></div>
      <div class="poster-img" data-src="${esc(m.image ?? '')}" data-art="${esc(tagArt[m.tag] ?? '')}" data-title="${esc(m.title)}"><div class="shimmer"></div></div>
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.desc)}</p>
    </div>
  </article>`;
}

export function corridorHTML() {
  const ds = milestones.map((m) => Date.parse(m.date)).filter((x) => !isNaN(x));
  const min = Math.min(...ds), max = Math.max(...ds);
  const months: string[] = [];
  for (let d = new Date(min); d.getTime() <= max; d.setMonth(d.getMonth() + 1, 1)) months.push(`<span style="left:${(((max - Math.max(min, d.getTime())) / (max - min)) * 100).toFixed(2)}%">${d.getMonth() + 1}月</span>`);
  const ticks = milestones.map((m, i) => {
    const x = Date.parse(m.date); const left = isNaN(x) ? (i / (milestones.length - 1)) * 100 : ((max - x) / (max - min)) * 100;
    return `<button class="tick" data-i="${i}" style="left:${left.toFixed(2)}%" aria-label="${esc(m.date)} ${esc(m.title)}"></button>`;
  }).join('');
  return `
  <section class="corridor" id="corridor" style="height:${milestones.length * 85 + 100}vh">
    <div class="corridor-sticky">
      <div class="c-head">
        <span class="chip">${esc(ui.corridorLabel)}</span>
        <h2>${esc(ui.corridorLead)}<b class="big-num" id="c-num">01</b>${esc(ui.corridorUnit)}</h2>
        <p id="c-sub"></p>
      </div>
      <div class="stage"><div class="camera" id="camera"><div class="world" id="world">
        <div class="hall" id="hall">
          <div class="floor"></div><div class="ceiling"></div><div class="wall wall-l"></div><div class="wall wall-r"></div>
        </div>
        ${milestones.map((_, i) => `<div class="gate" style="--z:${-i}"></div>`).join('')}
        ${milestones.map(posterHTML).join('')}
        <div class="end-wall"><span>${esc(milestones[milestones.length - 1].date)}</span><b>${esc(milestones[milestones.length - 1].tag)}</b></div>
      </div></div><div class="fog"></div></div>
      <div class="c-info" id="c-info"><div class="c-date" id="c-date"></div><h3 id="c-title"></h3><p id="c-desc"></p></div>
      <div class="axis"><div class="axis-line"><i id="axis-mark"></i>${ticks}</div><div class="axis-months">${months.join('')}</div><small>${esc(ui.corridorHint)}</small></div>
    </div>
  </section>`;
}

export function initCorridor(reduced: boolean) {
  const sec = document.getElementById('corridor')!;
  const world = document.getElementById('world')!;
  const camera = document.getElementById('camera')!;
  const hall = document.getElementById('hall')!;
  const posters = Array.from(world.querySelectorAll<HTMLElement>('.poster'));
  const gates = Array.from(world.querySelectorAll<HTMLElement>('.gate'));
  const num = document.getElementById('c-num')!, sub = document.getElementById('c-sub')!;
  const cDate = document.getElementById('c-date')!, cTitle = document.getElementById('c-title')!, cDesc = document.getElementById('c-desc')!;
  const mark = document.getElementById('axis-mark')!;
  const ticks = Array.from(document.querySelectorAll<HTMLElement>('.tick'));
  const N = milestones.length;
  let depth = 900, cur = 0, target = 0, shown = -1, visible = false, mx = 0, my = 0, lmx = 0, lmy = 0;

  const syncVis = () => {
    const r = sec.getBoundingClientRect();
    visible = r.bottom > 80 && r.top < innerHeight - 80;
  };
  const setDepth = () => {
    depth = innerWidth < 700 ? 620 : 900;
    // 6 个景深大约 5400px，2x 屏上光栅约 10800px，低于常见 16384 纹理上限
    const hallLen = Math.round(6 * depth);
    sec.style.setProperty('--depth', `${depth}px`);
    sec.style.setProperty('--hall', `${hallLen}px`);
    posters.forEach((el, i) => el.style.setProperty('--z', `${-i * depth}px`));
    gates.forEach((el, i) => el.style.setProperty('--gz', `${-i * depth - depth / 2}px`));
    (world.querySelector('.end-wall') as HTMLElement).style.setProperty('--ez', `${-(N - 1) * depth - depth * 0.9}px`);
  };
  const readScroll = () => {
    syncVis();
    const r = sec.getBoundingClientRect(); const total = Math.max(1, sec.offsetHeight - innerHeight);
    target = Math.min(1, Math.max(0, -r.top / total)) * (N - 1);
  };
  const render = () => {
    const z = cur * depth;
    camera.style.transform = `translate3d(${(-mx * 30).toFixed(1)}px, ${(-my * 16).toFixed(1)}px, ${(z - (innerWidth < 700 ? 60 : 140)).toFixed(1)}px)`;
    hall.style.transform = `translateZ(${(-z).toFixed(1)}px)`;
    posters.forEach((el, i) => {
      const d = i - cur;
      const show = d > -0.6 && d < 4.2;
      el.style.visibility = show ? 'visible' : 'hidden';
      el.style.opacity = show ? String(Math.max(0, Math.min(1, 1.15 - Math.abs(d) * 0.22))) : '0';
      el.classList.toggle('focus', Math.abs(d) < 0.5);
    });
    gates.forEach((el, i) => {
      const d = i - cur;
      el.style.visibility = d > -1.2 && d < 5 ? 'visible' : 'hidden';
    });
    const idx = Math.max(0, Math.min(N - 1, Math.round(cur)));
    if (idx !== shown) {
      shown = idx; const m = milestones[idx];
      num.textContent = String(idx + 1).padStart(2, '0');
      sub.textContent = `${m.date} · ${m.title}`;
      cDate.textContent = `${m.date} · ${m.tag}`; cTitle.textContent = m.title; cDesc.textContent = m.desc;
      const info = document.getElementById('c-info')!;
      info.classList.remove('swap');
      // 用 rAF 触发动画，避免读 offsetWidth 强制同步布局
      requestAnimationFrame(() => info.classList.add('swap'));
      ticks.forEach((t, i) => t.classList.toggle('on', i === idx));
      loadNearbyPosters(idx);
    }
    mark.style.left = ticks[idx]?.style.left ?? '0%';
    lmx = mx; lmy = my;
  };
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const k = reduced ? 1 : 0.12;
    const next = cur + (target - cur) * k;
    const settled = Math.abs(next - cur) < 0.0005 && Math.abs(target - cur) < 0.0005;
    const look = mx !== lmx || my !== lmy;
    if (settled && !look) return;
    cur = Math.abs(target - next) < 0.001 ? target : next;
    render();
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { readScroll(); render(); } }).observe(sec);
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', () => { setDepth(); readScroll(); render(); });
  if (!reduced) addEventListener('pointermove', (e) => { if (!visible || e.pointerType !== 'mouse') return; mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  ticks.forEach((t) => t.addEventListener('click', () => {
    const i = Number(t.dataset.i); const total = Math.max(1, sec.offsetHeight - innerHeight);
    scrollTo({ top: sec.offsetTop + (i / (N - 1)) * total + 2, behavior: reduced ? 'auto' : 'smooth' });
  }));
  posters.forEach((p) => p.addEventListener('click', () => ticks[Number(p.dataset.i)].click()));
  setDepth(); readScroll(); syncVis(); cur = target; render(); requestAnimationFrame(loop);
}

const loadState = new WeakMap<HTMLElement, 'pending' | 'done'>();

function paintPlaceholder(el: HTMLElement, src: string, title: string) {
  el.classList.add('empty', 'loaded');
  el.classList.remove('shimmer');
  el.innerHTML = `<span class="ph">${esc(ui.placeholderArt)}${title ? `<strong>${esc(title)}</strong>` : ''}${src ? `<code>public${esc(src)}</code>` : ''}</span>`;
}

function tryImage(el: HTMLElement, url: string, kind: 'shot' | 'art', extraHTML: string, onfail: () => void) {
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.onload = () => { el.innerHTML = ''; el.append(img); if (extraHTML) el.insertAdjacentHTML('beforeend', extraHTML); el.classList.add('loaded', kind); };
  img.onerror = onfail;
  img.src = asset(url);
}

function loadOnePoster(el: HTMLElement) {
  if (loadState.get(el) === 'done' || loadState.get(el) === 'pending') return;
  loadState.set(el, 'pending');
  const src = el.dataset.src || '', art = el.dataset.art || '', title = el.dataset.title || '';
  const artBadge = `<span class="art-badge">${esc(ui.placeholderArt)}</span>${src ? `<code class="art-path">public${esc(src)}</code>` : ''}`;
  const fail = () => { loadState.set(el, 'done'); paintPlaceholder(el, src, title); };
  const useArt = () => {
    if (!art) return fail();
    tryImage(el, art, 'art', artBadge, fail);
  };
  if (!src) return useArt();
  tryImage(el, src, 'shot', '', useArt);
}

/** 只预加载当前卡附近的图，避免一进回廊就把所有大图解码完。 */
export function loadNearbyPosters(idx: number, radius = 3) {
  const nodes = document.querySelectorAll<HTMLElement>('.poster-img');
  const a = Math.max(0, idx - radius), b = Math.min(nodes.length - 1, idx + radius);
  for (let i = a; i <= b; i++) loadOnePoster(nodes[i]!);
}

// 截图优先；没有截图或加载失败时用插画；插画也失败则用文字占位（不编造照片）
export function loadPosterImages() {
  loadNearbyPosters(0, 3);
}
