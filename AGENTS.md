# 个人博客项目规范

## 项目概述

一个使用 Next.js 16 + TypeScript + Tailwind CSS 构建的个人技术博客，采用"直角+色块"设计理念，主色调为绿色系。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.1 | React 框架 |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.9.3 | 类型系统 |
| Tailwind CSS | 4.1.18 | 样式方案 |
| Lucide React | 0.468.0 | 图标库 |
| gray-matter | 4.0.3 | Markdown 元数据解析 |
| remark | 15.0.1 | Markdown 处理 |

## 目录结构

```
.
├── content/
│   └── posts/           # Markdown 文章目录
│       ├── welcome-to-my-blog.md
│       ├── nextjs-16-features.md
│       ├── typescript-best-practices.md
│       ├── tailwind-css-tips.md
│       └── 2024-year-summary.md
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── page.tsx            # 首页
│   │   ├── layout.tsx         # 根布局
│   │   ├── not-found.tsx      # 404 页面
│   │   ├── blog/
│   │   │   ├── page.tsx       # 博客列表页
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # 文章详情页
│   │   └── about/
│   │       └── page.tsx      # 关于页
│   ├── components/     # React 组件
│   │   ├── Header.tsx        # 导航栏
│   │   ├── Footer.tsx        # 页脚
│   │   ├── PostCard.tsx      # 文章卡片
│   │   ├── TagCloud.tsx      # 标签云
│   │   ├── BackToList.tsx    # 返回列表
│   │   └── ShareButton.tsx   # 分享按钮
│   └── lib/
│       ├── posts.ts   # 文章处理工具
│       └── utils.ts   # 通用工具函数
├── public/            # 静态资源
├── .github/
│   └── workflows/     # GitHub Actions
│       └── deploy.yml # 部署工作流
└── next.config.ts    # Next.js 配置
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 5000) |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | ESLint 检查 |
| `pnpm ts-check` | TypeScript 类型检查 |

## 设计规范

### 颜色系统

```css
--primary: #2E8B57      /* 主色调 - 深绿 */
--accent: #3CB371       /* 强调色 - 浅绿 */
--secondary: #E8F5E9     /* 次要背景 */
--background: #F9F9F9   /* 页面背景 */
```

### 设计原则

1. **直角风格**: 所有元素 `border-radius: 0`
2. **色块分区**: 使用色块划分内容区域
3. **简洁专业**: 保持视觉简洁，避免过度装饰

## 文章系统

### 文章元数据格式

```markdown
---
title: '文章标题'
date: '2024-01-01'
excerpt: '文章摘要'
tags: ['标签1', '标签2']
coverImage: '/images/posts/cover.jpg'
---

# 文章正文
```

### 文章工具函数

| 函数 | 说明 |
|------|------|
| `getAllPosts()` | 获取所有文章元数据 |
| `getPostBySlug(slug)` | 获取单篇文章（含正文） |
| `getAllTags()` | 获取所有标签及计数 |
| `getPostsByTag(tag)` | 按标签筛选文章 |
| `getRelatedPosts(slug, tags)` | 获取相关文章 |

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 - 博客简介 + 最新文章 |
| `/blog` | 博客列表 - 所有文章 |
| `/blog/[slug]` | 文章详情页 |
| `/blog/tag/[tag]` | 标签筛选页 |
| `/about` | 关于作者页 |

## 部署说明

### GitHub Pages 部署

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 设置 Source 为 `GitHub Actions`
3. 推送代码到 `main` 分支
4. GitHub Actions 将自动构建并部署

### 自定义域名（可选）

1. 在 `next.config.ts` 中取消 `basePath` 注释并修改
2. 在 GitHub 仓库设置中添加自定义域名

## 常见问题

### 1. 构建失败

检查 `content/posts/` 目录是否存在且包含 `.md` 文件。

### 2. 图片显示问题

静态导出模式下图片需要禁用优化，确保 `next.config.ts` 中设置了 `images.unoptimized: true`。

### 3. 标签页 404

确保标签名正确编码，使用 `encodeURIComponent` 处理中文标签。
