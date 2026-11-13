# offerbiu-showcase：开门页 → Offerbiu 开发历程

把两个项目串成一条完整体验，**一个命令启动、一个地址访问**：

1. **开门页**（`genshin/`，原神风格 3D 登录页，Vite 4 + React + three.js/xviewer）
   加载页（offerbiu 字样）→ 点「点击进入」→ 镜头沿桥前进、门升起 → **点击门** → 穿门白光
2. 白光结束后自动跳转到 **Offerbiu 开发历程**（`history/`，像素风海上冲浪首页 + 回廊），页面从白色淡入。
   历程页右上角有「↺ 重新开门」，可回到第 1 步再走一遍。

## 启动

首次（安装两边依赖）：

```powershell
cd D:\offerbiu-showcase
npm run setup
```

之后每次：

```powershell
npm start
```

打开 <http://localhost:5173/>。
（`npm start` = 先把 history 构建到 `genshin/public/history/`，再启动开门页开发服务器。）

| 命令 | 作用 |
| --- | --- |
| `npm start` | 构建 history + 启动开门页（开发模式，端口 5173，`--host` 局域网可访问） |
| `npm run build` | 生产构建，输出到 `genshin/dist/`（history 在 `genshin/dist/history/`） |
| `npm run preview` | 预览生产构建，<http://localhost:4173/> |
| `npm run dev:history` | 单独调试历程页（热更新，<http://localhost:5180/>） |

> 改了 `history/` 的代码后，开门页里看到的是上次构建的版本；重新 `npm start`（或 `npm run build:history`）即可。单独改历程页时用 `npm run dev:history` 更快。

## 目录

```
offerbiu-showcase/
├─ package.json            根脚本（setup / start / build / preview / dev:history）
├─ genshin/                开门页（复制自 D:\www-genshin，含之前的 offerbiu 改动）
│  ├─ vite.config.ts       让 /history/ 返回 history/index.html 的小插件
│  ├─ src/core/GameManager.ts  ★ 跳转钩子 goToHistory()
│  ├─ src/core/Game.ts         穿门流程（_jump：白光 → 2 秒后调用 restart）
│  └─ public/history/      ← 构建产物（自动生成，已加入 .gitignore，不要手改）
└─ history/                Offerbiu 开发历程（复制自 D:\offerbiu-history）
   ├─ src/data/timeline.ts 所有文案和里程碑数据
   ├─ src/hero.ts          首页海浪和船
   ├─ src/asset.ts         资源路径前缀（独立运行为 /，接在开门页后为 /history/）
   └─ index.html           from-gate 白色淡入
```

## 想改哪里

- **跳转时机 / 目标地址**：`genshin/src/core/GameManager.ts` 的 `restart()` → `goToHistory()`；
  穿门后等待时长在 `genshin/src/core/Game.ts` 的 `_jump()`（`.delay(2)`）。
- **淡入效果**：`history/index.html` 里的 `html.from-gate::after`（时长 1.3s）。
- **道路两侧漂浮标语（找工作 / 找实习 / 上 offerbiu）**：`genshin/src/core/components/Slogans.ts`（位置、出现时机）和 `Slogans.less`（匾额样式）；字体是 `genshin/public/fonts/slogan-serif-sc-bold.woff2`（思源宋体/Noto Serif CJK 子集，只含这几个字，改文案要重新生成子集，否则新字会用系统宋体显示）。
- **右上角 18+ 适龄图标**：`genshin/public/Genshin/Tex_0096_18.png`（`src/pages/Menu.less` 的 `.menu-12` 引用；原 12+ 图 `Tex_0096.png` 保留）。
- **加载页的 offerbiu 字样**：`genshin/src/pages/Preloader.tsx` / `Preloader.less`。
- **网页标题**：开门页 `genshin/index.html`（offerbiu），历程页 `history/index.html`。
- **历程内容**：`history/src/data/timeline.ts`；截图放到 `history/public/images/milestones/<日期>.png`，
  头像放到 `history/public/images/team/`（缺图时页面显示占位框，控制台会有 404，属正常）。

## 说明

- 原来的 `D:\www-genshin` 和 `D:\offerbiu-history` 都保留没动，这里是整理后的合并版本。
- 原项目的 `restart()` 会跳到 B 站视频，这里改成了跳到历程页。
- 开门页原版 `tsc` 类型检查本身就有报错（上游 ShaderTest.ts），所以生产构建只跑 `vite build`。
- 开门页是 WebGL 3D 场景，建议用电脑端 Chrome / Edge 打开。
