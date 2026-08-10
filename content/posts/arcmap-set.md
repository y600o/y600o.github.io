---
title: ArcMap 设置
date: 2026-08-02
excerpt: 新装的ArcMap需要调整的几个设置。
tags:
  - 软件设置
  - Arcgis
---
## 操作步骤

### 第一步：加快软件的处理速率

地理处理-地理处理选项-后台处理-取消后台处理的勾选。

### 第二步：Mxd文档设置保存相对路径

自定义-arcmap选项-常规-勾选上将相对路径设为新建地图文档的默认设置。

### 第三步：关闭软件启动时ArcGIS与ArcGIS Online连接

1. 打开C盘找到文件夹“C:\Program Files (x86)\Common Files\ArcGIS\bin”；
2. 删除“ArcGISConnection.exe”与“ArcGISConnectionTest.exe”文件；
3. 软件下次启动的时候就不会建立与ArcGIS Online的连接了。

### 第三步：设置鼠标滚轮的缩小放大的方向

自定义-arcmap选项-常规-向前滚动选项设置为放大。