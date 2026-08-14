/** 地层信号设计基线：归档页以时间坐标呈现版本化文章记录，不使用远程查询。 */
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { staticPosts } from "@/data/site";

export default function StaticArchives() {
  const years = Array.from(new Set(staticPosts.map((post) => post.publishedAt.slice(0, 4))));
  return <section className="archive-page"><div className="index-page__hero"><p className="signal-label">TIMELINE / VERSIONED MEMORY</p><h1 className="display-title">时间坐标</h1><p className="lede">每篇公开记录都有它的时间位置；这里按发布日重新聚合，便于回看和继续追踪。</p></div>{years.map((year) => <div key={year} className="timeline-group"><div className="timeline-group__year">{year}</div><div className="timeline-group__entries">{staticPosts.filter((post) => post.publishedAt.startsWith(year)).map((post) => <Link key={post.slug} href={`/notes/${post.slug}`} className="timeline-entry"><time>{post.publishedAt.slice(5).replace("-", ".")}</time><div><p className="signal-label">{post.theme}</p><h2>{post.title}</h2><p>{post.excerpt}</p></div><ArrowUpRight size={18} /></Link>)}</div></div>)}</section>;
}
