import { asset } from './asset';
import './report.css';

const img = (path: string) => asset(`/images/report/${path}`);

type Shot = { file: string; title: string; alt?: string };

type Scene = {
  title: string;
  em: string;
  html: string;
};

type Feat = {
  name: string;
  text: string;
  shots: Shot[];
};

const buddy = (name: string, place: 'top' | 'side' | 'left') =>
  `<img class="rpt-buddy rpt-buddy-${place}" src="${img('char-' + name + '.png')}" alt="" width="96" height="144">`;

const shot = (file: string, alt: string, caption = '') => `
  <figure class="rpt-shot" data-zoom-img>
    <img src="${img(file)}" alt="${alt}" loading="lazy">
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
  </figure>`;

const deck = (items: Shot[]) => `
  <div class="rpt-deck" data-deck role="button" tabindex="0" aria-label="点按切换画面">
    ${items
      .map(
        (it, i) => `
      <figure class="${i === 0 ? 'is-front' : ''}" style="--i:${i}">
        <img src="${img(it.file)}" alt="${it.alt ?? it.title}" loading="lazy">
        <figcaption>${it.title}</figcaption>
      </figure>`,
      )
      .join('')}
  </div>`;

const zoomBtn = `<button type="button" class="rpt-zoom-btn" aria-label="放大展示">放大</button>`;

const features: Feat[] = [
  {
    name: '查找岗位',
    text: '按企业、行业、方向和城市筛选，查看要求，并跳转到企业官网或高校就业网。',
    shots: [
      { file: '03-jobs.png', title: '校招岗位库' },
      { file: '04-jobs-filters.png', title: '岗位筛选' },
    ],
  },
  {
    name: '编辑简历',
    text: '多套模板在线预览和编辑，保留版本，可以导出页面或打印成 PDF。',
    shots: [
      { file: '14-resume-studio.png', title: '简历工作室' },
      { file: '15-resume-preview.png', title: '课程演示 · 简历预览', alt: '光头强简历导出预览，课程演示' },
      { file: '05-templates.png', title: '简历模板' },
    ],
  },
  {
    name: '评估岗位',
    text: '把已确认经历和岗位要求对照，标出符合、尚未写到或不一致的地方，并指出依据。',
    shots: [{ file: 'match-guangtouqiang.png', title: '课程演示 · 对照结果', alt: '光头强岗位对照结果，课程演示' }],
  },
  {
    name: '管理进度',
    text: '收藏岗位、更新状态、记下笔试面试和截止日期。正式投递在官网完成，回来确认后留档。',
    shots: [
      { file: '16-applications.png', title: '我的投递' },
      { file: '17-calendar.png', title: '日程与待办' },
    ],
  },
  {
    name: '私人岗位',
    text: '手动录入或粘贴职位描述，只自己可见，并进入评估和材料流程。',
    shots: [],
  },
];

const featList = () => `
  <ul class="rpt-feats" data-feat-list>
    ${features
      .map(
        (f, i) => `
      <li class="${i === 0 ? 'is-on' : ''}" data-feat="${i}" role="button" tabindex="0">
        <b>${f.name}</b> ${f.text}
      </li>`,
      )
      .join('')}
  </ul>`;

const featFrame = (feat: Feat) =>
  feat.shots.length
    ? deck(feat.shots)
    : `<div class="rpt-feat-empty"><b>${feat.name}</b><p>${feat.text}</p><span>界面截图待补</span></div>`;

