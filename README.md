# MorroBlog

Morro 的个人技术博客索引页。内容主要来自原博客，新的前端把文章、标签和归档放在一起，方便查找。正文还是跳回原博客看。

## 本地跑起来

```bash
pnpm install
pnpm dev
```

检查和构建：

```bash
pnpm check
pnpm build
```

`dist/` 是构建结果。仓库里的 `docs/` 是已经构建好的版本，GitHub Pages 直接用它。

## 更新内容

文章索引都在 `client/src/data/site.ts`。新增文章时补上标题、日期、简介、标签、封面和原文链接即可。

图片放在 `client/public/assets/`。改完内容后跑一次 `pnpm build`，把 `dist/` 里的文件同步到 `docs/`，然后一起提交。

## GitHub Pages

仓库设置里打开 **Settings → Pages**，部署来源选 **Deploy from a branch**，分支选 `main`，目录选 `/docs`。

不需要数据库、登录、对象存储或后端服务。

## 目录

```text
client/src/data/site.ts       文章和站点数据
client/src/pages/             页面
client/public/assets/         图片和图标
docs/                         GitHub Pages 发布目录
```
