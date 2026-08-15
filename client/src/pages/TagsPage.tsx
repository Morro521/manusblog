import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function TagsPage() {
  const [, navigate] = useLocation();
  const { data: tags, isLoading } = trpc.tags.list.useQuery();
  const orderedTags = [...(tags || [])].sort((a: any, b: any) => (b.postCount || 0) - (a.postCount || 0) || a.name.localeCompare(b.name));

  return <div className="pb-10"><section className="grid overflow-hidden rounded-[1.6rem] border border-white/[0.14] bg-[#202630]/78 px-6 py-10 shadow-xl shadow-black/10 sm:px-10 sm:py-14 lg:grid-cols-12"><div className="lg:col-span-5"><p className="text-sm text-slate-300">文章标签</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">从一个词，<br />走进一片<span className="display-accent">话题。</span></h1></div><div className="mt-7 max-w-lg lg:col-span-5 lg:col-start-8 lg:mt-2"><p className="copy-lede">标签帮助你从不同的技术话题和兴趣出发，找到之前留下的文章。</p></div></section>{isLoading ? <div className="grid min-h-72 place-items-center"><p className="text-sm text-slate-300">正在读取标签…</p></div> : orderedTags.length ? <section className="mt-6 grid gap-3">{orderedTags.map((tag: any) => <button key={tag.id} onClick={() => navigate(`/posts?tag=${tag.slug}`)} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.13] bg-[#202630]/64 p-5 text-left shadow-lg shadow-black/10 transition-colors hover:border-[#bce8eb]/42 hover:bg-white/[0.055]"><span className="text-xl font-medium text-white transition-colors group-hover:text-[#d6fbfc] sm:text-2xl">#{tag.name}</span><span className="flex items-center gap-4 text-sm text-slate-300"><span>{tag.postCount || 0} 篇文章</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:text-[#bce8eb]" /></span></button>)}</section> : <section className="mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-white/[0.16] bg-[#202630]/52 px-5 text-center"><div><p className="text-sm font-medium text-slate-200">还没有标签</p><p className="mt-3 text-sm text-slate-400">文章添加标签后，会从这里开始整理。</p></div></section>}</div>;
}
