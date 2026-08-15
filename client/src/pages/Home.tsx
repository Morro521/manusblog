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
      <section className="grid overflow-hidden rounded-[1.75rem] border border-white/[0.16] bg-[#20252e]/78 shadow-[0_22px_50px_rgba(5,8,13,0.18)] lg:grid-cols-12">
        <div className="flex min-h-[560px] flex-col justify-between border-b border-white/[0.12] px-6 py-9 sm:px-10 sm:py-12 lg:col-span-5 lg:border-b-0 lg:border-r lg:px-12">
          <div>
            <p className="editorial-kicker">MorroBlog · 个人技术笔记<br />代码、工具与硬件的真实使用记录</p>
            <h1 className="display-title mt-12 text-[3.45rem] sm:text-7xl lg:text-[5.1rem]">
              写给还在<br /><span className="display-accent">认真折腾</span>的人。
            </h1>
            <p className="copy-lede mt-8 max-w-md">
              记录软件、工具和硬件使用中的问题、判断与偶然发现。希望每一篇，都值得你停下来读完。
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/create")} className="editorial-button editorial-button-primary px-5">
                <PenLine size={14} className="mr-2" /> 写下一篇
              </Button>
            ) : (
              <Button onClick={() => startLogin()} className="editorial-button editorial-button-primary px-5">登录后开始写作 <ArrowRight size={14} className="ml-2" /></Button>
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
            <div className="flex items-start justify-between text-[10px] font-mono tracking-[0.1em] text-slate-200">
              <span className="rounded-full border border-white/30 bg-black/15 px-3 py-1.5">慢读一点</span><span>2026</span>
            </div>
            <div className="max-w-sm">
              <p className="issue-label">不必追赶每一条消息</p>
              <p className="mt-4 text-2xl leading-relaxed text-white sm:text-3xl" style={{ fontFamily: '"Noto Serif SC", serif' }}>比起刷得更快，<br />更想把一件事弄明白。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["01", "写作", "先把想法写清楚，再慢慢打磨它的样子。"],
          ["02", "整理", "文章、标签和归档都放在容易回看的地方。"],
          ["03", "交流", "把有用的讨论留住，而不是只追求即时回应。"],
        ].map(([number, label, copy], index) => (
          <div key={label} className="rounded-2xl border border-white/[0.13] bg-[#222832]/72 p-6 shadow-[0_10px_24px_rgba(7,10,15,0.1)] sm:p-7">
            <span className="article-index">{number}</span>
            <p className="mt-4 text-sm font-medium text-[#bce8eb]">{label}</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-slate-300">{copy}</p>
          </div>
        ))}
      </section>

      <section className="pt-20 sm:pt-28">
        <div className="flex flex-col gap-5 border-b border-white/[0.15] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="editorial-kicker">最近更新 · {String(posts?.total || 0).padStart(2, "0")} 篇文章</p><h2 className="display-title mt-4 text-4xl sm:text-5xl">最近写下的内容</h2></div>
          <button onClick={() => navigate("/posts")} className="group flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-[#bce8eb]">查看全部文章 <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button>
        </div>

        {posts?.data && posts.data.length > 0 ? (
          <div className="mt-7 grid gap-x-10 gap-y-10 lg:grid-cols-12">
            {posts.data.map((post: any, index: number) => (
              <button key={post.id} type="button" onClick={() => navigate(`/posts/${post.slug}`)} className={`article-card w-full cursor-pointer text-left ${index === 0 ? "lg:col-span-7" : "lg:col-span-5"}`} aria-label={`阅读文章：${post.title}`}>
                <div className={`${index === 0 ? "aspect-[1.55]" : "aspect-[2]"} article-cover`}><img src={coverFor(index, post)} alt={post.title} loading="lazy" /></div>
                <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                  <span className="article-index pt-1">{String(index + 1).padStart(2, "0")}</span>
                  <div><div className="flex items-center justify-between gap-4 text-xs text-slate-400"><span>{post.category?.name || "随手记"}</span><span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "草稿"}</span></div><h3 className={`${index === 0 ? "text-2xl sm:text-3xl" : "text-xl"} mt-3 font-medium leading-snug text-white`}>{post.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-300">{post.excerpt || "一篇仍在等待被认真读完的技术记录。"}</p><div className="mt-5 flex items-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-1.5"><Eye size={13} /> {post.viewCount || 0}</span><span className="flex items-center gap-1.5"><BookOpen size={13} /> 阅读全文</span></div></div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-white/[0.14] bg-[#222832]/72 text-center"><div><p className="editorial-kicker">还没有公开文章</p><p className="mt-3 text-slate-300">第一篇文章，会从这里开始。</p>{isAuthenticated && <Button onClick={() => navigate("/create")} className="editorial-button mt-6 px-5">写一篇文章</Button>}</div></div>
        )}
      </section>

      <section className="mt-8 grid gap-8 rounded-[1.5rem] border border-white/[0.14] bg-[#222832]/66 px-6 py-12 sm:mt-12 sm:px-10 sm:py-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4"><p className="editorial-kicker">留住之后还会用到的经验</p><h2 className="display-title mt-4 text-4xl">把当时的判断，<br />留给以后的自己。</h2></div>
        <div className="lg:col-span-5"><p className="copy-lede">草稿、标签、归档和图片集不是为了显得完整，而是让一段有价值的思考，在需要的时候能被重新找到。</p></div>
        <div className="lg:col-span-3 lg:text-right"><button onClick={() => navigate("/archives")} className="group inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-[#bce8eb]">翻阅归档 <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div>
      </section>
    </div>
  );
}