const scenes: Scene[] = [
  {
    title: '项目整体正常推进。',
    em: '主体功能可以演示，下一阶段还在按计划往前走。',
    html: `
      <div class="rpt-board is-progress">
        ${zoomBtn}
        ${buddy('wave', 'top')}
        <div class="rpt-copy">
          <p class="rpt-status">正常推进</p>
          <p>Offerbiu 是面向 2027 届的本机求职工作台。课程正式范围是 7 个用况、55 条需求。查找岗位、编辑简历、跟进投递和安排日程已经可以演示；后来补上的岗位评估、申请材料和私人岗位，也已经接到这条路径上。</p>
          <ul class="rpt-chips">
            <li><b>7</b><span>个正式用况</span></li>
            <li><b>55</b><span>条需求</span></li>
            <li><b>24,193</b><span>条校招与实习</span></li>
            <li><b>215</b><span>家企业 · 32 个行业</span></li>
          </ul>
          <ul class="rpt-mile">
            <li data-st="done"><b>已验收</b><span>AI 求职工作流（经历底稿、岗位评估、材料草拟与复核、投递留档），记录于 2026-10-23。</span></li>
            <li data-st="now"><b>进行中</b><span>私人岗位已实现并完成规格复核，2026-11-09 的记录仍写「代码审查中」。</span></li>
            <li data-st="next"><b>待开展</b><span>招聘轮次与提醒、岗位订阅、PDF / Word 导入、中文 Word 导出与投递前检查。</span></li>
          </ul>
          <p class="rpt-quiet">今天（2026-11-16）核对，本机目录仍以 2026-11-14 为准：24,193 条（校招 16,375、实习 7,818）。演示站目前是 23,747 条（校招 15,929、实习 7,818），214 家企业。</p>
        </div>
        ${shot('01-home.png', 'Offerbiu 品牌主页')}
      </div>`,
  },
  {
    title: '打开就能查岗位、改简历。',
    em: '登录之后，投递进度和相关日程会保存在账号当中。',
    html: `
      <div class="rpt-board is-feats" data-feats>
        ${zoomBtn}
        ${buddy('cheer', 'top')}
        ${featList()}
        <div class="rpt-feat-frame" data-feat-frame>
          ${featFrame(features[0])}
        </div>
        <p class="rpt-quiet">点左侧功能切换画面；有多张图时点图可继续切换。演示站是 <a href="https://www.papertrace.xyz/" target="_blank" rel="noreferrer">www.papertrace.xyz</a>。</p>
      </div>`,
  },
  {
    title: '一层界面，一层本机服务。',
    em: '本地优先，岗位来自官网采集。',
    html: `
      <div class="rpt-board is-diagram">
        ${zoomBtn}
        ${buddy('dev', 'top')}
        <p>工作台默认在本机打开，个人数据写在本机数据库，不自动同步到云端。浏览器里是品牌主页和求职工作台，底下由本机的 Node.js 服务提供接口。岗位来自对企业官网、专属招聘系统和高校就业网的离线采集，保留来源；空着的字段就空着。需要用到模型时，再在你同意之后发出请求。</p>
        ${shot('architecture.png', '系统结构图：展示层、本机服务、本地数据与外部服务', '系统结构图')}
      </div>`,
  },
  {
    title: '数据从哪来，到哪去。',
    em: '先看对外的总图，再看工作台里的五步加工。',
    html: `
      <div class="rpt-board is-flow">
        ${zoomBtn}
        ${buddy('point', 'left')}
        <p>求职者把简历、求职记录和确认过的经历交给工作台，换回岗位、评估、材料建议和日程。维护者更新岗位目录。公开岗位来自企业官网和高校就业网，真正投递时再回到官方页面。模型只接收已确认的经历和岗位要求，返回评估、润色和材料建议。内部是五步加工：采集与岗位库、简历与经历、评估与材料、投递与日程、模型调用。</p>
        ${deck([
          { file: 'dfd-context.png', title: '数据流图 · 第 0 层', alt: '数据流图第 0 层上下文图' },
          { file: 'dfd-level1.png', title: '数据流图 · 第 1 层', alt: '数据流图第 1 层，工作台内五步加工' },
        ])}
        <p class="rpt-quiet">点按切换：先看对外往来，再看采集、简历、评估、投递与模型调用。</p>
      </div>`,
  },
  {
    title: '七个用况，再加上后来的路。',
    em: '评估、材料和私人岗位，是接着铺上去的。',
    html: `
      <div class="rpt-board is-diagram">
        ${zoomBtn}
        ${buddy('guide', 'side')}
        <p>正式用况是 UC-01 到 UC-07。图中虚线框里是后来补上的路径，例如岗位评估、申请材料和私人岗位。</p>
        ${shot('uml-usecases.png', '用例图：求职者与维护者，以及后来补上的路径', '用例图')}
      </div>`,
  },
  {
    title: 'AI 只给出提案。',
    em: '你确认发送，也只有你点头，才写入新简历。',
    html: `
      <div class="rpt-board is-diagram">
        ${zoomBtn}
        ${buddy('ai', 'top')}
        <p>可以请模型帮忙的事有四件：测试连接、按岗位润色段落、对照岗位做评估、草拟申请材料并再做一次独立复核。每一次都要先由你同意发送。返回的都是提案；资料不完整时，不会给出一个拿来硬比的总分。工作台不会替你向企业提交申请。这条链路已经做过功能和技术验收，并用虚构候选人跑通过评估。下面用光头强来看效果。</p>
        ${shot('ai-sequence.png', 'AI 工作顺序图：确认之后一次评估怎么走完', 'AI 工作顺序图')}
      </div>`,
  },
  {
    title: '光头强先把说大了的经历收回来。',
    em: '再拿去对照岗位，看看哪些站得住。',
    html: `
      <div class="rpt-board is-demo">
        ${zoomBtn}
        ${buddy('cheer', 'top')}
        <div class="rpt-demo-head">
          <img class="rpt-avatar" src="${img('guangtouqiang-avatar.png')}" alt="光头强像素头像" width="96" height="96">
          <p>他先写了一份说得很满的简历，润色后把没有依据的头衔和数字收回来，再对照岗位，分别标出符合、部分符合和尚未写到的条件。</p>
        </div>
        <div class="rpt-demo-viz">
          ${deck([
            { file: 'resume-guangtouqiang-before.png', title: '润色前', alt: '光头强简历润色前' },
            { file: 'resume-guangtouqiang-after.png', title: '润色后', alt: '光头强简历润色后' },
          ])}
          <figure class="rpt-match" data-zoom-img>
            <img src="${img('match-guangtouqiang.png')}" alt="光头强岗位对照结果" loading="lazy">
            <figcaption>对照结果</figcaption>
          </figure>
        </div>
        <span class="rpt-badge">课程演示</span>
        <p class="rpt-quiet">对比稿里的学历和在校时间也做了演示性调整；产品里的润色本身，不会去改学历或日期。</p>
      </div>`,
  },
  {
    title: '下一步按计划往下做。',
    em: '先收束私人岗位，再补提醒、订阅和简历进出。',
    html: `
      <div class="rpt-board is-plan">
        ${zoomBtn}
        ${buddy('dev', 'top')}
        <p>本轮目标：把私人岗位稳稳接到现有工作流里，并依次补上招聘过程管理、岗位订阅，以及简历的导入与 Word 导出。面试模拟、Offer 比较和求职效果统计不进入本轮。</p>
        <ol class="rpt-gantt">
          <li class="is-now"><i>收尾</i><b>私人岗位审查关闭，进入可日常使用</b><span>进行中</span></li>
          <li><i>过程提醒</i><b>招聘轮次、提醒、时间冲突提示、日历导出</b><span>待开展</span></li>
          <li><i>岗位订阅</i><b>目录增量更新与变化提醒</b><span>待开展</span></li>
          <li><i>简历导入</i><b>已有 PDF / Word 简历导入，并逐项核对</b><span>待开展</span></li>
          <li><i>Word 导出</i><b>中文 Word 导出与投递前检查</b><span>待开展</span></li>
          <li><i>综合验收</i><b>验收并更新操作说明</b><span>待执行</span></li>
        </ol>
        <p class="rpt-quiet">计划按上述事项推进。具体组员分工请在汇报前填写。</p>
      </div>`,
  },
];

