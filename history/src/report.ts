import { asset } from './asset';
import './report.css';

const img = (path: string) => asset(`/images/report/${path}`);

const shots: { file: string; title: string; cap: string; href: string }[] = [
  {
    file: '01-home.png',
    title: '品牌主页',
    cap: '2027 届校招手册风格首页。访客无需登录即可打开。截于 2026-11-15，来源 www.papertrace.xyz。',
    href: 'https://www.papertrace.xyz/',
  },
  {
    file: '02-workspace.png',
    title: '求职总览',
    cap: '访客工作台总览。页面写明 15929 条校招信息、19 套模板与 AI 润色入口；保存进展需要登录，本次未登录。',
    href: 'https://www.papertrace.xyz/workspace/',
  },
  {
    file: '03-jobs.png',
    title: '校招岗位库',
    cap: '可按关键词、Base、岗位方向筛选。访客可见 15929 条岗位，详情示例为宁德时代「生产运营管理」，招聘批次为秋招。无需登录浏览。',
    href: 'https://www.papertrace.xyz/workspace/#/jobs',
  },
  {
    file: '04-jobs-filters.png',
    title: '岗位更多筛选',
    cap: '展开后可见企业、行业、招聘批次、来源等。招聘批次选项为全部、秋招、专项校招。本次访客界面未见「招聘类型」或实习筛选项。',
    href: 'https://www.papertrace.xyz/workspace/#/jobs',
  },
  {
    file: '05-templates.png',
    title: '简历模板',
    cap: '页面写明 19 套可在线编辑的版式，并标注开源许可。无需登录即可预览并进入编辑。',
    href: 'https://www.papertrace.xyz/workspace/#/templates',
  },
  {
    file: '06-resume-editor.png',
    title: '简历工作室',
    cap: '访客可在本机草稿中编辑并实时预览，例如「经典蓝」模板。页面提示「存入我的简历」需要登录；本次未点击保存。',
    href: 'https://www.papertrace.xyz/workspace/#/studio/classic',
  },
];

