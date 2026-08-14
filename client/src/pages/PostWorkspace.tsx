import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Pencil, Plus } from "lucide-react";

function formatDate(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : "未发布";
}

export default function PostWorkspace() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.posts.myPosts.useQuery({ page: 1, limit: 100 }, { enabled: isAuthenticated });
  const posts = data?.data || [];
  const drafts = posts.filter((post: any) => post.status === "draft");
  const published = posts.filter((post: any) => post.status === "published");

  if (!isAuthenticated) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">AUTHORIZATION REQUIRED</p><h1 className="display-title mt-4 text-4xl">先进入观测站，<br />再管理你的记录。</h1><Button onClick={() => navigate("/")} className="editorial-button mt-7 px-5">返回首页</Button></div></div>;

  const renderPosts = (entries: any[], mode: "draft" | "published") => entries.length ? <div>{entries.map((post: any, index: number) => <article key={post.id} className="grid gap-4 border-t border-white/[0.12] py-5 first:border-t-0 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center"><span className="article-index">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="font-mono text-[10px] tracking-[0.1em] text-stone-600">{mode === "draft" ? "DRAFT / NOT PUBLIC" : `PUBLISHED / ${formatDate(post.publishedAt)}`}</p><h2 className="mt-2 truncate text-xl text-stone-200">{post.title}</h2><p className="mt-2 line-clamp-1 text-sm text-stone-500">{post.excerpt || (mode === "draft" ? "尚未添加摘要。" : "已发布记录。")}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => navigate(`/edit/${post.id}`)} variant="ghost" className="h-8 px-2 text-xs text-[#c6edf0] hover:bg-transparent hover:text-stone-100"><Pencil size={13} className="mr-1" />继续编辑</Button>{mode === "published" && <Button onClick={() => navigate(`/posts/${post.slug}`)} variant="ghost" className="h-8 px-2 text-xs text-stone-500 hover:bg-transparent hover:text-[#c6edf0]">阅读<ArrowUpRight size={13} className="ml-1" /></Button>}</div></article>)}</div> : <div className="border-t border-white/[0.12] py-10 text-center"><p className="text-sm text-stone-600">{mode === "draft" ? "没有待续写的草稿。" : "还没有发布的记录。"}</p></div>;

  return <div className="pb-10"><section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="editorial-kicker">AUTHOR WORKSPACE / PRIVATE INDEX</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">把未完成的，<br /><span className="display-accent">留在手边。</span></h1></div><div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">草稿不会出现在公开索引。你可以在这里继续写作，或回看已发布的记录。</p><Button onClick={() => navigate("/create")} className="editorial-button editorial-button-primary mt-6 px-4"><Plus size={14} className="mr-1.5" />新建记录</Button></div></section>{isLoading ? <div className="py-24"><p className="editorial-kicker">OPENING YOUR INDEX…</p></div> : <div className="mt-10 grid gap-12 lg:grid-cols-12"><section className="lg:col-span-7"><div className="flex items-end justify-between border-b border-white/[0.12] pb-4"><div><p className="editorial-kicker">DRAFT SHELF</p><h2 className="mt-2 text-2xl text-stone-200">待续写</h2></div><span className="article-index">{String(drafts.length).padStart(2, "0")}</span></div>{renderPosts(drafts, "draft")}</section><section className="lg:col-span-5"><div className="flex items-end justify-between border-b border-white/[0.12] pb-4"><div><p className="editorial-kicker">PUBLISHED INDEX</p><h2 className="mt-2 text-2xl text-stone-200">已发布</h2></div><span className="article-index">{String(published.length).padStart(2, "0")}</span></div>{renderPosts(published, "published")}</section></div>}<div className="mt-12 border-t border-white/[0.12] pt-5"><button onClick={() => navigate("/posts")} className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#c6edf0]"><FileText size={14} />进入公开文章索引</button></div></div>;
}