export function reportHTML(): string {
  const lines = scenes
    .map((s, i) => `<h2 class="rpt-line${i === 0 ? ' on' : ''}">${s.title}<em>${s.em}</em></h2>`)
    .join('');
  const ticks = scenes.map((_, i) => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('');
  const boards = scenes
    .map(
      (s) => `
        <div class="rpt-scene">
          <p class="rpt-cap">${s.title}<em>${s.em}</em></p>
          ${s.html}
        </div>`,
    )
    .join('');

  return `
  <section class="report" id="report" style="--rpt-scenes:${scenes.length}" aria-label="课程汇报">
    <div class="rpt-pin">
      <div class="rpt-stage">
        <div class="rpt-say" id="rpt-say">
          ${lines}
          <div class="rpt-ticks" id="rpt-ticks" aria-hidden="true">${ticks}</div>
        </div>
        <div class="rpt-reel">
          <div class="rpt-strip" id="rpt-strip">${boards}</div>
        </div>
      </div>
      <p class="rpt-hint" id="rpt-hint">往下滚 · 点右侧板块可放大</p>
    </div>
    <div class="rpt-zoom" id="rpt-zoom" hidden>
      <button type="button" class="rpt-zoom-x" aria-label="关闭放大">关闭</button>
      <div class="rpt-zoom-body" id="rpt-zoom-body"></div>
    </div>
  </section>`;
}

const advanceDeck = (deck: HTMLElement) => {
  const figs = Array.from(deck.querySelectorAll('figure'));
  if (figs.length < 2) return;
  const i = figs.findIndex((f) => f.classList.contains('is-front'));
  const next = (i + 1) % figs.length;
  figs.forEach((f, n) => f.classList.toggle('is-front', n === next));
};

function bindDecks(reduced: boolean, getIdx: () => number): (idx: number) => void {
  const root = document.getElementById('report');
  root?.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.rpt-zoom-btn, .rpt-zoom, [data-feat]')) return;
    const d = t.closest<HTMLElement>('[data-deck]');
    if (d) advanceDeck(d);
  });
  root?.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (!t.closest('[data-deck]')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advanceDeck(t.closest('[data-deck]') as HTMLElement);
    }
  });

  let timer = 0;
  const watch = (idx: number) => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
    if (reduced) return;
    const scene = document.querySelectorAll<HTMLElement>('.rpt-scene')[idx];
    if (!scene) return;
    const feats = scene.querySelector<HTMLElement>('[data-feats]');
    if (feats) return;
    const active = Array.from(scene.querySelectorAll<HTMLElement>('[data-deck]'));
    if (!active.length) return;
    timer = window.setInterval(() => active.forEach(advanceDeck), 2800);
  };

  watch(getIdx());
  return watch;
}

