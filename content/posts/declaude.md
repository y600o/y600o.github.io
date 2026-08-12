---
title: 清除GitHub仓库多余贡献者
date: 2026-08-13
excerpt: 清除GitHub仓库中的AI自动提交导致的多余署名。
tags:
  - GitHub
  - claude
---
# 清除GitHub仓库多余贡献者完整操作流程

说明：先执行第一部分清除提交内AI署名；若操作完成后贡献者名单仍残留Cloud账号，再执行第二部分网页端分支清理流程。

## 一、清除Git提交中的AI署名

1. 打开终端，执行命令定位带有AI署名的目标提交：

```bash
git log --all --format="%h %s %(trailers)" | grep -i "claude"
```

2. 查看提交历史，记录错误提交之前的Commit Hash；

```bash
git log --oneline -10
```

3. 依次执行以下命令，重写提交历史并验证AI署名已消失；

```bash
git reset --soft <错误的提交之前的Hash>`、`git commit -m "这里写你原本的提交信息"
git log --oneline --format="%h %s %(trailers)" | grep -i "claude"
```

4. 强制推送重写后的提交记录覆盖远程仓库。

```bash
git push --force-with-lease origin main
```

## 二、网页端分支重命名彻底清除残留Cloud贡献者

1. 打开目标GitHub仓库，进入**Code**主页面；

2. 点击分支选择下拉框，输入`temp`，选择 **Create branch temp from main** 完成临时分支创建；

3. 进入仓库**Settings** → **General**，找到Default branch区域，点击当前分支main旁的切换按钮，在列表选temp，确认保存默认分支切换；

4. 返回Code页，点分支下拉框 → **View all branches**，找到main分支；

5. 点main分支右侧三点菜单，选**Rename branch**，将main重命名为`main1`并点Rename branch确认；

6. 再次进入Settings → General，用同样的切换按钮，把Default branch从temp切回main1；

7. 回到分支列表，找到main1分支，点三点菜单选Rename branch，改回`main`并确认；

8. 进入分支列表，找到temp分支，点右侧垃圾桶图标，确认删除临时分支；

9. 刷新仓库页面，Contributors列表中Cloud账号已清除。