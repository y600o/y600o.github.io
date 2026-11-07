# 个人博客与浏览器工具箱

使用 Next.js、TypeScript 和 Tailwind CSS 构建的个人技术博客，采用绿色系、直角与色块设计。浏览器工具与博客共用一个仓库和网站，各工具保留独立应用结构，通过 GitHub Actions 统一构建并发布到 GitHub Pages。

## 在线访问

- [博客首页](https://y600o.github.io/)
- [工具箱](https://y600o.github.io/tools/)
- [出差报表](https://y600o.github.io/tools/trip-report/)

## 功能与架构

- Markdown 文章、标签筛选、阅读时间估算与相关文章推荐。
- 首页展示最新 4 篇文章和最新 2 个工具；不足时展示实际已有内容。
- 顶部与页脚均提供“首页、博客、工具箱、关于”导航。
- 首页与工具箱的工具卡片仅展示标题、简介和链接按钮。
- 博客使用 Next.js 静态导出；出差报表是独立的 React + Vite 应用，构建后合并至同一个 `out/` 目录。
- 网站适配桌面与移动端；当前未提供深浅色模式切换。

| 部分 | 主要技术 | 依赖管理 |
|------|----------|----------|
| 博客 | Next.js 16.1.1、React 19、TypeScript、Tailwind CSS 4、Lucide React | pnpm、根目录 pnpm-lock.yaml |
| 文章处理 | gray-matter、remark、remark-gfm | 随博客管理 |
| 出差报表 | React、Vite、ExcelJS、vite-plugin-pwa | npm、工具目录 package-lock.json |
| 部署 | GitHub Actions + GitHub Pages | 统一发布静态文件 |

GitHub Pages 不运行应用后端。当前报表的文件读取、计算和 Excel 导出全部在浏览器完成；未来工具如需数据库、保密 API 密钥或云同步，应另配后端。

## 项目结构

```text
├── content/posts/             # Markdown 文章
│   └── attachments/           # Obsidian 文章附件
├── src/
│   ├── app/                   # 首页、博客、标签、工具箱、关于等页面
│   ├── components/            # 导航、页脚、文章卡片等组件
│   └── lib/
│       ├── posts.ts           # 文章读取与处理
│       └── tools.ts           # 工具名称、添加日期和简介
├── tools/
│   ├── README.md              # 工具维护与接入说明
│   └── trip-report/           # 出差报表独立应用、测试及锁文件
├── scripts/
│   ├── sync-post-assets.mjs   # 同步文章附件
│   └── build-tools.mjs        # 构建工具并合并至 out/tools/<slug>/
├── public/                    # 博客静态资源
├── .github/workflows/deploy.yml
└── next.config.ts             # 静态导出、图片与路径配置
```

## 本地开发

建议使用 Node.js 22.12+ 和 pnpm 9，与当前 CI 环境保持一致。以下命令均在仓库根目录执行。

### 安装依赖

```sh
pnpm install
npm ci --prefix tools/trip-report
```

博客与工具分别安装依赖，修改工具依赖时同步提交工具自己的 `package-lock.json`。

### 启动博客

```sh
pnpm sync-post-assets
pnpm exec next dev -p 5000
```

访问 `http://localhost:5000/`。此方式可以直接用于 PowerShell，不需要 Bash。

现有 `pnpm dev` 使用 Bash 脚本启动自定义服务，端口同为 5000；Windows 使用该命令时需要 Git Bash 等 Bash 环境。开发期间新增或替换文章附件后，重新运行 `pnpm sync-post-assets`。

### 启动出差报表

```sh
npm --prefix tools/trip-report run dev
```

打开终端显示的地址，并使用 `/tools/trip-report/` 路径。博客开发服务与工具开发服务相互独立；博客开发模式不会自动挂载 Vite 工具，调试报表时请访问工具自己的开发地址。

## 检查与生产构建

| 命令 | 说明 |
|------|------|
| `pnpm ts-check` | 博客 TypeScript 检查 |
| `pnpm lint` | 博客 ESLint 检查，独立工具目录已排除 |
| `pnpm test:post-images` | 文章图片处理测试 |
| `pnpm test:tools` | 出差报表测试 |
| `pnpm build:pages` | 同步附件、静态导出博客、构建工具并合并产物 |
| `npm --prefix tools/trip-report run build` | 单独检查类型并构建报表工具 |
| `npm --prefix tools/trip-report run preview` | 预览工具生产构建，用于离线功能验收 |

GitHub Pages 使用 **`pnpm build:pages`**，最终发布目录为 `out/`，包含博客与 `out/tools/trip-report/`。构建工具前必须先生成博客；工具构建失败会阻止整站发布。

现有 `pnpm build` 和 `pnpm start` 保留自定义 Node 服务的构建、启动流程，不是当前 Pages 的统一发布命令。静态导出不能通过 `next start` 预览，应使用静态 HTTP 服务托管 `out/`。

## 写作指南

### 创建文章

在 `content/posts/` 下直接创建 `.md` 文件，文件名作为文章网址的 slug：

```markdown
---
title: '文章标题'
date: '2026-11-07'
excerpt: '文章摘要'
tags: ['标签1', '标签2']
coverImage: '/images/posts/cover.jpg'
---

# 文章正文

使用 Markdown 编写内容。
```

| 字段 | 说明 | 编写要求 |
|------|------|----------|
| title | 文章标题 | 建议必填 |
| date | 发布日期，YYYY-MM-DD | 建议必填，文章按日期倒序排列 |
| excerpt | 文章摘要 | 建议必填 |
| tags | 标签数组 | 可选 |
| coverImage | 封面图片地址 | 可选，不使用时删除该字段 |

### 插入图片（Obsidian）

将图片保存在 `content/posts/attachments/`，使用标准 Markdown：

```markdown
![图片说明](attachments/example.jpg)
![含空格的文件名](<attachments/图片 名称.jpg>)
```

支持 `./attachments/`、附件子目录及中文文件名；大小写必须与实际文件一致。文章与图片一起提交，无需移动原图或修改 Obsidian 中的链接。不支持 `![[图片]]` 写法。

开发脚本及 Pages 构建会同步附件，并在生成网页时转换图片地址。`public/post-assets/` 为自动生成目录，不需要提交。缺失正文图片会导致构建失败，并提示文章及图片路径；正文 HTTPS 外链和 `/images/...` 等站点绝对路径保持不变。

## 出差报表与工具维护

出差报表将钱迹导出的 XLSX 转换为每日消费报表，支持日期范围、类别映射、汇总组、预算结余、设置备份及 Excel 导出。仅统计报销记录。

- 账单在浏览器内处理，不上传、不持久保存；只有设置写入本机 `localStorage`。
- 支持 PWA 离线使用，需先在线加载并完成缓存。开发模式不安装离线缓存，请使用生产预览或 HTTPS 站点验收。
- 从旧 Sites 地址迁移时，在旧站导出 v2 设置 JSON，再到新站导入；账单重新选择，手机主屏幕快捷方式重新添加。
- 默认参数在 `tools/trip-report/src/config.ts`，报表计算在 `model.ts`，Excel 读写在 `excel.ts`。
- 博客版以本仓库源码为准，修改旧的 `D_account` 副本不会自动更新博客。

新增工具时，在 `tools/<slug>/` 保存独立应用，并完成以下接入：

1. 将资源基础路径配置为 `/tools/<slug>/`；PWA 的启动路径、图标与 Service Worker 作用域也限定在该目录。
2. 在 `src/lib/tools.ts` 注册工具信息。`addedOn` 使用 `YYYY-MM-DD`，首页按此日期倒序取前两个。工具卡片仅保留标题、简介和链接按钮，不增加功能标签或提示段落。
3. 在 `scripts/build-tools.mjs` 添加构建项，并在部署工作流中添加依赖安装和测试步骤。
4. 避免创建与工具输出路径相同的 Next.js 页面。不要提交用户账单、验收文件、密钥、依赖目录或构建产物。

详细说明见 [浏览器工具维护](tools/README.md)。同域工具的 localStorage 不按路径隔离，存储键应带工具专属前缀。

## 页面路由

| 路径 | 内容 |
|------|------|
| `/` | 简介、最新文章、最新工具 |
| `/blog/` | 全部文章 |
| `/blog/<slug>/` | 文章详情 |
| `/blog/tag/<tag>/` | 标签筛选 |
| `/tools/` | 工具箱 |
| `/tools/trip-report/` | 出差报表 |
| `/about/` | 关于作者 |

## GitHub Pages 发布

仓库为 `y600o/y600o.github.io`，当前部署在域名根路径。GitHub 仓库 Settings → Pages 的 Source 设置为 **GitHub Actions**。

推送 `main` 分支或手动运行工作流后，Actions 会安装博客与工具依赖、运行工具测试、构建整站并发布 `out/`。在 Actions 确认部署成功后，再检查首页、文章、工具箱及报表入口。

`next.config.ts` 已配置 `output: 'export'`、`trailingSlash: true` 和 `images.unoptimized: true`。自定义域名需在 GitHub Pages 配置并设置 DNS；使用自定义域名本身不要求设置 `basePath`。如果改为 `/仓库名/` 子路径部署，需要同时调整博客、工具基础路径、链接和 PWA 配置，不能仅修改 Next.js 的 `basePath`。

## 设计规范

| 变量 | 色值 | 用途 |
|------|------|------|
| --primary | #2E8B57 | 主色调，深绿 |
| --accent | #3CB371 | 强调色，浅绿 |
| --secondary | #E8F5E9 | 次要背景 |
| --background | #F9F9F9 | 页面背景 |

采用直角元素、色块分区与简洁布局，保持博客和工具入口的视觉一致。