function bindFeats(reduced: boolean, getIdx: () => number): (idx: number) => void {
  const root = document.querySelector<HTMLElement>('[data-feats]');
  if (!root) return () => undefined;
  const list = root.querySelector<HTMLElement>('[data-feat-list]');
  const frame = root.querySelector<HTMLElement>('[data-feat-frame]');
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-feat]'));
  if (!list || !frame || !items.length) return () => undefined;

  let cur = 0;
  const show = (i: number) => {
    cur = (i + features.length) % features.length;
    items.forEach((el, n) => el.classList.toggle('is-on', n === cur));
    frame.innerHTML = featFrame(features[cur]);
  };

  const onPick = (el: HTMLElement) => {
    const i = Number(el.dataset.feat);
    if (Number.isFinite(i)) show(i);
  };
  list.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-feat]');
    if (el) onPick(el);
  });
  list.addEventListener('keydown', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-feat]');
    if (!el) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(el);
    }
  });

  let timer = 0;
  const watch = (idx: number) => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
    if (reduced) return;
    const scene = document.querySelectorAll<HTMLElement>('.rpt-scene')[idx];
    if (!scene?.contains(root)) return;
    timer = window.setInterval(() => {
      const deck = frame.querySelector<HTMLElement>('[data-deck]');
      const figs = deck ? Array.from(deck.querySelectorAll('figure')) : [];
      const front = figs.findIndex((f) => f.classList.contains('is-front'));
      if (deck && figs.length > 1 && front < figs.length - 1) {
        advanceDeck(deck);
      } else {
        show(cur + 1);
      }
    }, 3200);
  };
  watch(getIdx());
  return watch;
}

