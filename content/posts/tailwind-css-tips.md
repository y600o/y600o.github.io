---
title: 'Tailwind CSS 实战技巧'
date: '2024-12-25'
excerpt: 'Tailwind CSS 是现代 CSS 框架的代表。本文将分享一些实用的 Tailwind CSS 技巧，让你的样式开发更高效。'
tags: ['Tailwind CSS', 'CSS', '前端']
coverImage: '/images/posts/tailwind.jpg'
---

# Tailwind CSS 实战技巧

Tailwind CSS 提供了原子化的 CSS 解决方案，让样式开发变得高效且一致。

## 1. 使用 @apply 复用样式

```css
/* 定义可复用的组件样式 */
.btn-primary {
  @apply bg-green-600 text-white px-6 py-2 font-semibold;
  @apply hover:bg-green-700 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

## 2. 自定义设计系统

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2E8B57',
        accent: '#3CB371',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
};
```

## 3. 使用 Dark Mode

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 class="text-2xl font-bold">深色模式</h1>
</div>
```

## 4. 响应式设计

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 响应式网格 -->
</div>
```

## 5. 常用技巧

### 垂直居中

```html
<div class="flex items-center justify-center h-screen">
  <div>垂直居中的内容</div>
</div>
```

### 文字截断

```html
<p class="truncate">超长文本会被截断显示...</p>
<p class="line-clamp-3">最多显示3行文字...</p>
```

## 总结

Tailwind CSS 的原子化设计让样式开发变得高效且一致。希望这些技巧对你有帮助！

---

Happy Styling! 🎨
