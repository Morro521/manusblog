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
  const resultCountLabel = hasFilters ? `${postsData?.total || 0} MATCHED` : `${postsData?.total || 0} TOTAL`;

  return (
    <div>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-4"><p className="editorial-kicker">ARCHIVE INDEX / VOL. 01</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">阅读，<br /><span className="display-accent">不是滚动。</span></h1></div>
        <div className="mt-7 max-w-xl lg:col-span-6 lg:col-start-7 lg:mt-1"><p className="copy-lede">这里是所有公开记录的索引。你可以按关键词、主题或分类找到一条过去的信号。</p><p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-stone-500">{String(postsData?.total || 0).padStart(3, "0")} ENTRIES AVAILABLE</p></div>
      </section>

      <section className="grid lg:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.15] py-7 lg:min-h-[640px] lg:border-b-0 lg:border-r lg:pr-8">
          <div className="flex items-center justify-between"><p className="editorial-kicker">FILTERS</p>{hasFilters && <button onClick={reset} className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-[#c6edf0]"><X size={12} /> RESET</button>}</div>
          <div className="mt-5 relative"><Search className="absolute left-0 top-3 text-stone-600" size={15} /><Input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }} placeholder="搜索索引" className="quiet-input h-10 border-x-0 border-t-0 pl-6 text-sm placeholder:text-stone-600" /></div>
          <div className="mt-9"><p className="editorial-kicker">BY TAG</p><div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">{tags?.map((tag: any) => <button key={tag.id} onClick={() => { setSelectedTag(selectedTag === tag.slug ? null : tag.slug); setPage(1); }} className={`text-xs transition-colors ${selectedTag === tag.slug ? "text-[#c6edf0]" : "text-stone-500 hover:text-stone-200"}`}>#{tag.name}</button>)}</div></div>
          <div className="mt-9"><p className="editorial-kicker">BY CATEGORY</p><div className="mt-3 grid gap-2">{categories?.map((category: any) => <button key={category.id} onClick={() => { const value = String(category.id); setSelectedCategory(selectedCategory === value ? null : value); setPage(1); }} className={`border-l pl-3 text-left text-xs transition-colors ${selectedCategory === String(category.id) ? "border-[#e39a86] text-stone-100" : "border-white/15 text-stone-500 hover:border-stone-500 hover:text-stone-200"}`}>{category.name}</button>)}</div></div>
        </aside>

        <div className="py-7 lg:pl-10 lg:pt-8">
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.12] pb-3"><span className="editorial-kicker">TRANSMISSIONS</span><span className="article-index">{resultCountLabel}</span></div>
          {isLoading ? <div className="space-y-0"><div className="h-40 animate-pulse border-b border-white/10 bg-white/[0.02]" /><div className="h-40 animate-pulse border-b border-white/10 bg-white/[0.02]" /></div> : postsData?.data && postsData.data.length > 0 ? <div>{postsData.data.map((post: any, index: number) => <button key={post.id} type="button" onClick={() => navigate(`/posts/${post.slug}`)} className="group grid w-full cursor-pointer border-b border-white/[0.12] py-5 text-left sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 sm:py-6" aria-label={`阅读文章：${post.title}`}><div className="article-cover aspect-[1.45] sm:aspect-[1.32]"><img src={resolveCover(post, index)} alt={post.title} loading="lazy" /></div><div className="mt-4 min-w-0 sm:mt-0"><div className="flex items-center justify-between gap-4"><span className="article-index">{String((page - 1) * 10 + index + 1).padStart(2, "0")} / {post.category?.name || "FIELD NOTE"}</span><span className="font-mono text-[10px] tracking-[0.1em] text-stone-600">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "DRAFT"}</span></div><h2 className="mt-3 text-xl font-medium leading-snug text-stone-100 transition-colors group-hover:text-[#c6edf0] sm:text-2xl">{post.title}</h2><p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-stone-400">{post.excerpt || "一条仍在等待被完整阅读的技术记录。"}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3">{post.tags?.slice(0, 3).map((tag: any) => <span key={tag.id} className="font-mono text-[10px] tracking-[0.08em] text-stone-600">#{tag.name}</span>)}<span title={`预计 ${formatReadingTime(post.content || "")}`} className="flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-stone-600"><Clock3 size={12} /> {formatReadingTime(post.content || "")}</span></div><span className="flex items-center gap-1.5 text-xs text-stone-500"><Eye size={13} /> {post.viewCount || 0} <ArrowRight size={13} className="ml-2 transition-transform group-hover:translate-x-1" /></span></div></div></button>)}</div> : <div className="border-b border-white/[0.12] py-24 text-center"><p className="editorial-kicker">NO MATCHING SIGNAL</p><p className="mt-3 text-sm text-stone-500">没有找到匹配的记录。</p>{hasFilters && <button onClick={reset} className="mt-5 text-sm text-[#c6edf0]">清除筛选条件</button>}</div>}
          {postsData?.data && postsData.data.length > 0 && <div className="mt-8 flex items-center justify-between"><Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} variant="ghost" className="text-stone-400 hover:bg-transparent hover:text-[#c6edf0]"><ChevronLeft size={15} className="mr-1" />PREV</Button><span className="article-index">PAGE {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}</span><Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} variant="ghost" className="text-stone-400 hover:bg-transparent hover:text-[#c6edf0]">NEXT<ChevronRight size={15} className="ml-1" /></Button></div>}
        </div>
      </section>
    </div>
  );
}
