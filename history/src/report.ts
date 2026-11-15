import { asset } from './asset';
import './report.css';

const img = (path: string) => asset(`/images/report/${path}`);

type Scene = {
  title: string;
  em: string;
  html: string;
};

const shots: { file: string; title: string; href: string }[] = [
  { file: '01-home.png', title: '品牌主页', href: 'https://www.papertrace.xyz/' },
  { file: '02-workspace.png', title: '求职总览', href: 'https://www.papertrace.xyz/workspace/' },
  { file: '03-jobs.png', title: '校招岗位库', href: 'https://www.papertrace.xyz/workspace/#/jobs' },
  { file: '04-jobs-filters.png', title: '更多筛选', href: 'https://www.papertrace.xyz/workspace/#/jobs' },
  { file: '05-templates.png', title: '简历模板', href: 'https://www.papertrace.xyz/workspace/#/templates' },
  { file: '06-resume-editor.png', title: '简历工作室', href: 'https://www.papertrace.xyz/workspace/#/studio/classic' },
];

const scenes: Scene[] = [
  {
    title: '课程汇报，',
    em: '先看现有依据。',
    html: `
      <p class="rpt-kicker">汇报</p>
      <h3>现有依据，不估完成度</h3>
      <p>下面按仓库文档和当前代码整理，方便课堂讲解。正式需求清单里的验收结果仍全部是「未验收」，这里不估完成百分比；后来的验收记录和演示站实际页面分开写。</p>
      <p>演示站截图来自 <a href="https://www.papertrace.xyz/" target="_blank" rel="noreferrer">www.papertrace.xyz</a> 的访客可见页面，没有登录，也不把登录引导当成功能截图。往下滚，旁白和画面会一起换。</p>`,
  },
  {
    title: '正式清单仍全部未验收，',
    em: '后来的验收分开写。',
    html: `
      <h3>需求完成到哪</h3>
      <ul class="rpt-facts">
        <li><b>7</b><span>正式用况</span></li>
        <li><b>55</b><span>需求条目</span></li>
        <li><b>31 / 23 / 1</b><span>必做 / 重要 / 可选</span></li>
        <li><b>9</b><span>验收要点</span></li>
        <li><b>未验收</b><span>清单内的验收结果</span></li>
      </ul>
      <p>总览页上的勾选只存在浏览器本地，不能当完成度。后续记录单独引用，不回写清单：</p>
      <ul class="rpt-list">
        <li>2026-10-23：AI 求职工作流已完成功能和技术链路验收。隔离测试当时 93/93 通过；真实模型对虚构候选人 20/20 取得有效评估，不代表首次成功率为 100%。</li>
        <li>2026-11-09：私人岗位写明「实现及规格复核完成，代码审查中」。116/116 自动化测试，浏览器走过保存、评估入口和材料页，但未发出真实模型请求。</li>
        <li>岗位目录以 2026-11-14 的说明为准：快照 24,193 条（校招 16,375，另增官网实习 7,818）。演示站访客页写的是 15,929 条校招信息，两者分开说明。访客筛选可见秋招、专项校招，未见实习选项。</li>
        <li>尚未实施：面试准备、复盘、学习计划、通义专用适配、邮件日历联动，以及招聘轮次与提醒、岗位订阅、Word / PDF 导入导出。不自动登录招聘网站、不自动投递、不自动发消息。仓库不代表已经完成公网生产部署。</li>
      </ul>`,
  },
  {
    title: '技术为什么这么选：',
    em: '本地优先，数据不出本机。',
    html: `
      <h3>技术选型</h3>
      <ul class="rpt-list">
        <li><b>本地优先。</b>默认只监听 127.0.0.1:4174，账号数据在本机 SQLite，不自动同步到云端。</li>
        <li><b>Node.js 24 + 原生模块。</b>无运行时 npm 依赖、无前端构建，避免必须编译的前端链。</li>
        <li><b>同源 /api。</b>会话用 HttpOnly Cookie，写操作带 CSRF。密码加盐哈希；个人 API 密钥用 AES-256-GCM 加密，不回传前端、不写日志。</li>
        <li><b>岗位是采集快照，不是实时库。</b>只收录企业官网、专属招聘系统或西北大学就业网的具体岗位；空字段保持空值，不编造薪资、截止日期或学历。</li>
        <li><b>AI 放在服务端。</b>分步调用、严格校验 JSON。首版模型为 DeepSeek（默认 deepseek-flash），也可配置 OpenAI 兼容地址；通义须另行验证后才算支持。</li>
        <li><b>PDF 走浏览器打印。</b>需求边界明确不做 Word 导出，也不做已有 PDF / Word 自动解析。</li>
      </ul>`,
  },
  {
    title: '现在能做的，',
    em: '都在工作台里。',
    html: `
      <h3>目前功能</h3>
      <ul class="rpt-list">
        <li>查找岗位：按企业、行业、方向、城市、Base、来源筛选，并跳转官网或西大就业网投递页。目录是带来源的采集快照。</li>
        <li>管理求职进度：收藏到「我的投递」，改状态、绑定简历快照、备注与跟进。不会代为向企业提交申请。</li>
        <li>确认个人经历，再对照岗位评估：资料不完整时不给可比较总分；分数不代表录用概率。</li>
        <li>准备申请材料：起草后独立复核，由用户选择采纳，生成新简历副本，不覆盖源简历。</li>
        <li>记录实际投递：本人在官方渠道投递后，保存所用简历版本和实际填写内容。</li>
        <li>编辑简历：实时预览、19 套模板、版本历史；可导出 JSON、独立 HTML，或浏览器打印 PDF。</li>
        <li>安排笔试、面试、截止日期和跟进：仅站内记录，不发短信、邮件或系统推送。</li>
        <li>私人岗位可手动填写或粘贴 JD，仅所属账号可见；验收记录仍写「代码审查中」。</li>
      </ul>`,
  },
  {
    title: '代码怎么分，',
    em: '数据怎么走。',
    html: `
      <h3>代码模块与数据流</h3>
      <div class="rpt-mods">
        <div><b>品牌主页</b><span>index.html、styles.css、app.js</span></div>
        <div><b>求职工作台</b><span>workspace/：岗位、投递、简历、底稿、评估、材料、私人岗位</span></div>
        <div><b>共享规则</b><span>shared/：模板、图片处理、工作流枚举与只读规则</span></div>
        <div><b>服务入口</b><span>server/：路由、工作流、安全与数据库</span></div>
        <div><b>AI 调用</b><span>模型客户端、配额与并发、密钥范围、prompts/</span></div>
        <div><b>岗位与本机数据</b><span>data/ 与 scripts/ 负责采集发布；storage/ 不入库</span></div>
      </div>
      <ol class="rpt-steps">
        <li>维护者采集快照并合并进岗位目录；已过截止日期的岗位在全量发布时下架。</li>
        <li>求职者登录后，投递、简历、日程、密钥、底稿、评估、材料、留档按账号隔离，只写本机数据库。</li>
        <li>AI 只在用户主动操作并同意后，由服务端发送当前步骤所需文字。姓名、电话、邮箱和图片不作为润色或工作流输入。</li>
        <li>模型返回经结构与事实校验；不通过则不改源简历。通过的结果仍是提案，需用户采纳或确认留档后才持久化。</li>
        <li>实际投递在企业官网由本人完成；工作台只保存确认后的快照。</li>
      </ol>
      <p class="rpt-path">主路径：已保存简历 → 确认底稿 → 选定岗位 → 评估 → 生成材料并复核 → 挑选段落创建新简历 → 本人在官网投递后确认留档。</p>`,
  },
  {
    title: 'AI 只在你确认以后才调用，',
    em: '结果是提案，不改源简历。',
    html: `
      <h3>AI 板块</h3>
      <p>四类调用都要用户确认，都不返回模拟结果：</p>
      <ul class="rpt-list">
        <li><b>连接测试。</b>只证明密钥能通，不能证明评估、材料或复核都可用。</li>
        <li><b>段落润色。</b>按资深 HR 技能检查。服务端拒绝编造数字、抬高动词、抬高头衔，或写入原文没有的公司、学校、工具。采纳前原文不变。</li>
        <li><b>岗位评估。</b>只使用已确认事实；逐条给出通过、部分符合、未体现或未知，并引用事实编号和原文。不推测录用概率。资料不完整时不展示可比较总分。</li>
        <li><b>材料草拟与独立复核。</b>两次分开的模型调用。草拟不得新造经历或数字；复核只报告问题、不改底稿。</li>
      </ul>
      <p>配额：每用户每小时最多 30 次业务调用，同时最多一个；连接测试每小时 8 次另计。不自动重试、不自动换模型、不后台续跑。</p>`,
  },
  {
    title: '七个正式用况，',
    em: '后来的路径标成后续扩展。',
    html: `
      <h3>UML 用例图</h3>
      <p>正式范围以原 7 个用况为准，编号不予改动。虚线框是后来写入操作指南的路径，标为后续扩展，不在原清单内。</p>
      <img src="${img('uml-usecases.png')}" alt="Offerbiu 用例图，含 UC-01 至 UC-07 与后续扩展" width="1600" height="1090" loading="lazy" />`,
  },
  {
    title: '演示站截图，',
    em: '都来自访客可见页。',
    html: `
      <h3>演示站截图</h3>
      <p>以下 6 张均在未登录状态下截取，来源 www.papertrace.xyz。我的投递、日程、底稿、评估、材料和私人岗位在访客态只有登录引导，没有当成功能截图。</p>
      <div class="rpt-gallery">${shots
        .map(
          (s) => `
        <figure>
          <a href="${s.href}" target="_blank" rel="noreferrer">
            <img src="${img(s.file)}" alt="${s.title}" width="1280" height="714" loading="lazy" />
          </a>
          <figcaption>${s.title}</figcaption>
        </figure>`,
        )
        .join('')}</div>`,
  },
  {
    title: '光头强是虚构演示，',
    em: '不是线上真实模型输出。',
    html: `
      <h3>光头强示例</h3>
      <div class="rpt-demo-head">
        <img class="rpt-avatar" src="${img('guangtouqiang-avatar.png')}" alt="光头强像素头像，课程虚构人物" width="128" height="128" />
        <p>光头强是课程用的虚构人物，经历不是真实投递。下面的润色对比和岗位评估按产品规则手工编排，用来讲解「拒绝编造数字 / 抬高动词」、采纳前原文不变，以及三态条件与引用。</p>
      </div>
      <div class="rpt-pair">
        <figure>
          <img src="${img('resume-guangtouqiang-before.png')}" alt="光头强简历润色前" width="900" height="1273" loading="lazy" />
          <figcaption>润色前原文，含缺乏依据的数字和头衔</figcaption>
        </figure>
        <figure>
          <img src="${img('resume-guangtouqiang-after.png')}" alt="光头强简历润色后提案" width="900" height="1273" loading="lazy" />
          <figcaption>润色后提案，须本人核对并采纳后才会写入</figcaption>
        </figure>
      </div>
      <p class="rpt-note">润色后的学历和就读年份，是演示里另写的更可信设定。产品里的润色不会自行改学历和日期。</p>
      <figure class="rpt-wide">
        <img src="${img('match-guangtouqiang.png')}" alt="光头强虚构岗位评估示例，含三态条件与引用" width="1400" height="1120" loading="lazy" />
        <figcaption>评估示例：通过、待核实、未体现、不符合分开写；资料不完整时不展示可比较总分</figcaption>
      </figure>`,
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
          <div class="rpt-panel">${s.html}</div>
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
      <p class="rpt-hint" id="rpt-hint">往下滚</p>
    </div>
  </section>`;
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
  let lastIdx = 0;
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
