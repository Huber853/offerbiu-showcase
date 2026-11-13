// =====================================================================
//  Offerbiu 开发历程 · 全部文案和时间线数据都在这个文件里
//  - 所有标注「待补充」的地方需要你手动填写
//  - 图片放到 public/images/... 对应路径，文件不存在时页面会显示占位框
//  - source 字段记录信息出处，方便核对，不会显示为正文
// =====================================================================

export interface Milestone {
  date: string;          // 例如 "2026-09-20"；不确定写 "待补充"
  title: string;
  desc: string;          // 1–2 句
  tag: string;           // 海报角标：起点 / 提交 / 文档 / 功能 / 安全 / 设计
  source: string;        // 信息来源（核对用）
  image?: string;        // 截图路径（相对 public），缺失时显示占位
}

export const site = {
  name: 'Offerbiu',
  title: 'Offerbiu 开发历程',
  // 出自 docs/视觉设计调研与改版方案.md（保留的品牌标语）
  tagline: '让每一次投递，都有下一步',
  // 出自 README.md
  subline: '面向 2027 届校招的本地优先求职工作台',
  heroFacts: [
    { label: '首次提交', value: '2026-09-20' },
    { label: 'Git 提交', value: '17 次' },
    { label: '岗位快照', value: '16375 条' },
    { label: '简历模板', value: '19 套' },
    { label: '自动化测试', value: '116 项' },
  ],
  brandColor: '#365cf5', // 出自 favicon.svg / 人物素材说明
};

// 界面文字（导航、按钮、提示）
export const ui = {
  nav: [
    { id: 'hero', label: '门口' },
    { id: 'play', label: '店内' },
    { id: 'corridor', label: '回廊' },
    { id: 'closing', label: '现在' },
  ],
  heroKicker: '开发历程',
  heroCta: '先玩一下',
  heroCta2: '直接看回廊',
  scrollHint: '往下滚，登船出发',
  corridorLabel: '回廊',
  corridorLead: '往回走过',
  corridorUnit: '个里程碑',
  corridorHint: '滚动前进 · 点刻度跳转',
  placeholderArt: '插画占位 · 可换成截图',
  loading: '正在开门…',
  soundOn: '音效 开',
  soundOff: '音效 关',
  best: '最佳',
  mascotSay: '还在继续做，下一站见。',
  credits: '像素字体：Fusion Pixel（SIL OFL 1.1）· 插画：AI 生成的原创像素插画，可替换为真实截图',
};

// 没有截图时，按角标显示的插画（GenerateImage 生成的原创像素插画，可替换）
export const tagArt: Record<string, string> = {
  起点: '/images/illustrations/origin.jpg',
  提交: '/images/illustrations/commit.jpg',
  文档: '/images/illustrations/docs.jpg',
  功能: '/images/illustrations/feature.jpg',
  安全: '/images/illustrations/security.jpg',
  设计: '/images/illustrations/design.jpg',
};

export const game = {
  title: '顶出你的 offer',
  hint: '← → 移动 · Shift 跑 · 空格 跳 · 跳起来顶方块',
  coinLabel: 'offer',
  // 顶方块时随机弹出的文字（可改成真实公司或岗位）
  popTexts: ['投递 +1', '笔试通过', '一面通过', '二面通过', 'HR 面', 'offer!'],
};