function bindZoom(): void {
  const zoom = document.getElementById('rpt-zoom');
  const body = document.getElementById('rpt-zoom-body');
  const root = document.getElementById('report');
  if (!zoom || !body || !root) return;

  const close = () => {
    zoom.hidden = true;
    body.innerHTML = '';
    document.documentElement.classList.remove('rpt-zooming');
  };
  const open = (node: HTMLElement) => {
    body.innerHTML = '';
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.rpt-zoom-btn, .rpt-buddy').forEach((el) => el.remove());
    if (clone.classList.contains('rpt-board')) clone.classList.add('is-zoomed');
    body.append(clone);
    zoom.hidden = false;
    document.documentElement.classList.add('rpt-zooming');
  };

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.rpt-zoom-x') || t === zoom) {
      e.preventDefault();
      close();
      return;
    }
    if (t.closest('#rpt-zoom-body')) return;
    const btn = t.closest<HTMLElement>('.rpt-zoom-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const board = btn.closest<HTMLElement>('.rpt-board');
      if (board) open(board);
      return;
    }
    const fig = t.closest<HTMLElement>('[data-zoom-img]');
    if (fig && !t.closest('[data-deck]')) {
      e.preventDefault();
      open(fig);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !zoom.hidden) close();
  });
}

export function initReport(reduced: boolean): void {
  const act = document.getElementById('report');
  const strip = document.getElementById('rpt-strip');
  const hint = document.getElementById('rpt-hint');
  if (!act || !strip) return;

  const says = Array.from(document.querySelectorAll<HTMLElement>('#rpt-say .rpt-line'));
  const ticks = Array.from(document.querySelectorAll<HTMLElement>('#rpt-ticks i'));
  const n = says.length;
  if (!n) return;

  let lastIdx = 0;
  bindZoom();
  const watchDecks = bindDecks(reduced, () => lastIdx);
  const watchFeats = bindFeats(reduced, () => lastIdx);

  if (reduced) {
    act.classList.add('is-static');
    return;
  }

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const fit = () => {
    const w = innerWidth;
    const h = innerHeight;
    const k = w <= 820
      ? Math.min(1, Math.max(0.56, (w - 40) / 480))
      : Math.min(1.25, Math.max(0.72, Math.min(w / 1280, h / 800)));
    act.style.setProperty('--rpt-k', k.toFixed(3));
  };
  const prog = () => {
    const r = act.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight));
  };

  let queued = false;
  const frame = () => {
    queued = false;
    const p = prog();
    const f = p * (n - 1);
    strip.style.transform = `translate3d(0,${-f * innerHeight}px,0)`;
    const idx = Math.round(f);
    if (idx !== lastIdx) {
      says.forEach((h, i) => h.classList.toggle('on', i === idx));
      ticks.forEach((t, i) => t.classList.toggle('on', i <= idx));
      lastIdx = idx;
      watchDecks(idx);
      watchFeats(idx);
    }
    if (hint) hint.style.opacity = String(1 - clamp(f / 0.35));
  };
  const ask = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };

  fit();
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', () => {
    fit();
    ask();
  });
  ask();
}
