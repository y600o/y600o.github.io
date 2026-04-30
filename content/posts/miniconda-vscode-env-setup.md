---
title: 'Miniconda + VS Code的python基本环境配置（windows）'
date: '2026-04-29'
excerpt: 'Windows中的python基本环境配置，包括：Miniconda和VS Code的安装和扩展配置。'
tags: ['Windows', 'Python', 'Miniconda', 'VS Code', '软件安装']
---

## 安装Miniconda

为了更好地管理python，需要根据自己的需求选择安装Anaconda或者Miniconda，二者的安装流程大致一致。如果你不清楚二者的区别，那就安装Miniconda。这里以Miniconda为例。

### 第一步：下载Miniconda安装包

1. 打开Miniconda官网  [链接](https://www.anaconda.com/download/success?reg=skipped)
2. 点击“Windows 64-Bit Graphical Installer”下载安装包

### 第二步：安装Miniconda

1. 双击安装包运行
2. “Install for”选项选择“All Users (requires admin privileges)”
3. 勾选“Create shortcuts (supported padkages only).”、“Register Miniconda3 as the system Python 3. 13”、“Clear the padkage cadhe upon completion”
4. 其他选项默认即可（可自定义安装路径），最后点击“Install”进行安装

## 安装 VS Code

VS Code是一款很受欢迎的开源免费、跨平台的代码编辑器。拥有轻量化的特点，且扩展丰富。

### 第一步：下载VS Code安装包

1. 打开VS Code官网  [链接](https://code.visualstudio.com/)
2. 点击“Download for Windows”下载安装包

### 第二步：安装VS Code

1. 双击安装包运行
2. 勾选“创建桌面快捷方式 ”及该页面的其他所有选项
3. 其他选项默认即可（可自定义安装路径），最后点击“安装”

### 第三步：汉化

1. 打开VS Code，按Ctrl+Shift+X或者点击左侧的“Extensions”按钮打开扩展市场
2. 搜索安装`Chinese (Simplified)`
3. 安装后点击右下角的“Change Language and Rwstart”重新启动VS Code就是中文界面了

### 第三步：安装Python扩展

1. 打开VS Code，按Ctrl+Shift+X或者点击左侧的“扩展”按钮打开扩展市场
2. 搜索安装`Python`，会自动安装python相关插件，共四个
3. 安装后重启VS Code

## 开始编码

1. 打开VS Code，点击左上角“文件”-“新建文件”
2. 输入文件名，加上后缀`.py`，点击“新建文件”，选择文件位置，点击“保存”
3. 然后即可开始编码
4. 编码完成后按Ctrl+F5或点击左上角的三角图标运行

