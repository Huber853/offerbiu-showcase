# Offerbiu 开发历程演示 · 资源清单

所有页面文案和时间线都在 **`src/data/timeline.ts`**，改完保存，页面会自动刷新。
图片放进 `public/images/...` 下的对应路径（文件名一致即可），没放的地方页面会显示带路径的占位框。

启动：在 `D:\offerbiu-history` 运行 `npm run dev -- --port 5180 --host`，打开 http://localhost:5180/

---

## 一、已收集的资源

| 资源 | 内容 | 来源 |
| --- | --- | --- |
| 项目代码与 Git 历史 | 17 次提交，2026-09-20 首次提交（first 上传）到 2026-11-12 最近一次合并 | `C:\Users\Lenovo\OneDrive\文档\ChatGPT\秋招web制作`（GitHub `Huber853/Offerbiu`），只读查看 |
| 产品定位 | “面向 2027 届校招的本地优先求职工作台”，功能列表（岗位库、投递时间线、经历确认、AI 评估、材料起草、19 套简历模板等） | 上述项目 `README.md` |
| 品牌标语 | “让每一次投递，都有下一步”；品牌蓝 `#365cf5` | `docs/视觉设计调研与改版方案.md`、`favicon.svg` |
| Logo | 蓝底白箭头图标（已复制到 `public/images/brand/logo.svg` 和 `public/favicon.svg`） | 项目 `favicon.svg` |
| 人物动画素材 | `career-characters.png`，八帧挥手 / 敲电脑人物（未复制进演示） | 项目 `assets/career-characters.png`、`assets/README.md` |
| 实施方案 | 2026-09-16：从静态主页扩展为 Node 24 + SQLite 全栈项目 | `docs/实施方案.md` |
| 关键数据 | 岗位库 16378 条 / 214 家 / 32 行业（09-25 提交）；当前 `data/jobs-2027.json` 16375 条；97 → 116 项自动化测试 | git `bc1d8bf`、`8fd6d9c`；`docs/下一阶段开发验收记录.md` |
| 下一阶段计划 | M0–M6 里程碑及进度表 | `docs/下一阶段功能开发计划.md`、`docs/下一阶段开发验收记录.md` |
| 已有截图（可直接选用） | 首页、登录、工作台、日程、简历编辑器的桌面和手机截图；简历模板 QA 截图 | `backups\next-phase-20261109\m0-browser\*.png`、`backups\templates-20261023\qa\*.png` |
| 项目交接 | 2026-11-12 21:14 把项目交给 offerbiu 助手全权负责 | offerbiu 助手对话记录 |
| 最早记录 | 2026-09-05 名为 `https-www-offerbiu-com-https-www` 的 Codex 目录（项目受 offerbiu.com 启发；目录里是另一个仓库 xuzhi-hero） | `C:\Users\Lenovo\Documents\Codex\2026-09-05\...` |


> 说明：offerbiu.com 是启发本项目的外部网站，不是本项目。页面只写自己的项目，只在起点那条提了一句“受 offerbiu.com 启发”。

### 本轮精细化新增的素材（都可替换）

| 素材 | 位置 | 怎么来的 |
| --- | --- | --- |
| 像素字体 Fusion Pixel 12px 简体中文 | `public/fonts/fusion-pixel-12px-zh_hans.woff2`（许可证 `public/fonts/OFL-fusion-pixel.txt`，SIL OFL 1.1，可商用） | 从 github.com/TakWolf/fusion-pixel-font 官方发布版下载 |
| 6 张角标插画（起点 / 提交 / 文档 / 功能 / 安全 / 设计） | `public/images/illustrations/*.jpg` | Grok Bot 用 AI 生图生成的原创像素插画；没有截图的里程碑会先显示对应插画，并标注“插画占位 · 可换成截图” |
| 首屏海景：夜空、弯月、云、海鸥、远岛灯塔、月光倒影、涌浪与浪舌、浪花粒子、挂 OFFERBIU 方帆的小船和 7 位船员 | `src/hero.ts` | 代码逐像素绘制，原创；未使用任何第三方图片素材 |
| 店内场景、主角小人、硬币 | `src/game.ts`、`src/pixel.ts` | 代码逐像素绘制，原创 |
| favicon PNG / Apple 图标 | `public/favicon-32.png`、`public/apple-touch-icon.png` | 按项目原有 favicon.svg 重绘 |
| 分享图（OG） | `public/og.png` | 首屏海景截图；你换了文案后可以重截 |

