import './style.css';
import { site, game, milestones, closing, ui } from './data/timeline';
import { initHero } from './hero';
import { initGame, drawMascot } from './game';
import { corridorHTML, initCorridor, loadPosterImages } from './corridor';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('reduced');
const first = milestones[milestones.length - 1].date, last = milestones[0].date;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <nav class="nav" id="nav">
    <a class="logo" href="#hero"><img src="/images/brand/logo.svg" alt="" /><span>OFFERBIU</span></a>
    <div class="nav-track" aria-hidden="true"><small>${esc(first)}</small><div class="track"><i id="nav-mark"></i></div><small>${esc(last)}</small></div>
    <div class="nav-links">${ui.nav.map((n) => `<a href="#${n.id}" data-id="${n.id}">${esc(n.label)}</a>`).join('')}</div>
  </nav>

  <section class="hero" id="hero">
    <canvas class="pixel hero-canvas" aria-hidden="true"></canvas>
    <div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="kicker"><i class="dot"></i>${esc(ui.heroKicker)} · ${esc(first)} — ${esc(last)}</p>
      <h1><span class="wordmark">${esc(site.name)}</span><span class="h1-sub">${esc(site.title.replace(site.name, '').trim())}</span></h1>
      <p class="tagline">${esc(site.tagline)}</p>
      <p class="subline">${esc(site.subline)}</p>
      <ul class="facts">${site.heroFacts.map((f) => `<li><b>${esc(f.value)}</b><span>${esc(f.label)}</span></li>`).join('')}</ul>
      <div class="ctas"><a class="btn primary" href="#play">${esc(ui.heroCta)} →</a><a class="btn" href="#corridor">${esc(ui.heroCta2)}</a></div>
    </div>
    <a class="scroll-hint" href="#play"><span class="arrow">▼</span>${esc(ui.scrollHint)}</a>
  </section>
  <div class="edge" style="--from:#101d5e;--to:#211b57"></div>

  <section class="play" id="play">
    <div class="play-inner reveal">
      <div class="play-head">
        <div><span class="chip">${esc(ui.nav[1].label)}</span><h2>${esc(game.title)}</h2></div>
        <div class="hud">
          <div class="hud-box"><i class="coin-ico"></i><span>${esc(game.coinLabel.toUpperCase())}</span><b id="count">000</b></div>
          <div class="hud-box small"><span>${esc(ui.best)}</span><b id="best">000</b></div>
          <button class="hud-box small btn-sound" id="sound" aria-pressed="false">${esc(ui.soundOff)}</button>
        </div>
      </div>
      <div class="game-wrap" id="game-wrap"><canvas class="pixel game-canvas" tabindex="0" aria-label="${esc(game.hint)}"></canvas><div class="float-layer" id="float-layer"></div></div>
      <p class="hint">${game.hint.split(' · ').map((h) => `<span>${esc(h)}</span>`).join('')}</p>
      <div class="touch"><button data-key="L" aria-label="左">◀</button><button data-key="R" aria-label="右">▶</button><span class="sp"></span><button data-key="S">跑</button><button data-key="J" class="jump">跳</button></div>
    </div>
  </section>
  <div class="edge" style="--from:#211b57;--to:#0a0820"></div>

  ${corridorHTML()}
  <div class="edge" style="--from:#0a0820;--to:#0e0b26"></div>

  <section class="closing" id="closing">
    <div class="closing-inner">
      <span class="chip reveal">${esc(ui.nav[3].label)}</span>
      <h2 class="reveal">${esc(closing.title)}</h2>
      <div class="board">
        <div class="note reveal" style="--r:-1.5deg"><i class="pin"></i><h4>现在</h4><ul>${closing.now.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>
        <div class="note reveal" style="--r:1deg"><i class="pin"></i><h4>团队</h4><div class="team">${closing.team.map((t) => `
          <div class="member"><div class="avatar" data-src="${esc(t.avatar)}"><span>头像<br>待补充</span></div><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div>`).join('')}</div></div>
        <div class="note reveal" style="--r:-0.5deg"><i class="pin"></i><h4>联系</h4><ul class="contact">${closing.contact.map((c) => `<li><span>${esc(c.label)}</span>${esc(c.value)}</li>`).join('')}</ul></div>
      </div>
      <div class="mascot reveal"><div class="bubble">${esc(ui.mascotSay)}</div><canvas class="pixel" id="mascot"></canvas></div>
    </div>
    <div class="street"></div>
    <footer><span class="logo"><img src="/images/brand/logo.svg" alt="" /><span>OFFERBIU</span></span><p>${esc(closing.footer)}</p><small>${esc(ui.credits)}</small></footer>
  </section>
`;

// 头像
document.querySelectorAll<HTMLElement>('.avatar[data-src]').forEach((el) => {
  const img = new Image(); img.onload = () => { el.innerHTML = ''; el.append(img); el.classList.add('loaded'); }; img.src = el.dataset.src!;
});
loadPosterImages();
initHero(document.querySelector('.hero-canvas')!, reduced);
initGame({
  canvas: document.querySelector('.game-canvas')!, wrap: document.getElementById('game-wrap')!, counter: document.getElementById('count')!,
  best: document.getElementById('best')!, floatLayer: document.getElementById('float-layer')!, sound: document.getElementById('sound') as HTMLButtonElement,
  reduced, soundLabels: [ui.soundOn, ui.soundOff],
});
initCorridor(reduced);
drawMascot(document.getElementById('mascot') as HTMLCanvasElement);

// 导航：滚动进度 + 当前区块
const nav = document.getElementById('nav')!, mark = document.getElementById('nav-mark')!;
const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('.nav-links a'));
const onScroll = () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  mark.style.left = `${(scrollY / Math.max(1, h)) * 100}%`;
  nav.classList.toggle('solid', scrollY > innerHeight * 0.6);
  let curId = 'hero';
  for (const n of ui.nav) { const el = document.getElementById(n.id); if (el && el.getBoundingClientRect().top < innerHeight * 0.5) curId = n.id; }
  links.forEach((a) => a.classList.toggle('on', a.dataset.id === curId));
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// 进场
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// 加载层
const loader = document.getElementById('loader');
const done = () => { loader?.classList.add('hide'); setTimeout(() => loader?.remove(), 600); document.body.classList.add('ready'); };
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => setTimeout(done, reduced ? 0 : 350));