export function reportHTML(): string {
  const shotCards = shots
    .map(
      (s) => `
        <figure class="rpt-shot reveal">
          <a href="${s.href}" target="_blank" rel="noreferrer">
            <img src="${img(s.file)}" alt="${s.title}" width="1280" height="714" loading="lazy" />
          </a>
          <figcaption><b>${s.title}</b><span>${s.cap}</span></figcaption>
        </figure>`,
    )
    .join('');

  return `
  <section class="report" id="report">
    <div class="rpt-inner">
      <span class="chip reveal">汇报</span>
      <h2 class="reveal">课程汇报 · 现有依据</h2>
      <p class="rpt-lead reveal">下面按仓库文档和当前代码整理，方便课堂讲解。正式需求清单里的验收结果仍全部是「未验收」，这里不估完成百分比；后来的验收记录和演示站实际页面分开写。演示站截图来自 <a href="https://www.papertrace.xyz/" target="_blank" rel="noreferrer">www.papertrace.xyz</a> 的访客可见页面，没有登录，也没有把登录墙当成功能截图。</p>

      <article class="rpt-card reveal" id="report-req">
        <h3>需求完成到哪</h3>
        <p>正式清单仍在仓库里：7 个用况、55 条需求（必做 31、重要 23、可选 1）、9 项验收要点。这三份表里的验收结果或验收状态，全部仍是「未验收」。需求总览页上的勾选只存在浏览器本地，不能当完成度。</p>
        <ul class="rpt-facts">
          <li><b>7</b><span>正式用况</span></li>
          <li><b>55</b><span>需求条目</span></li>
          <li><b>31 / 23 / 1</b><span>必做 / 重要 / 可选</span></li>
          <li><b>9</b><span>验收要点</span></li>
          <li><b>未验收</b><span>清单内的验收结果</span></li>
        </ul>
        <p>后续另有验收记录和产品说明，展示时单独引用，不回写上述清单：</p>
        <ul class="rpt-list">
          <li>2026-10-23：AI 求职工作流已完成功能和技术链路验收。隔离测试当时 93/93 通过；真实模型对虚构候选人 20/20 取得有效评估，不代表首次成功率为 100%；桌面与窄屏、以及 1 页中文 PDF 做过走查。虚构候选人的分数不是针对真实用户的求职建议。</li>
          <li>2026-11-09：当时记录自动化测试 97/97 通过。私人岗位写明「实现及规格复核完成，代码审查中」：116/116 自动化测试，浏览器走过保存、评估入口和材料页，但未发出真实模型请求。</li>
          <li>岗位目录以 2026-11-14 的数据来源说明为准：快照 24,193 条（校招 16,375 未改，另增官网实习 7,818）、215 家、32 个行业。演示站访客页写的是 15,929 条校招信息，两者不一致，展示时分开说明，不以总览页里过期的约 16,375 条口径代替现状。</li>
        </ul>
        <p>验收记录已写明尚未实施：面试准备、复盘、学习计划、通义专用适配、邮件日历联动，以及招聘轮次与提醒、岗位订阅、Word / PDF 导入导出。系统不自动登录招聘网站、不自动投递、不自动发消息。README 也写明：测试通过不代表企业岗位仍在招，也不代表真实模型建议无需审核；仓库不代表已经完成公网生产部署。</p>
      </article>

      <article class="rpt-card reveal" id="report-tech">
        <h3>技术为什么这么选</h3>
        <ul class="rpt-list">
          <li><b>本地优先。</b>默认只监听 127.0.0.1:4174，账号数据在本机 storage 的 SQLite，不自动同步到云端。目的是零部署成本，求职数据默认不出本机。</li>
          <li><b>Node.js 24 + 原生模块。</b>无运行时 npm 依赖、无前端构建，使用 Node 内置 HTTP、fetch、crypto、node:sqlite 和浏览器原生 ES 模块，避免必须编译的前端链。</li>
          <li><b>同源 /api。</b>前后端同一服务，会话用 HttpOnly Cookie，写操作带 CSRF。</li>
          <li><b>密码与密钥。</b>密码加盐哈希；个人 API 密钥用 AES-256-GCM 加密，和 .encryption-key 一起保存在本机，不回传前端、不写日志。</li>
          <li><b>岗位是采集快照，不是实时库。</b>Python 只用于离线采集和发布。只收录企业官网、专属招聘系统或西北大学就业网的具体岗位；空字段保持空值，不编造薪资、截止日期或学历。</li>
          <li><b>AI 放在服务端。</b>分步调用、严格校验 JSON。不运行上游 CLI，不给模型文件或终端权限，不引入向量库、Redis、微服务或外部任务队列。首版模型为 DeepSeek（默认 deepseek-flash，可切换），也可配置 OpenAI 兼容地址；通义须另行验证后才算支持。</li>
          <li><b>PDF 走浏览器打印。</b>需求边界明确不做 Word 导出，也不做已有 PDF / Word 自动解析；相关导入导出仍待开发。</li>
        </ul>
      </article>

      <article class="rpt-card reveal" id="report-features">
        <h3>目前功能有哪些</h3>
        <ul class="rpt-list">
          <li>查找岗位：按企业、行业、方向、城市、Base、来源筛选，查看要求，并跳转官网或西大就业网投递页。目录是带来源的采集快照。文档说明实习与校招用招聘类型区分；本次演示站访客筛选里看到的是招聘批次（秋招、专项校招），未见实习选项。</li>
          <li>管理求职进度：收藏到「我的投递」，改状态、绑定简历快照、备注与跟进；详情有进展时间线。不会代为向企业提交申请。</li>
          <li>确认个人经历：从已有简历导入待核对事实，逐项确认后再用于评估和材料。</li>
          <li>评估岗位：对照已确认事实与岗位要求，查看通过、待核实、不符合及引用。资料不完整时不给可比较总分；分数不代表录用概率。</li>
          <li>准备申请材料：起草简历段落和网申字段，独立复核后再由用户选择采纳，生成新简历副本，不覆盖源简历。</li>
          <li>记录实际投递：本人在官方渠道投递后，确认所用简历版本和实际填写内容，保存为可独立查看的留档。</li>
          <li>编辑简历：实时预览、切换模板（README 写 19 套）、管理头像与作品图、版本历史；可导出 JSON、独立 HTML，或浏览器打印 PDF。</li>
          <li>安排后续事项：笔试、面试、截止日期和跟进；仅站内记录，不发短信、邮件或系统推送。</li>
          <li>私人岗位：可手动填写或粘贴 JD；仅所属账号可见，不获官方核验标记。验收记录仍写「代码审查中」，未写正式关闭验收。</li>
          <li>设置与备份：可配置个人模型密钥；可导出个人业务数据（不含密码和密钥）。完整备份需停服复制整个 storage 目录。</li>
        </ul>
      </article>

      <article class="rpt-card reveal" id="report-modules">
        <h3>代码模块</h3>
        <div class="rpt-mods">
          <div><b>品牌主页</b><span>index.html、styles.css、app.js</span></div>
          <div><b>求职工作台</b><span>workspace/：岗位、投递时间线、简历编辑器、底稿、评估、材料、私人岗位</span></div>
          <div><b>共享规则</b><span>shared/：简历模板、图片处理、工作流枚举与只读规则</span></div>
          <div><b>服务入口</b><span>server/index.mjs、routes.mjs、workflow-routes.mjs、security.mjs、db.mjs</span></div>
          <div><b>求职工作流</b><span>底稿、评估、材料、投递留档等服务端模块</span></div>
          <div><b>AI 调用</b><span>模型客户端、配额与并发、密钥范围、润色技能校验，以及 prompts/</span></div>
          <div><b>岗位数据</b><span>data/ 中的岗位目录、来源策略与采集证据；scripts/ 负责离线采集和发布</span></div>
          <div><b>本机数据</b><span>storage/ 不入库；tests/ 使用隔离数据库和模拟模型</span></div>
        </div>
      </article>

      <article class="rpt-card reveal" id="report-flow">
        <h3>数据流</h3>
        <ol class="rpt-steps">
          <li>维护者运行采集脚本，从企业官网、专属招聘系统或西大就业网拉取快照，再合并进岗位目录和运行库。个人账号、简历、投递不被发布脚本删除。</li>
          <li>服务启动后把目录导入 SQLite；已过截止日期的岗位在全量发布时下架。页面展示来源、采集时间和届别依据。</li>
          <li>求职者注册登录后，投递、简历、日程、密钥、底稿、评估、材料、留档按账号隔离，只写本机数据库。</li>
          <li>AI 只在用户主动操作并同意后，由服务端把当前步骤所需文字发给所选模型。姓名、电话、邮箱和图片不作为润色或工作流输入。</li>
          <li>模型返回经服务端结构与事实校验；不通过则不改源简历、不推进投递状态。通过的结果仍是提案，需用户采纳或确认留档后才持久化。</li>
          <li>实际投递在企业官网由本人完成；工作台只保存确认后的快照，并与后续目录更新解耦。</li>
        </ol>
        <p class="rpt-path">AI 工作流主路径：已保存简历 → 导入并逐项确认底稿 → 选定岗位（可补私人 JD，不回写公共目录）→ 评估（条件三态 + 引用 + 可选总分）→ 加入投递并生成材料 → 独立复核 → 手工挑选段落创建新简历 → 本人在官网投递后确认留档。</p>
        <p>评估计分供展示说明，须注明未做招聘效果校准：技能组 60%、项目或实习组 40%；覆盖率不足 80%、正文不完整或硬条件失败时，不展示可比较总分。「未体现」只表示资料未写出，不等于没有该能力。</p>
      </article>

      <article class="rpt-card reveal" id="report-ai">
        <h3>AI 板块</h3>
        <p>四类调用都要用户确认，都不返回模拟结果：</p>
        <ul class="rpt-list">
          <li><b>连接测试。</b>只证明密钥能通，不能证明评估、材料或复核都可用。</li>
          <li><b>段落润色。</b>按资深 HR 技能检查；有目标岗位则按 JD 对齐，没有岗位只整理清晰度与可信度。服务端拒绝编造数字、抬高动词、抬高头衔，或写入原文没有的公司、学校、工具。界面可显示「HR 初看」。技能改编自 MIT 许可的 resume-jd-optimizer-cn。采纳前原文不变。</li>
          <li><b>岗位评估。</b>只使用已确认事实；逐条给出通过、部分符合、未体现或未知，并引用事实编号和原文。不推测院校偏好、人格或录用概率。</li>
          <li><b>材料草拟与独立复核。</b>两次分开的模型调用。草拟不得新造经历或数字；复核只报告问题、不改底稿。复核通过后，用户仍须核对并选择采纳。</li>
        </ul>
        <p>配额：每用户每小时最多 30 次业务调用（含润色、评估、草拟、复核），同时最多一个业务调用；连接测试每小时 8 次另计。配额在进程内存中，重启后重置。不自动重试、不自动换模型、不后台续跑。</p>
      </article>

      <article class="rpt-card reveal" id="report-uml">
        <h3>UML 用例图</h3>
        <p>正式范围以原 7 个用况为准，编号不予改动。虚线框是后来写入操作指南的路径，标为后续扩展，不在原清单内。</p>
        <figure class="rpt-uml">
          <img src="${img('uml-usecases.png')}" alt="Offerbiu 用例图，含 UC-01 至 UC-07 与后续扩展" width="1600" height="1090" loading="lazy" />
        </figure>
      </article>

      <article class="rpt-card reveal" id="report-shots">
        <h3>演示站截图</h3>
        <p>以下 6 张均在未登录状态下截取。我的投递、日程、真实经历底稿、岗位评估、申请材料和私人岗位可以打开对应页面，但访客只能看到登录引导，没有功能数据，所以不把那些页面当作功能截图。</p>
        <div class="rpt-gallery">${shotCards}</div>
      </article>

      <article class="rpt-card reveal" id="report-demo">
        <h3>光头强示例 · 虚构演示</h3>
        <div class="rpt-demo-head">
          <img class="rpt-avatar" src="${img('guangtouqiang-avatar.png')}" alt="光头强像素头像，课程虚构人物" width="128" height="128" />
          <p>光头强是课程用的虚构人物，经历不是真实投递。下面的润色对比和岗位评估按产品规则手工编排，用来讲解「拒绝编造数字 / 抬高动词」、采纳前原文不变，以及三态条件与引用。它们不是演示站上的真实模型输出，也不代表录用概率。</p>
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
        <figure class="rpt-wide">
          <img src="${img('match-guangtouqiang.png')}" alt="光头强虚构岗位评估示例，含三态条件与引用" width="1400" height="1120" loading="lazy" />
          <figcaption>评估示例：通过、待核实、未体现、不符合分开写；资料不完整时不展示可比较总分</figcaption>
        </figure>
      </article>
    </div>
  </section>`;
}
