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
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, CornerDownRight, Eye, MessageCircle, Pencil, Send, Trash2, UserRound, X } from "lucide-react";
import { formatReadingTime } from "@/lib/readingTime";

const fallbackCover = "/manus-storage/observatory-night_fc4b375d.jpg";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:slug");
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery({ slug: params?.slug || "" }, { enabled: Boolean(params?.slug) });
  const { data: comments, refetch: refetchComments } = trpc.comments.list.useQuery({ postId: post?.id || 0 }, { enabled: Boolean(post?.id) });
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentContent("");
      setReplyContent("");
      setReplyTarget(null);
      void refetchComments();
    },
  });
  const deleteCommentMutation = trpc.comments.delete.useMutation({ onSuccess: () => void refetchComments() });

  if (isLoading) return <div className="grid min-h-[55vh] place-items-center"><p className="text-sm text-slate-300">正在载入文章…</p></div>;
  if (!post) return <div className="grid min-h-[55vh] place-items-center text-center"><div className="rounded-3xl border border-white/[0.14] bg-[#222832]/78 px-7 py-10 shadow-xl shadow-black/10"><p className="text-sm text-slate-300">没有找到这篇文章</p><h1 className="display-title mt-4 text-4xl">它可能已被删除，<br />或链接并不正确。</h1><Button onClick={() => navigate("/posts")} className="editorial-button mt-7 px-5">回到文章列表</Button></div></div>;

  const dateLabel = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "尚未发布";
  const commentCount = comments?.data?.length || 0;
  const canDelete = (comment: any) => user?.id === comment.authorId || user?.role === "admin";
  const canEditPost = user?.id === post.authorId || user?.role === "admin";
  const submitReply = (parentCommentId: number) => {
    if (!replyContent.trim()) return;
    createCommentMutation.mutate({ postId: post.id, content: replyContent, parentCommentId });
  };

  const renderComment = (comment: any, index: string, isReply = false) => (
    <article key={comment.id} className={`${isReply ? "ml-4 border-l border-white/[0.12] pl-4 sm:ml-8 sm:pl-6" : ""} grid gap-3 border-b border-white/[0.12] py-6 sm:grid-cols-[110px_1fr] sm:gap-6`}>
      <div><p className="article-index">{index} / {isReply ? "REPLY" : "NOTE"}</p><p className="mt-2 text-xs text-stone-500">Observer #{comment.authorId}</p><p className="mt-1 text-[10px] text-stone-600">{new Date(comment.createdAt).toLocaleDateString()}</p>{comment.status === "pending" && <span className="mt-3 inline-block border border-[#e39a86]/50 px-1.5 py-1 font-mono text-[9px] tracking-[0.1em] text-[#e39a86]">PENDING REVIEW</span>}</div>
      <div><p className="text-sm leading-7 text-stone-300">{comment.content}</p><div className="mt-4 flex flex-wrap items-center gap-4"><button onClick={() => { setReplyTarget(replyTarget === comment.id ? null : comment.id); setReplyContent(""); }} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#c6edf0]"><CornerDownRight size={13} /> 回复</button>{canDelete(comment) && <button disabled={deleteCommentMutation.isPending} onClick={() => deleteCommentMutation.mutate({ id: comment.id })} className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#e39a86]"><Trash2 size={12} /> 删除</button>}</div>{replyTarget === comment.id && <div className="mt-5 border-l border-[#c6edf0] pl-4"><div className="mb-2 flex items-center justify-between"><p className="editorial-kicker">REPLY TO OBSERVER #{comment.authorId}</p><button onClick={() => setReplyTarget(null)} className="text-stone-600 hover:text-stone-200"><X size={14} /></button></div><textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} placeholder="写下你的回复。" className="quiet-input min-h-20 w-full resize-y p-3 text-sm leading-6 placeholder:text-stone-600" /><div className="mt-3 flex justify-end"><Button disabled={createCommentMutation.isPending || !replyContent.trim()} onClick={() => submitReply(comment.id)} className="editorial-button editorial-button-primary px-3">发送回复</Button></div></div>}{Array.isArray(comment.replies) && comment.replies.map((reply: any, replyIndex: number) => renderComment(reply, `${index}.${replyIndex + 1}`, true))}</div>
    </article>
  );

  return (
    <article className="pb-8">
      <button onClick={() => navigate("/posts")} className="mb-6 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-[#bce8eb]"><ArrowLeft size={15} /> 回到文章列表</button>

      <header className="grid overflow-hidden rounded-[1.6rem] border border-white/[0.14] bg-[#202630]/78 shadow-xl shadow-black/10 lg:grid-cols-12">
        <div className="flex flex-col justify-between px-6 py-9 sm:px-10 sm:py-12 lg:col-span-7 lg:pr-14">
          <div><p className="text-sm text-slate-300">{post.category?.name || "随手记"} · {post.status === "published" ? "已发布" : "草稿"}</p><h1 className="display-title mt-5 text-4xl sm:text-5xl lg:text-6xl">{post.title}</h1>{post.excerpt && <p className="copy-lede mt-7 max-w-2xl">{post.excerpt}</p>}</div>
          <div className="mt-10 flex flex-wrap gap-3 text-xs text-slate-300"><span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-2"><CalendarDays size={14} /> {dateLabel}</span><span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-2" aria-label={`预计 ${formatReadingTime(post.content)}`}><Clock3 size={14} /> {formatReadingTime(post.content)}</span><span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-2"><Eye size={14} /> {post.viewCount || 0} 次阅读</span><span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-2"><MessageCircle size={14} /> {commentCount} 条评论</span></div>
        </div>
        <div className="article-cover min-h-[300px] rounded-none lg:col-span-5"><img src={post.coverImage || fallbackCover} alt={post.title} fetchPriority="high" /></div>
      </header>

      <div className="grid gap-7 pt-7 lg:grid-cols-12 lg:pt-10">
        <aside className="h-fit rounded-2xl border border-white/[0.13] bg-[#202630]/70 p-5 shadow-lg shadow-black/10 lg:sticky lg:top-24 lg:col-span-3"><div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1"><div><p className="text-xs font-medium text-slate-300">作者</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-100"><UserRound size={15} className="text-[#bce8eb]" /> 作者 #{post.authorId}</p>{canEditPost && <Button onClick={() => navigate(`/edit/${post.id}`)} variant="ghost" className="mt-4 h-9 px-2 text-xs text-[#bce8eb] hover:bg-white/[0.08] hover:text-white"><Pencil size={13} className="mr-1.5" />编辑文章</Button>}</div><div><p className="text-xs font-medium text-slate-300">标签</p><div className="mt-3 flex flex-wrap gap-2">{post.tags.length ? post.tags.map((tag) => <button onClick={() => navigate(`/posts?tag=${tag.slug}`)} key={tag.id} className="rounded-full bg-white/[0.07] px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#bce8eb]/14 hover:text-[#bce8eb]">#{tag.name}</button>) : <span className="text-xs text-slate-400">暂未添加标签</span>}</div></div><div><p className="text-xs font-medium text-slate-300">阅读提示</p><p className="mt-2 text-xs leading-6 text-slate-300">正文中的外部链接会在新窗口打开，方便随时回到这里。</p></div></div></aside>
        <section className="min-w-0 rounded-[1.35rem] border border-white/[0.12] bg-[#202630]/62 px-6 py-8 shadow-xl shadow-black/10 sm:px-10 sm:py-11 lg:col-span-8 lg:col-start-5"><div className="prose-cosmic"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ h1: ({ node, ...props }) => <h1 className="mb-6 mt-12 text-3xl" {...props} />, h2: ({ node, ...props }) => <h2 className="mb-5 text-2xl" {...props} />, h3: ({ node, ...props }) => <h3 className="mb-4 mt-9 text-xl" {...props} />, p: ({ node, ...props }) => <p className="mb-7" {...props} />, code: ({ node, inline, children, ...props }: any) => inline ? <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-sm" {...props}>{children}</code> : <code {...props}>{children}</code>, pre: ({ node, ...props }) => <pre className="mb-8 overflow-x-auto p-5 text-sm leading-7" {...props} />, blockquote: ({ node, ...props }) => <blockquote className="mb-8 italic" {...props} />, ul: ({ node, ...props }) => <ul className="mb-7 list-disc space-y-2 pl-6" {...props} />, ol: ({ node, ...props }) => <ol className="mb-7 list-decimal space-y-2 pl-6" {...props} />, table: ({ node, ...props }) => <div className="mb-8 overflow-x-auto"><table className="w-full border-collapse text-sm" {...props} /></div>, th: ({ node, ...props }) => <th className="border border-white/15 bg-white/[0.04] p-3 text-left font-sans text-[#bce8eb]" {...props} />, td: ({ node, ...props }) => <td className="border border-white/10 p-3" {...props} />, a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />, img: ({ node, ...props }) => <img className="my-9 w-full rounded-xl border border-white/10" loading="lazy" {...props} /> }}>{post.content}</ReactMarkdown></div><div className="mt-12 flex justify-end border-t border-white/[0.12] pt-5"><button onClick={() => navigate("/posts")} className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-[#bce8eb]">回到文章列表 <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button></div></section>
      </div>

      <section className="mx-auto mt-14 max-w-4xl rounded-[1.5rem] border border-white/[0.13] bg-[#202630]/64 p-6 shadow-xl shadow-black/10 sm:mt-20 sm:p-9"><div className="flex items-end justify-between"><div><p className="text-sm text-slate-300">评论</p><h2 className="display-title mt-3 text-3xl">一起聊聊。</h2></div><span className="text-sm text-slate-300">{commentCount} 条评论</span></div>{isAuthenticated ? <div className="mt-8 rounded-2xl border border-white/[0.12] bg-white/[0.04] p-4"><textarea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="说说你的想法。新评论审核通过后会公开显示。" className="quiet-input min-h-28 w-full resize-y p-4 text-sm leading-6" /><div className="mt-3 flex items-center justify-between gap-4"><p className="text-xs text-slate-300">待审核的评论仅你自己可见。</p><Button disabled={createCommentMutation.isPending || !commentContent.trim()} onClick={() => createCommentMutation.mutate({ postId: post.id, content: commentContent })} className="editorial-button editorial-button-primary shrink-0 px-4">{createCommentMutation.isPending ? "发布中…" : <><Send size={13} className="mr-1.5" /> 发布评论</>}</Button></div></div> : <div className="mt-8 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-5 py-8 text-center"><p className="text-sm text-slate-200">登录后，可以参与讨论。</p><button onClick={() => navigate("/")} className="mt-3 text-sm text-[#bce8eb] hover:text-white">回到首页登录</button></div>}{createCommentMutation.error && <p className="mt-4 rounded-xl border border-[#efaa91]/40 bg-[#efaa91]/10 px-4 py-3 text-sm text-[#ffd1c4]">{createCommentMutation.error.message}</p>}{deleteCommentMutation.error && <p className="mt-4 rounded-xl border border-[#efaa91]/40 bg-[#efaa91]/10 px-4 py-3 text-sm text-[#ffd1c4]">{deleteCommentMutation.error.message}</p>}<div className="mt-5">{comments?.data?.length ? comments.data.map((comment: any, index: number) => renderComment(comment, String(index + 1).padStart(2, "0"))) : <div className="rounded-2xl border border-dashed border-white/[0.16] px-5 py-12 text-center"><p className="text-sm font-medium text-slate-200">还没有评论</p><p className="mt-3 text-sm text-slate-400">第一条评论，会从这里开始。</p></div>}</div></section>
    </article>
  );
}
