import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link, useRoute } from "wouter";
import { staticPosts } from "@/data/site";

export default function StaticNote() {
  const [, params] = useRoute("/notes/:slug"); const post = staticPosts.find((item) => item.slug === params?.slug);
  if (!post) return <div className="empty-state"><p className="signal-label">404 / UNAVAILABLE INDEX</p><p>该条目未包含在当前静态索引中。</p><Link href="/posts" className="text-link"><ArrowLeft size={16} /> 返回文章索引</Link></div>;
  return <article className="note-page"><Link href="/posts" className="back-link"><ArrowLeft size={16} /> 返回文章索引</Link><div className="note-page__heading"><p className="signal-label">{post.theme} / {post.publishedAt}</p><h1 className="display-title">{post.title}</h1><p className="lede">{post.excerpt}</p><div className="tag-row">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div><figure className="note-page__image"><img src={post.cover} alt="" /><figcaption>本文索引封面。原文发布于 MorroBlog。</figcaption></figure><div className="note-page__body"><p className="signal-label">SOURCE NOTE</p><p>这是一份用于浏览和定位的静态索引。为了让原有写作继续作为唯一可信正文来源，本页不复制文章内容；请从下方入口阅读作者在 MorroBlog 发布的完整记录。</p><a href={post.sourceUrl} target="_blank" rel="noreferrer" className="signal-button">打开 {post.sourceLabel} <ExternalLink size={16} /></a></div><div className="note-page__footer"><Link href="/archives">继续浏览时间轴 <ArrowUpRight size={16} /></Link><a href={post.sourceUrl} target="_blank" rel="noreferrer">原文链接 <ArrowUpRight size={16} /></a></div></article>;
}
