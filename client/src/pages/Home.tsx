import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Eye, PenLine } from "lucide-react";

const observatoryCover = "/manus-storage/observatory-night_fc4b375d.jpg";
const deepFieldCover = "/manus-storage/deep-field_cb6500bf.jpg";
const cityCover = "/manus-storage/tokyo-night_3d3a06e3.jpeg";
const sakuraCover = "/manus-storage/anime-sakura_12e0ba1a.jpg";

function coverFor(index: number, post: any) {
  return post?.coverImage || [deepFieldCover, cityCover, observatoryCover, sakuraCover][index % 4];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: posts } = trpc.posts.list.useQuery({ page: 1, limit: 4 });

  return (
    <div className="pb-6">
      <section className="grid border-y border-white/[0.15] lg:grid-cols-12">
        <div className="flex min-h-[620px] flex-col justify-between border-b border-white/[0.15] px-1 py-8 sm:px-4 sm:py-12 lg:col-span-5 lg:border-b-0 lg:border-r lg:px-0 lg:pr-12">
          <div>
            <p className="editorial-kicker">MORROBLOG / FIELD NOTES<br />35.6762°N, 139.6503°E</p>
            <h1 className="display-title mt-14 text-[3.6rem] sm:text-7xl lg:text-[5.35rem]">
              把技术，<br />放回<span className="display-accent">人的夜晚</span>里。
            </h1>
            <p className="copy-lede mt-8 max-w-md">
              一个关于代码、工具、硬件和偏执好奇心的独立技术刊物。它不追赶噪音，只收集那些值得慢慢读完的信号。
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/create")} className="editorial-button editorial-button-primary px-5">
                <PenLine size={14} className="mr-2" /> 写下一篇
              </Button>
            ) : (
              <Button onClick={() => startLogin()} className="editorial-button editorial-button-primary px-5">进入观测站 <ArrowRight size={14} className="ml-2" /></Button>
            )}
            <button onClick={() => navigate("/posts")} className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-[#c6edf0]">
              浏览文章 <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="relative min-h-[500px] lg:col-span-7">
          <div className="image-frame absolute inset-0">
            <img src={observatoryCover} alt="夜空下的天文观测台，MorroBlog 首页主视觉" fetchPriority="high" />
          </div>
          <div className="relative flex h-full min-h-[500px] flex-col justify-between p-6 sm:p-10">
            <div className="flex items-start justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-stone-300">
              <span className="border border-white/25 px-2 py-1">Issue 01</span><span>night shift / 2026</span>
            </div>
            <div className="max-w-sm">
              <p className="issue-label">THE LONG LOOK</p>
              <p className="mt-4 text-2xl leading-relaxed text-stone-100 sm:text-3xl" style={{ fontFamily: '"Noto Serif SC", serif' }}>比起更快地刷过信息，<br />我们更想看清一件事。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid border-b border-white/[0.15] md:grid-cols-3">
        {[
          ["01", "WRITE", "Markdown 为主的写作环境，让思路先于排版。"],
          ["02", "INDEX", "把文章、标签和归档整理成可回看的个人坐标。"],
          ["03", "EXCHANGE", "留下一段能够继续生长的讨论，而不是即时反馈。"],
        ].map(([number, label, copy], index) => (
          <div key={label} className={`px-1 py-8 sm:px-4 lg:px-0 ${index < 2 ? "border-b border-white/[0.15] md:border-b-0 md:border-r md:pr-8" : "md:pl-8"}`}>
            <span className="article-index">{number}</span>
            <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-[#c6edf0]">{label}</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-stone-400">{copy}</p>
          </div>
        ))}
      </section>

      <section className="pt-20 sm:pt-28">
        <div className="flex flex-col gap-5 border-b border-white/[0.15] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="editorial-kicker">SELECTED TRANSMISSIONS / {String(posts?.total || 0).padStart(2, "0")} RECORDS</p><h2 className="display-title mt-4 text-4xl sm:text-5xl">最近的记录</h2></div>
          <button onClick={() => navigate("/posts")} className="group flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-[#c6edf0]">进入完整索引 <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button>
        </div>

        {posts?.data && posts.data.length > 0 ? (
          <div className="mt-7 grid gap-x-10 gap-y-10 lg:grid-cols-12">
            {posts.data.map((post: any, index: number) => (
              <button key={post.id} type="button" onClick={() => navigate(`/posts/${post.slug}`)} className={`article-card w-full cursor-pointer text-left ${index === 0 ? "lg:col-span-7" : "lg:col-span-5"}`} aria-label={`阅读文章：${post.title}`}>
                <div className={`${index === 0 ? "aspect-[1.55]" : "aspect-[2]"} article-cover`}><img src={coverFor(index, post)} alt={post.title} loading="lazy" /></div>
                <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                  <span className="article-index pt-1">{String(index + 1).padStart(2, "0")}</span>
                  <div><div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.12em] text-stone-500"><span>{post.category?.name || "FIELD NOTE"}</span><span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "DRAFT"}</span></div><h3 className={`${index === 0 ? "text-2xl sm:text-3xl" : "text-xl"} mt-3 font-medium leading-snug text-stone-100`}>{post.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-7 text-stone-400">{post.excerpt || "一则来自夜间观测站的技术记录。"}</p><div className="mt-5 flex items-center gap-4 text-xs text-stone-500"><span className="flex items-center gap-1.5"><Eye size={13} /> {post.viewCount || 0}</span><span className="flex items-center gap-1.5"><BookOpen size={13} /> 阅读</span></div></div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center border-b border-white/[0.15] text-center"><div><p className="editorial-kicker">NO TRANSMISSION YET</p><p className="mt-3 text-stone-400">第一篇记录，会从这里开始。</p>{isAuthenticated && <Button onClick={() => navigate("/create")} className="editorial-button mt-6 px-5">创建文章</Button>}</div></div>
        )}
      </section>

      <section className="grid gap-8 border-b border-white/[0.15] py-20 sm:py-28 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4"><p className="editorial-kicker">A PERSONAL ARCHIVE, NOT A FEED</p><h2 className="display-title mt-4 text-4xl">保留那些<br />日后仍想翻看的页。</h2></div>
        <div className="lg:col-span-5"><p className="copy-lede">MorroBlog 不把写作变成冲刺。草稿、标签、归档和图片集，都是为了让一段思考在之后的日子里，仍然能被自己找到。</p></div>
        <div className="lg:col-span-3 lg:text-right"><button onClick={() => navigate("/archives")} className="group inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-[#c6edf0]">翻阅时间轴 <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div>
      </section>
    </div>
  );
}