---

## 二、需要你手动补充的清单

### 1. 每个里程碑的截图（16:9，建议 1280×720，PNG）

现在没截图的海报会先显示角标插画；放入对应文件后自动换成截图。

| 日期 | 里程碑 | 放到 |
| --- | --- | --- |
| 2026-11-12 | 私人岗位工作流与简历工作室更新 | `public/images/milestones/2026-11-12.png` |
| 2026-11-09 | 下一阶段计划 M0–M6 | `public/images/milestones/2026-11-09.png`（✅ 已先放入 `backups\next-phase-20261109\m0-browser\desktop-landing.png`，可替换） |
| 2026-11-08 | 视觉改版“校招手册” | `public/images/milestones/2026-11-08.png` |
| 2026-11-07 | PR #2 收紧岗位证据与密钥边界 | `public/images/milestones/2026-11-07.png` |
| 2026-10-23 | AI 求职工作流 + 中文简历模板 | `public/images/milestones/2026-10-23.png`（✅ 已先放入 `backups\templates-20261023\qa\four-new-pdfs.png`，可替换） |
| 2026-10-18 | AI 设置安全加固 | `public/images/milestones/2026-10-18.png` |
| 2026-09-27 | P0/P1 修复与设计统一 | `public/images/milestones/2026-09-27.png` |
| 2026-09-25 | 多 AI 服务商 + 岗位库扩容 | `public/images/milestones/2026-09-25.png` |
| 2026-09-20 | first 上传 | `public/images/milestones/2026-09-20.png` |
| 2026-09-16 | 完整项目实施方案 | `public/images/milestones/2026-09-16.png` |
| 2026-09-08 | 品牌蓝与人物素材 | `public/images/milestones/2026-09-08.png`（✅ 已先放入 `assets\career-characters.png`，可替换） |
| 2026-09-05 | 起点 | `public/images/milestones/2026-09-05.png` |

### 2. 需要你确认或补写的文字（都在 `src/data/timeline.ts`）

- [ ] **2026-09-05 起点**：这一天具体做了什么、为什么开始做 Offerbiu（`desc` 里写着“待补充”）
- [ ] **2026-09-08、2026-11-08** 这两条的日期取自文件修改时间，请确认真实日期
- [ ] 想加的里程碑：比如第一个真实用户、上线公网的日期、做过的分享或比赛等（目前查不到，没有写）
- [ ] 每条的文案按你演示时的口吻改

### 3. 团队与联系

- [ ] 团队成员真实姓名和角色（目前只有 Git 记录里的 `Huber853`、`Evan Lin`）→ `closing.team`
- [ ] 成员头像（正方形，建议 256×256）→ `public/images/team/huber853.png`、`public/images/team/evan-lin.png`
- [ ] 联系方式（邮箱 / 公众号 / 群）→ `closing.contact`

### 4. 品牌素材（可选）

- [ ] 高清 Logo / 横版字标（目前用的是 favicon 图标）→ `public/images/brand/logo.svg`
- [ ] 如果想把首屏或小游戏里的像素小人换成你们自己的形象，提供像素风或扁平人物图，我再接进去

---

## 三、文件结构

```
src/data/timeline.ts   全部文案、时间线、界面文字、插画映射（只改这个就够）
src/hero.ts            首屏像素海景：冲浪小船 + 7 位船员（代码绘制，原创）
src/game.ts            店内小游戏（← → 移动，Shift 跑，空格跳；音效默认关）
src/main.ts            页面结构与回廊滚动
src/corridor.ts        3D 回廊、时间轴、海报图片加载
src/style.css          样式
public/fonts/          像素字体（OFL）
public/images/illustrations/  插画占位
public/images/         截图、头像、Logo
```

说明：页面交互参考了 agi.bar 的形式（像素街景、可操控小人、时间回廊），但没有使用它的任何图片、素材、文案或品牌，所有像素画都是代码绘制的原创内容。
