import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function TagsPage() {
  const [, navigate] = useLocation();
  const { data: tags, isLoading } = trpc.tags.list.useQuery();
  const orderedTags = [...(tags || [])].sort((a: any, b: any) => (b.postCount || 0) - (a.postCount || 0) || a.name.localeCompare(b.name));

  return (
    <div>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-5"><p className="editorial-kicker">SUBJECT INDEX / KEYWORDS</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">从一个词，<br />进入一片<span className="display-accent">区域。</span></h1></div>
        <div className="mt-7 max-w-lg lg:col-span-5 lg:col-start-8 lg:mt-1"><p className="copy-lede">标签不是装饰。它们是这份私人档案的索引词，帮助你在不同技术话题和兴趣之间建立连接。</p></div>
      </section>

      {isLoading ? <div className="py-28"><p className="editorial-kicker">LOADING TERMS…</p></div> : orderedTags.length ? <section className="border-b border-white/[0.15]">{orderedTags.map((tag: any, index: number) => <button key={tag.id} onClick={() => navigate(`/posts?tag=${tag.slug}`)} className="group grid w-full border-t border-white/[0.12] py-5 text-left first:border-t-0 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:py-6"><span className="article-index">{String(index + 1).padStart(2, "0")}</span><span className="text-xl text-stone-200 transition-colors group-hover:text-[#c6edf0] sm:text-2xl">#{tag.name}</span><span className="mt-3 flex items-center gap-4 sm:mt-0"><span className="font-mono text-[10px] tracking-[0.13em] text-stone-600">{String(tag.postCount || 0).padStart(2, "0")} RECORDS</span><ArrowRight size={15} className="text-stone-500 transition-transform group-hover:translate-x-1 group-hover:text-[#c6edf0]" /></span></button>)}</section> : <section className="grid min-h-[360px] place-items-center border-b border-white/[0.15] text-center"><div><p className="editorial-kicker">NO TERMS YET</p><p className="mt-3 text-sm text-stone-500">当第一篇文章被归类后，索引会从这里开始。</p></div></section>}
    </div>
  );
}
