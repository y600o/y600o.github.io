# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

本项目使用 pnpm（通过 preinstall hook 强制）。

```bash
pnpm dev          # 启动开发服务器（端口 5000）
pnpm build        # 构建生产版本（Next.js + server bundle）
pnpm start        # 启动生产服务器
pnpm lint         # ESLint 检查
pnpm ts-check     # TypeScript 类型检查
```

## 架构

**框架**: Next.js 16 App Router，静态导出模式（`next.config.ts` 中 `output: 'export'`），用于 GitHub Pages 部署。

**内容系统**: `content/posts/*.md` 中的 Markdown 文章由 `src/lib/posts.ts` 解析，使用 gray-matter（frontmatter）和 remark（markdown 转 HTML）。文章 frontmatter 必须包含 `title`、`date`、`excerpt`；可选 `tags` 和 `coverImage`。

**主要路由**:
- `/` - 首页，展示最新文章
- `/blog` - 博客列表
- `/blog/[slug]` - 文章详情页
- `/blog/tag/[tag]` - 标签筛选页
- `/about` - 关于页面

**设计风格**: "直角+色块"理念，所有元素 `border-radius: 0`。主色 `#2E8B57`（深绿），强调色 `#3CB371`（浅绿）。CSS 变量定义在 `globals.css`。

**服务器**: `src/server.ts` 自定义服务器，处理开发和生产环境的请求。

## 重要文件

- `src/lib/posts.ts` - 文章处理函数：`getAllPosts()`、`getPostBySlug(slug)`、`getAllTags()`、`getPostsByTag(tag)`、`getRelatedPosts(slug, tags)`
- `src/app/layout.tsx` - 根布局，包含 Header/Footer
- `next.config.ts` - 静态导出配置，图片禁用优化以适配 GitHub Pages

## 新增文章

在 `content/posts/` 创建 `.md` 文件：

```markdown
---
title: '文章标题'
date: '2024-01-01'
excerpt: '摘要'
tags: ['标签1']
---

正文内容...
```