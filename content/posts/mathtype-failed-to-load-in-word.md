---
title: 启动Word时加载MathType失败
date: 2026-10-21
excerpt: 修复Word中的MathType插件缺少dll文件问题。
tags:
  - 软件设置
  - MathType
---
## 问题

1. Microsoft Word 启动时显示 `Please reload Word to load MathType addin properly`
2. 在 Microsoft Word 中使用 MathType 选项卡时，无法打开并报错 `运行时错误‘53’`
## 解决方法

1. 打开目录 `C:\Program Files (x86)\MathType\MathPage\64`（根据操作系统位数选择 32 位或 64 位）；
2. 复制 `MathPage.wll` 文件；
3. 粘贴到 `C:\Program Files\Microsoft Office\root\Office16` 目录下即可。
