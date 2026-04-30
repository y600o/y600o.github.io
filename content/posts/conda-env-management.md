---
title: 'conda环境管理'
date: '2026-04-30'
excerpt: 'conda环境管理，包括：conda环境的创建和激活、python库的下载方法、conda环境的切换和删除。'
tags: ['Python', '环境配置']
---

开始菜单搜索`Anaconda Prompt`并打开，以下操作都在此运行。

### 创建conda环境

env是你创建的环境名称

```Python
conda create -n env
```

也可以在创建时指定python版本

```Python
conda create -n env python=3.8
```

### 激活环境

```Python
conda activate env
```

### 管理环境中的包

#### 1. 安装

使用conda安装，如安装pip

```Python
conda install pip
```

安装pip后也可以用pip安装其他包，如安装matplotlib

```Python
pip install matplotlib
```

#### 2. 查看

列出当前环境中的所有包

```Python
pip list
```

或使用conda查看

```Python
conda list
```

#### 3. 更新

使用conda更新包，如更新matplotlib

```Python
conda update matplotlib
```

或使用pip更新

```Python
pip install --upgrade matplotlib
```

#### 4. 卸载

使用conda移除一个包，如卸载matplotlib

```Python
conda remove matplotlib
```

或使用pip卸载

```Python
pip uninstall matplotlib
```

#### 5. 导出

将当前环境的所有包导出

```Python
conda env export > environment.yml
```

#### 6. 新环境创建

使用environment.yml创建环境

```Python
conda env create -f environment.yml
```

### 退出环境

```Python
conda deactivate
```

### 查看所有conda环境

```Python
conda env list
```

### 删除环境

env是你要删除的环境名称

```Python
conda env remove -n env
```
