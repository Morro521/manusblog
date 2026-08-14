import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Eye } from "lucide-react";

export default function Archives() {
  const [, navigate] = useLocation();
  const { data: posts, isLoading } = trpc.posts.list.useQuery({ page: 1, limit: 1000 });
  const groupedPosts = posts?.data?.reduce((acc: Record<string, any[]>, post: any) => {
    const date = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
    const key = `${date.getFullYear()} / ${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {});
  const sections = Object.keys(groupedPosts || {}).sort().reverse();
  const totalViews = posts?.data?.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0) || 0;

  return (
    <div>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-5"><p className="editorial-kicker">CHRONOLOGICAL ARCHIVE / 01—{String(posts?.data?.length || 0).padStart(2, "0")}</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">时间不是<br /><span className="display-accent">时间线。</span></h1></div>
        <div className="mt-7 max-w-lg lg:col-span-5 lg:col-start-8 lg:mt-1"><p className="copy-lede">这里按月保存所有发布过的记录。它不是新闻流，而是一份允许回看的个人技术档案。</p></div>
      </section>

      {isLoading ? <div className="py-28"><p className="editorial-kicker">LOADING ARCHIVE…</p></div> : sections.length ? <section className="border-b border-white/[0.15]">{sections.map((month, monthIndex) => <div key={month} className="grid border-t border-white/[0.12] first:border-t-0 lg:grid-cols-12"><div className="py-7 lg:col-span-3 lg:py-9"><p className="article-index">{String(monthIndex + 1).padStart(2, "0")}</p><h2 className="mt-2 font-mono text-xl tracking-[0.07em] text-[#c6edf0]">{month}</h2><p className="mt-2 text-xs text-stone-600">{groupedPosts?.[month]?.length || 0} RECORDS</p></div><div className="lg:col-span-9 lg:border-l lg:border-white/[0.12] lg:py-4 lg:pl-8">{groupedPosts?.[month]?.map((post: any, index: number) => <button key={post.id} type="button" onClick={() => navigate(`/posts/${post.slug}`)} className="group grid w-full gap-3 border-b border-white/[0.1] py-5 text-left last:border-b-0 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center" aria-label={`阅读文章：${post.title}`}><span className="article-index">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><h3 className="truncate text-lg text-stone-200 transition-colors group-hover:text-[#c6edf0]">{post.title}</h3><p className="mt-1 line-clamp-1 text-xs leading-5 text-stone-500">{post.excerpt || "尚未添加摘要。"}</p></div><div className="flex items-center gap-4 text-xs text-stone-600"><span className="flex items-center gap-1"><Eye size={12} />{post.viewCount || 0}</span><ArrowRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:text-[#c6edf0]" /></div></button>)}</div></div>)}</section> : <section className="grid min-h-[360px] place-items-center border-b border-white/[0.15] text-center"><div><p className="editorial-kicker">EMPTY ARCHIVE</p><p className="mt-3 text-stone-500">第一条记录还没有进入档案。</p></div></section>}

      <section className="grid gap-5 border-b border-white/[0.15] py-8 sm:grid-cols-3"><div><p className="article-index">RECORDS</p><p className="mt-2 font-mono text-2xl text-stone-200">{String(posts?.data?.length || 0).padStart(2, "0")}</p></div><div><p className="article-index">MONTHS</p><p className="mt-2 font-mono text-2xl text-stone-200">{String(sections.length).padStart(2, "0")}</p></div><div><p className="article-index">ALL VIEWS</p><p className="mt-2 font-mono text-2xl text-stone-200">{totalViews}</p></div></section>
    </div>
  );
}