// 从新到旧排列：回廊里越往下走越早
export const milestones: Milestone[] = [
  {
    date: '2026-11-12',
    title: '交给 offerbiu 助手全权负责',
    desc: '私人岗位工作流与简历工作室更新（53 个文件，+3117/−1112 行）并合并 master；同晚把项目交给专门的 offerbiu 助手。',
    tag: '功能',
    source: 'git 676aff9 / 0c1c083；offerbiu 助手对话 2026-11-12 21:14',
    image: '/images/milestones/2026-11-12.png',
  },
  {
    date: '2026-11-09',
    title: '下一阶段计划：M0–M6',
    desc: '规划私人岗位、招聘轮次与提醒、岗位订阅、简历导入导出；M0 基线 97/97 测试，M1 私人岗位 116/116 测试通过。',
    tag: '文档',
    source: 'docs/下一阶段功能开发计划.md、docs/下一阶段开发验收记录.md',
    image: '/images/milestones/2026-11-09.png',
  },
  {
    date: '2026-11-08',
    title: '视觉改版：一本「校招手册」',
    desc: '参考 CSS Design Awards、Webby 获奖作品，把首页做成有版次和栏线的手册，工作台像索引页。',
    tag: '设计',
    source: 'docs/视觉设计调研与改版方案.md（日期取自文件修改时间，待确认）',
    image: '/images/milestones/2026-11-08.png',
  },
  {
    date: '2026-11-07',
    title: 'PR #2：收紧岗位证据与密钥边界',
    desc: '公开页面不再等同于岗位在招；不再宣称跨设备同步；服务器 AI 密钥限本机；新增需确认的账号删除。',
    tag: '安全',
    source: 'git 6236ae0 / 6ac85cf / b3fc2e1（Cursor Agent 提交，Evan Lin 合并）',
    image: '/images/milestones/2026-11-07.png',
  },
  {
    date: '2026-10-23',
    title: 'AI 求职工作流 + 中文简历模板',
    desc: '加入经历确认、带依据的岗位评估、材料起草与投递留档，引入 MIT 开源简历模板，附 97 项自动化测试；PR #1 合并。',
    tag: '功能',
    source: 'git 8fd6d9c / 658f9d1 / adb7334；docs/AI求职工作流融合开发文档.md',
    image: '/images/milestones/2026-10-23.png',
  },
  {
    date: '2026-10-18',
    title: 'AI 设置安全加固',
    desc: '保护 AI 配置，以及简历和投递流程。',
    tag: '安全',
    source: 'git d80ba02',
    image: '/images/milestones/2026-10-18.png',
  },
  {
    date: '2026-09-27',
    title: 'P0 / P1 修复与设计统一',
    desc: '两天四次提交：SSRF 与登录防护、简历保存冲突、首页与工作台共用设计 token、游客草稿本地保存。',
    tag: '安全',
    source: 'git f089df0 / 583a21d / 34d0b74 / 166d40c（2026-09-27 至 09-28）',
    image: '/images/milestones/2026-09-27.png',
  },
  {
    date: '2026-09-25',
    title: '多 AI 服务商 + 岗位库扩到 16378 条',
    desc: '支持 DeepSeek 与自定义 OpenAI 兼容接口，新增岗位匹配分析；岗位库扩至 16378 条、214 家企业、32 个行业。',
    tag: '功能',
    source: 'git bc1d8bf',
    image: '/images/milestones/2026-09-25.png',
  },
  {
    date: '2026-09-20',
    title: 'first 上传：代码进 GitHub',
    desc: '第一次提交到 Huber853/Offerbiu，同天重写 README；次日修复人物头顶气泡遮挡。',
    tag: '提交',
    source: 'git 227c143 / 00bdcbb / d10a474',
    image: '/images/milestones/2026-09-20.png',
  },
  {
    date: '2026-09-16',
    title: '完整项目实施方案',
    desc: '从无依赖静态主页扩展为 Node.js 24 + SQLite 全栈本地项目：账号、2027 校招岗位库、投递管理、简历中心、DeepSeek 润色。',
    tag: '文档',
    source: 'docs/实施方案.md（文内日期 2026-09-16）',
    image: '/images/milestones/2026-09-16.png',
  },
  {
    date: '2026-09-08',
    title: '品牌蓝与人物动画素材',
    desc: '定下品牌蓝 #365cf5 的图标，生成挥手和敲电脑的人物八帧动画素材。',
    tag: '设计',
    source: 'favicon.svg、assets/career-characters.png、assets/README.md（日期取自文件修改时间）',
    image: '/images/milestones/2026-09-08.png',
  },
  {
    date: '2026-09-05',
    title: '起点：项目开始',
    desc: '受 offerbiu.com 启发，开始动手做自己的秋招工作台；这是能找到的最早记录。这一天具体做了什么：待补充。',
    tag: '起点',
    source: 'C:\\Users\\Lenovo\\Documents\\Codex\\2026-09-05\\https-www-offerbiu-com-https-www（目录名）',
    image: '/images/milestones/2026-09-05.png',
  },
];

export const closing = {
  title: '现在 · 下一步',
  now: [
    '当前分支 codex/ai-job-workflow，与远端同步',
    'M1 私人岗位：实现完成，代码审查中',
    'M2 招聘轮次与提醒、M3 岗位订阅、M4 简历导入：待开发',
  ],
  team: [
    // 出自 git 提交记录；真实姓名、角色、头像待补充
    { name: 'Huber853', role: '待补充', avatar: '/images/team/huber853.png' },
    { name: 'Evan Lin', role: '待补充（合并 PR #1、#2）', avatar: '/images/team/evan-lin.png' },
  ],
  contact: [
    { label: 'GitHub', value: 'Huber853/Offerbiu' },
    { label: '联系方式', value: '待补充' },
  ],
  footer: 'Offerbiu · 开发历程演示（雏形）',
};
