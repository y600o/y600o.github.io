# 个人博客

一个使用 Next.js + TypeScript + Tailwind CSS 构建的个人博客网站，采用"直角+色块"设计理念，主题色为绿色系。

## 功能特性

- ✅ Markdown 文章系统
- ✅ 标签分类和筛选
- ✅ 响应式设计
- ~~✅ 深色/浅色模式支持~~
- ✅ 文章阅读时间估算
- ✅ 相关文章推荐
- ✅ GitHub Pages 部署支持

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **内容**: Markdown (gray-matter + remark)
- **部署**: GitHub Pages

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5000

### 构建生产版本

```bash
pnpm build
```

### 静态导出

```bash
pnpm export
```

## 项目结构

```
├── content/
│   └── posts/          # Markdown 文章目录
│       ├── first-post.md
│       └── ...
├── src/
│   ├── app/            # Next.js App Router 页面
│   │   ├── blog/       # 博客相关页面
│   │   ├── about/      # 关于页面
│   │   └── ...
│   ├── components/     # React 组件
│   └── lib/            # 工具函数
├── public/            # 静态资源
└── .github/
    └── workflows/      # GitHub Actions 配置
```

## 写作指南

### 创建新文章

在 `content/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: '文章标题'
date: '2024-01-01'
excerpt: '文章摘要'
tags: ['标签1', '标签2']
coverImage: '/images/posts/cover.jpg'
---

# 文章正文

使用 Markdown 编写内容...
```

### 文章元数据

| 字段 | 说明 | 必填 |
|------|------|------|
| title | 文章标题 | 是 |
| date | 发布日期 (YYYY-MM-DD) | 是 |
| excerpt | 文章摘要 | 是 |
| tags | 标签数组 | 否 |
| coverImage | 封面图片路径 | 否 |

## 部署到 GitHub Pages

1. Fork 或克隆此仓库
2. 在 GitHub 仓库设置中启用 GitHub Pages
3. 设置 Source 为 `gh-pages` 分支
4. 推送代码到 `main` 分支，GitHub Actions 将自动部署

### 自定义域名（可选）

1. 在 `next.config.ts` 中取消 `basePath` 的注释并修改
2. 在 GitHub 仓库设置中添加自定义域名
3. 配置 DNS 记录

## 设计规范

### 颜色系统

| 变量 | 色值 | 用途 |
|------|------|------|
| --primary | #2E8B57 | 主色调（深绿） |
| --accent | #3CB371 | 强调色（浅绿） |
| --secondary | #E8F5E9 | 次要背景 |
| --background | #F9F9F9 | 页面背景 |

### 设计理念

- **直角风格**: 所有元素使用 0 圆角
- **色块分区**: 使用色块划分内容区域
- **简洁专业**: 保持视觉简洁，避免过度装饰

## License

MIT
