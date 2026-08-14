// 新文章先发原博客，这里补一条索引就行。
export type StaticPost = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  theme: string;
  tags: string[];
  cover: string;
  sourceUrl: string;
  sourceLabel: string;
};

export const assetUrl = (asset: string) => `${import.meta.env.BASE_URL}assets/${asset}`;

export const siteLinks = {
  home: "https://morro.asia/",
  blog: "https://blog.morro.asia/",
  github: "https://github.com/realmorro369-arch",
};

export const siteThemes = [
  ["01", "SELF-HOST", "NAS、Docker 与家庭服务的自主管理。"],
  ["02", "NETWORK", "Cloudflare、内网与可用连接的实践记录。"],
  ["03", "MAKE NOTES", "把搭建过程、踩坑和判断沉淀为可回看的笔记。"],
] as const;

export const staticPosts: StaticPost[] = [
  { slug: "cloudflare-connection", title: "成功连入CloudFlare", publishedAt: "2026-08-10", excerpt: "一次从 Cloudflare 获取凭据、以 Docker 连接服务，并整理 NAS 与 Home Assistant 入口的部署记录。", theme: "NETWORK LOG", tags: ["Cloudflare", "Docker", "NAS"], cover: assetUrl("morro-cloud-article.png"), sourceUrl: "https://blog.morro.asia/2026/08/10/%E6%88%90%E5%8A%9F%E8%BF%9E%E5%85%A5CloudFlare/", sourceLabel: "MorroBlog 原文" },
  { slug: "xiaomi-local-music", title: "小爱音箱如何播放本地歌曲", publishedAt: "2026-08-10", excerpt: "围绕本地音频推流与设备服务的实验笔记，保留可继续完善的实现线索。", theme: "HOME LAB", tags: ["内网", "NAS", "玩"], cover: assetUrl("morro-home-lab-article.png"), sourceUrl: "https://blog.morro.asia/2026/08/10/%E5%B0%8F%E7%88%B1%E9%9F%B3%E7%AE%B1%E5%A6%82%E4%BD%95%E6%92%AD%E6%94%BE%E6%9C%AC%E5%9C%B0%E6%AD%8C%E6%9B%B2/", sourceLabel: "MorroBlog 原文" },
  { slug: "hexo-butterfly-guide", title: "用 Hexo + Butterfly 搭建一个免费博客", publishedAt: "2026-08-07", excerpt: "从初始化 Hexo、安装主题到 GitHub Actions 发布的一份静态博客搭建记录。", theme: "PUBLISHING", tags: ["Hexo", "教程", "Morro"], cover: assetUrl("morro-notes-article.png"), sourceUrl: "https://blog.morro.asia/2026/08/07/hexo-butterfly-guide/", sourceLabel: "MorroBlog 原文" },
  { slug: "welcome", title: "欢迎来到我的博客", publishedAt: "2026-08-07", excerpt: "关于这个技术博客的开篇说明：记录学习、实验过程与日常折腾中的有用发现。", theme: "EDITORIAL NOTE", tags: ["Morro", "随笔"], cover: assetUrl("morro-signal-hero.png"), sourceUrl: "https://blog.morro.asia/2026/08/07/welcome/", sourceLabel: "MorroBlog 原文" },
];

export const allTags = Array.from(new Set(staticPosts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b, "zh-CN"));
