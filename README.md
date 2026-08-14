# MorroBlog

> **一个记录自托管、网络、硬件与个人技术实验的静态技术档案。**

本项目由 React、TypeScript 和 Vite 构建为纯静态网站。它不包含数据库、认证、对象存储、API、Docker 服务或环境变量；构建产物可由 **GitHub Pages** 直接托管。

## 内容边界

新版主页与索引整理自 Morro 已公开的两个站点。个人主页提供博客和 GitHub 等入口；MorroBlog 提供已发布文章的标题、日期、主题与原文链接。静态索引不复制原文，以既有博客为唯一正文来源。

| 内容 | 来源 | 在本项目中的位置 |
|---|---|---|
| 个人主页入口 | [morro.asia](https://morro.asia/) | 站点导航与“关于”页 |
| 文章索引 | [blog.morro.asia](https://blog.morro.asia/) | `client/src/data/site.ts` |
| GitHub 出口 | [realmorro369-arch](https://github.com/realmorro369-arch) | 站点导航与页脚 |
| 本地视觉资源 | Git 跟踪的 PNG 文件 | `client/public/assets/` |

## 本地开发

```bash
pnpm install
pnpm dev
```

开发服务器会输出本地访问地址。执行以下命令可进行静态构建与类型检查：

```bash
pnpm check
pnpm build
```

构建结果写入 `dist/`，不需要启动任何后端服务。

## 内容维护

新增或修订首页、索引、标签与时间轴内容时，只需编辑 `client/src/data/site.ts`。每条记录包含标题、发布日期、摘要、标签、仓库内封面图以及指向原始 MorroBlog 文章的 URL。静态文章页会展示该索引信息，并提供“阅读原文”出口。

视觉资源必须保存在 `client/public/assets/`，然后通过 `assetUrl()` 引用。请勿改用对象存储、第三方图床或运行时图片接口，以保留 GitHub Pages 的独立可部署性。

## 部署到 GitHub Pages

仓库提交了已构建的 `docs/` 静态目录。请在仓库的 **Settings → Pages** 中把部署来源设置为 **Deploy from a branch**，选择 `main` 分支与 `/docs` 目录。GitHub Pages 会直接托管该目录，无需 GitHub Actions、应用服务器或环境变量。

修改内容后，请先运行 `pnpm build`，再将新的 `dist/` 内容同步至 `docs/` 并一并提交。这样，源代码、视觉资源和可部署产物都由 Git 管理。

## 目录结构

```text
client/
├── public/assets/             # 跟踪在 Git 中的图片与 favicon
└── src/
    ├── components/SiteLayout.tsx
    ├── data/site.ts           # 版本化的站点和文章数据
    ├── pages/Static*.tsx      # 纯静态路由页面
    ├── App.tsx                # Hash 路由，适配 GitHub Pages
    └── index.css              # “地层信号”设计系统
docs/                           # GitHub Pages 直接托管的已构建静态产物
```

## 设计方向

界面采用“**地层信号**”的编辑型设计：深海墨蓝承载长阅读，矿物白保证可读性，**Morro Signal Teal `#00A89A`**用于坐标、状态和阅读路径。布局使用章节编号、信号线和非对称图文关系，避免通用卡片墙和过度装饰。

## 许可证

MIT License。
