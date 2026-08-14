import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowUpRight, CalendarDays, Eye, MessageCircle, Send, UserRound } from "lucide-react";

const fallbackCover = "/manus-storage/observatory-night_fc4b375d.jpg";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:slug");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");

  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery({ slug: params?.slug || "" }, { enabled: Boolean(params?.slug) });
  const { data: comments, refetch: refetchComments } = trpc.comments.list.useQuery({ postId: post?.id || 0 }, { enabled: Boolean(post?.id) });
  const createCommentMutation = trpc.comments.create.useMutation({ onSuccess: () => { setCommentContent(""); void refetchComments(); } });

  if (isLoading) return <div className="grid min-h-[55vh] place-items-center"><p className="editorial-kicker">LOADING TRANSMISSION…</p></div>;
  if (!post) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">SIGNAL NOT FOUND</p><h1 className="display-title mt-4 text-4xl">这篇记录不在当前轨道。</h1><Button onClick={() => navigate("/posts")} className="editorial-button mt-7 px-5">返回索引</Button></div></div>;

  const dateLabel = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "尚未发布";
  const commentCount = comments?.data?.length || 0;

  return (
    <article className="pb-8">
      <button onClick={() => navigate("/posts")} className="mb-8 flex items-center gap-2 text-xs text-stone-500 transition-colors hover:text-[#c6edf0]"><ArrowLeft size={14} /> 返回文章索引</button>

      <header className="grid border-y border-white/[0.15] lg:grid-cols-12">
        <div className="flex flex-col justify-between px-1 py-10 sm:px-4 sm:py-14 lg:col-span-7 lg:px-0 lg:pr-14">
          <div><p className="editorial-kicker">{post.category?.name || "FIELD NOTE"} / {post.status.toUpperCase()}</p><h1 className="display-title mt-6 text-4xl sm:text-5xl lg:text-6xl">{post.title}</h1>{post.excerpt && <p className="copy-lede mt-7 max-w-2xl">{post.excerpt}</p>}</div>
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.12] pt-4 font-mono text-[10px] tracking-[0.1em] text-stone-500"><span className="flex items-center gap-1.5"><CalendarDays size={13} /> {dateLabel}</span><span className="flex items-center gap-1.5"><Eye size={13} /> {post.viewCount || 0} VIEWS</span><span className="flex items-center gap-1.5"><MessageCircle size={13} /> {commentCount} COMMENTS</span></div>
        </div>
        <div className="article-cover min-h-[300px] lg:col-span-5"><img src={post.coverImage || fallbackCover} alt={post.title} fetchPriority="high" /></div>
      </header>

      <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:pt-14">
        <aside className="border-b border-white/[0.12] pb-6 lg:col-span-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1"><div><p className="editorial-kicker">AUTHOR</p><p className="mt-2 flex items-center gap-2 text-sm text-stone-300"><UserRound size={14} className="text-[#c6edf0]" /> Observer #{post.authorId}</p></div><div><p className="editorial-kicker">TAGS</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">{post.tags.length ? post.tags.map((tag) => <button onClick={() => navigate(`/posts?tag=${tag.slug}`)} key={tag.id} className="text-xs text-stone-500 hover:text-[#c6edf0]">#{tag.name}</button>) : <span className="text-xs text-stone-600">—</span>}</div></div><div><p className="editorial-kicker">READING NOTE</p><p className="mt-2 text-xs leading-6 text-stone-500">建议在安静的时间读完。正文内的链接均会在新窗口中打开。</p></div></div>
        </aside>

        <section className="min-w-0 lg:col-span-7 lg:col-start-5">
          <div className="prose-cosmic">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => <h1 className="mb-6 mt-12 text-3xl" {...props} />,
                h2: ({ node, ...props }) => <h2 className="mb-5 text-2xl" {...props} />,
                h3: ({ node, ...props }) => <h3 className="mb-4 mt-9 text-xl" {...props} />,
                p: ({ node, ...props }) => <p className="mb-7" {...props} />,
                code: ({ node, inline, children, ...props }: any) => inline ? <code className="bg-white/[0.06] px-1.5 py-0.5 text-sm" {...props}>{children}</code> : <code {...props}>{children}</code>,
                pre: ({ node, ...props }) => <pre className="mb-8 overflow-x-auto p-5 text-sm leading-7" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="mb-8 italic" {...props} />,
                ul: ({ node, ...props }) => <ul className="mb-7 list-disc space-y-2 pl-6" {...props} />,
                ol: ({ node, ...props }) => <ol className="mb-7 list-decimal space-y-2 pl-6" {...props} />,
                table: ({ node, ...props }) => <div className="mb-8 overflow-x-auto"><table className="w-full border-collapse text-sm" {...props} /></div>,
                th: ({ node, ...props }) => <th className="border border-white/15 bg-white/[0.04] p-3 text-left font-sans text-[#c6edf0]" {...props} />,
                td: ({ node, ...props }) => <td className="border border-white/10 p-3" {...props} />,
                a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />,
                img: ({ node, ...props }) => <img className="my-9 w-full border border-white/10" loading="lazy" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
          <div className="mt-12 flex justify-end border-t border-white/[0.12] pt-5"><button onClick={() => navigate("/posts")} className="group flex items-center gap-2 text-sm text-stone-500 hover:text-[#c6edf0]">回到索引 <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button></div>
        </section>
      </div>

      <section className="mx-auto mt-20 max-w-4xl border-t border-white/[0.15] pt-8 sm:mt-28">
        <div className="flex items-end justify-between"><div><p className="editorial-kicker">RESPONSE LOG</p><h2 className="display-title mt-3 text-3xl">讨论与回声</h2></div><span className="article-index">{String(commentCount).padStart(2, "0")} NOTES</span></div>
        {isAuthenticated ? <div className="mt-8 border-y border-white/[0.12] py-5"><textarea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="留下你的想法。" className="quiet-input min-h-28 w-full resize-y p-4 text-sm leading-6 placeholder:text-stone-600" /><div className="mt-3 flex justify-end"><Button disabled={createCommentMutation.isPending || !commentContent.trim()} onClick={() => post.id && createCommentMutation.mutate({ postId: post.id, content: commentContent })} className="editorial-button editorial-button-primary px-4">{createCommentMutation.isPending ? "发送中" : <><Send size={13} className="mr-1.5" /> 发布回应</>}</Button></div></div> : <div className="mt-8 border-y border-white/[0.12] py-8 text-center"><p className="text-sm text-stone-500">登录后，可以为这篇文章留下回应。</p><button onClick={() => navigate("/")} className="mt-3 text-sm text-[#c6edf0]">回到首页登录</button></div>}
        <div>{comments?.data?.length ? comments.data.map((comment: any, index: number) => <article key={comment.id} className="grid gap-3 border-b border-white/[0.12] py-6 sm:grid-cols-[110px_1fr] sm:gap-6"><div><p className="article-index">{String(index + 1).padStart(2, "0")} / NOTE</p><p className="mt-2 text-xs text-stone-500">Observer #{comment.authorId}</p><p className="mt-1 text-[10px] text-stone-600">{new Date(comment.createdAt).toLocaleDateString()}</p></div><p className="text-sm leading-7 text-stone-300">{comment.content}</p></article>) : <div className="border-b border-white/[0.12] py-12 text-center"><p className="editorial-kicker">NO RESPONSE YET</p><p className="mt-3 text-sm text-stone-500">第一段回应，将从这里开始。</p></div>}</div>
      </section>
    </article>
  );
}
