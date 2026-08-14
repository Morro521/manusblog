# MorroBlog 静态化任务清单

## GitHub-only 交付状态

- [x] 审阅 `morro.asia` 与 `blog.morro.asia`，提取可验证的主页、技术主题与文章索引信息。
- [x] 以“地层信号”建立统一的视觉、排版、导航与内容叙事规则。
- [x] 删除数据库、认证、tRPC、对象存储、Docker、服务端 API 和运行时分析依赖。
- [x] 将 4 篇公开博客记录、标签和主题整理为版本化静态内容模型。
- [x] 将品牌标识、首页主视觉和文章封面保存到 `client/public/assets/`，随 Git 跟踪。
- [x] 使用 Hash 路由，确保 GitHub Pages 可直接刷新文章索引、时间轴、标签与详情页。
- [x] 提交 `docs/` 静态发布目录，可由 GitHub Pages 直接从 `main` 分支托管。
- [x] 运行 `pnpm check` 与 `pnpm build`，并完成首页、文章索引和文章详情的本地静态预览。

## 后续内容维护

- [ ] 在发布新的 MorroBlog 原文时，同步更新 `client/src/data/site.ts` 中的标题、摘要、日期、标签和原文链接。
- [ ] 在 GitHub 仓库设置中将 Pages 部署来源设为 **Deploy from a branch → main /docs**，以启用首次生产发布。
- [ ] 如需新增图片，先保存到 `client/public/assets/` 并提交到 Git，避免引入外部图床或对象存储依赖。
