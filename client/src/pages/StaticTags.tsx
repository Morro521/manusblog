import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { allTags, staticPosts } from "@/data/site";

export default function StaticTags() {
  return <section className="tags-page"><div className="index-page__hero"><p className="signal-label">TOPIC MAP / CURRENT COVERAGE</p><h1 className="display-title">主题标签</h1><p className="lede">标签来自已公开记录，用来标记后续可延伸的网络、自托管与写作实践。</p></div><div className="tag-map">{allTags.map((tag, index) => <Link key={tag} href="/posts" className="tag-map__item"><span>{String(index + 1).padStart(2, "0")}</span><strong>{tag}</strong><em>{staticPosts.filter((post) => post.tags.includes(tag)).length} 篇记录</em><ArrowRight size={16} /></Link>)}</div></section>;
}
