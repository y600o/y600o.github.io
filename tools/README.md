# 浏览器工具维护

工具源码统一保存在本仓库，各自使用独立依赖与构建；不要再修改旧的 `D_account` 副本来更新博客版本。

## 出差报表

在仓库根目录执行：

```sh
npm ci --prefix tools/trip-report
npm --prefix tools/trip-report run dev
npm --prefix tools/trip-report test
```

开发地址带 `/tools/trip-report/` 路径。生产模式可使用 `npm --prefix tools/trip-report run build` 和 `npm --prefix tools/trip-report run preview` 验证离线功能。

业务默认参数位于 `trip-report/src/config.ts`，计算位于 `model.ts`，Excel 读写位于 `excel.ts`。账单只在浏览器内处理，不上传、不持久保存。仅设置使用 localStorage。

从旧站迁移时，在旧站导出 v2 设置 JSON，再在新站导入；原账单重新选择。新域名不会继承旧站的存储、缓存和主屏幕安装。

## 整站构建与发布

博客依赖使用 pnpm，工具依赖使用各自的 npm 锁文件。安装依赖后，在根目录执行 `pnpm build:pages`，生成包含工具的 `out/`。不要仅上传工具的 dist 或仅构建博客。GitHub Actions 自动安装、测试、构建并统一发布；推送 main 触发上线。工具构建或测试失败会阻止发布。

旧 Sites 站点保持不变。迁移验收后，可将新地址作为常用入口。回退时恢复相关提交并重新运行部署工作流。

## 添加工具

1. 将独立应用放入 `tools/<slug>/`，提交源码及锁文件，不提交 node_modules、dist、用户文件或密钥。
2. 配置资源基础路径为 `/tools/<slug>/`；如有 PWA，启动路径、图标、注册路径和缓存作用域必须限定于此目录。
3. 在 `src/lib/tools.ts` 注册名称、描述、添加日期及 slug（卡片仅展示标题、简介和链接按钮），在 `scripts/build-tools.mjs` 添加构建项，并在部署工作流添加该工具的依赖安装和测试步骤。
4. 不创建与工具路径相同的 Next.js 页面。浏览器工具通过普通链接打开，构建产物由脚本合并至 out。

各工具共用域名，因此 localStorage 键须带工具专属前缀；路径不会隔离同源存储。涉及敏感数据或不可信代码的工具应另行评估隔离方式。

## 发布前人工验收

检查桌面与 iPhone Safari 的导入、导出、设置恢复、离线、主屏幕安装和更新提示。打开工具后返回博客，确认 Service Worker 只控制该工具目录。真实账单验收可设置 `QIANJI_SAMPLE` 环境变量后运行现有测试；文件不得提交仓库。
