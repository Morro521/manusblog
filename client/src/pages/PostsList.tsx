import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Eye, Search, X } from "lucide-react";
import { buildPostIndexLocation, parsePostIndexFilters } from "@/lib/postFilters";
import { formatReadingTime } from "@/lib/readingTime";

const covers = [
  "/manus-storage/deep-field_cb6500bf.jpg",
  "/manus-storage/tokyo-night_3d3a06e3.jpeg",
  "/manus-storage/observatory-night_fc4b375d.jpg",
  "/manus-storage/anime-sakura_12e0ba1a.jpg",
];

function resolveCover(post: any, index: number) {
  const candidate = typeof post.coverImage === "string" ? post.coverImage.trim() : "";
  return candidate.startsWith("/manus-storage/") || candidate.startsWith("https://") || candidate.startsWith("http://")
    ? candidate
    : covers[index % covers.length];
}

export default function PostsList() {
  const [, navigate] = useLocation();
  const queryString = useSearch();
  const filtersFromUrl = parsePostIndexFilters(queryString);
  const { tagSlug: tagFromUrl, categoryId: categoryFromUrl, search: searchFromUrl } = filtersFromUrl;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedTag, setSelectedTag] = useState<string | null>(tagFromUrl);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);

  useEffect(() => {
    setSearchQuery(searchFromUrl);
    setSelectedTag(tagFromUrl);
    setSelectedCategory(categoryFromUrl);
    setPage(1);
  }, [searchFromUrl, tagFromUrl, categoryFromUrl]);

  useEffect(() => {
    const nextLocation = buildPostIndexLocation({ search: searchQuery, tagSlug: selectedTag, categoryId: selectedCategory });
    const currentLocation = queryString ? `/posts${queryString.startsWith("?") ? queryString : `?${queryString}`}` : "/posts";
    if (nextLocation !== currentLocation) {
      navigate(nextLocation, { replace: true });
    }
  }, [navigate, queryString, searchQuery, selectedCategory, selectedTag]);

  const query = searchQuery.trim();
  const { data: postsData, isLoading } = trpc.posts.list.useQuery({ page, limit: 10, tagSlug: selectedTag || undefined, categoryId: selectedCategory ? Number(selectedCategory) : undefined, search: query || undefined });
  const { data: tags } = trpc.tags.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const hasFilters = Boolean(query || selectedTag || selectedCategory);
  const totalPages = Math.max(1, Math.ceil((postsData?.total || 0) / (postsData?.limit || 10)));

  const reset = () => { setSearchQuery(""); setSelectedTag(null); setSelectedCategory(null); setPage(1); };
  const resultCountLabel = hasFilters ? `找到 ${postsData?.total || 0} 篇` : `共 ${postsData?.total || 0} 篇`;

  return (
    <div>
      <section className="grid overflow-hidden rounded-[1.6rem] border border-white/[0.14] bg-[#202630]/78 px-6 py-10 shadow-xl shadow-black/10 sm:px-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-5"><p className="text-sm text-slate-300">文章列表</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">读点真的<br /><span className="display-accent">有用的东西。</span></h1></div>
        <div className="mt-7 max-w-xl lg:col-span-5 lg:col-start-7 lg:mt-2"><p className="copy-lede">这里放着所有公开文章。可以按关键词、标签或分类，找到曾经写下的内容。</p><p className="mt-5 text-sm text-slate-400">目前共有 {postsData?.total || 0} 篇公开文章</p></div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[255px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-white/[0.13] bg-[#202630]/70 p-5 shadow-lg shadow-black/10 lg:sticky lg:top-24">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-100">筛选文章</p>{hasFilters && <button onClick={reset} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-[#bce8eb]"><X size={13} /> 清除</button>}</div>
          <div className="relative mt-5"><Search className="absolute left-3 top-3 text-slate-400" size={15} /><Input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }} placeholder="搜索文章" className="quiet-input h-11 pl-10 text-sm" /></div>
          <div className="mt-7"><p className="text-xs font-medium text-slate-300">标签</p><div className="mt-3 flex flex-wrap gap-2">{tags?.map((tag: any) => <button key={tag.id} onClick={() => { setSelectedTag(selectedTag === tag.slug ? null : tag.slug); setPage(1); }} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${selectedTag === tag.slug ? "border-[#bce8eb] bg-[#bce8eb] text-[#152126]" : "border-white/[0.16] bg-white/[0.035] text-slate-200 hover:border-[#bce8eb]"}`}>#{tag.name}</button>)}</div></div>
          <div className="mt-7 border-t border-white/[0.11] pt-6"><p className="text-xs font-medium text-slate-300">分类</p><div className="mt-3 grid gap-2">{categories?.map((category: any) => <button key={category.id} onClick={() => { const value = String(category.id); setSelectedCategory(selectedCategory === value ? null : value); setPage(1); }} className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${selectedCategory === String(category.id) ? "bg-[#efaa91]/16 text-[#ffd8ce]" : "bg-white/[0.035] text-slate-200 hover:bg-white/[0.08]"}`}>{category.name}</button>)}</div></div>
        </aside>

        <div className="rounded-2xl border border-white/[0.13] bg-[#202630]/58 p-5 shadow-xl shadow-black/10 sm:p-7">
          <div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-100">文章</span><span className="text-sm text-slate-400">{resultCountLabel}</span></div>
          {isLoading ? <div className="space-y-4"><div className="h-40 animate-pulse rounded-2xl bg-white/[0.06]" /><div className="h-40 animate-pulse rounded-2xl bg-white/[0.06]" /></div> : postsData?.data && postsData.data.length > 0 ? <div className="grid gap-4">{postsData.data.map((post: any, index: number) => <button key={post.id} type="button" onClick={() => navigate(`/posts/${post.slug}`)} className="article-card group grid w-full cursor-pointer p-3 text-left sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6 sm:p-4" aria-label={`阅读文章：${post.title}`}><div className="article-cover aspect-[1.45] sm:aspect-[1.32]"><img src={resolveCover(post, index)} alt={post.title} loading="lazy" /></div><div className="mt-4 min-w-0 pr-1 sm:mt-1"><div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-300">{post.category?.name || "随手记"}</span><span className="text-xs text-slate-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "草稿"}</span></div><h2 className="mt-3 text-xl font-medium leading-snug text-white transition-colors group-hover:text-[#bce8eb] sm:text-2xl">{post.title}</h2><p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-300">{post.excerpt || "一篇仍在等待被认真读完的技术记录。"}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3">{post.tags?.slice(0, 3).map((tag: any) => <span key={tag.id} className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-300">#{tag.name}</span>)}<span title={`预计 ${formatReadingTime(post.content || "")}`} className="flex items-center gap-1 text-xs text-slate-300"><Clock3 size={13} /> {formatReadingTime(post.content || "")}</span></div><span className="flex items-center gap-1.5 text-xs text-slate-300"><Eye size={13} /> {post.viewCount || 0} <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" /></span></div></div></button>)}</div> : <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] py-20 text-center"><p className="text-sm font-medium text-slate-200">没有找到匹配的文章</p><p className="mt-3 text-sm text-slate-400">试试换个关键词，或者清除筛选条件。</p>{hasFilters && <button onClick={reset} className="mt-5 text-sm text-[#bce8eb] hover:text-white">清除筛选条件</button>}</div>}
          {postsData?.data && postsData.data.length > 0 && <div className="mt-7 flex items-center justify-between"><Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} variant="ghost" className="text-slate-200 hover:bg-white/[0.08] hover:text-[#bce8eb]"><ChevronLeft size={15} className="mr-1" />上一页</Button><span className="text-xs text-slate-400">第 {page} / {totalPages} 页</span><Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} variant="ghost" className="text-slate-200 hover:bg-white/[0.08] hover:text-[#bce8eb]">下一页<ChevronRight size={15} className="ml-1" /></Button></div>}
        </div>
      </section>
    </div>
  );
}
