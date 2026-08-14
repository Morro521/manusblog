import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Check, ChevronLeft, Image as ImageIcon, Send } from "lucide-react";

export default function CreatePost() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);

  const { data: tags } = trpc.tags.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const createMutation = trpc.posts.create.useMutation({ onSuccess: () => navigate("/posts") });

  const submit = (status: "draft" | "published") => {
    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      categoryId,
      tagIds,
      status,
    });
  };

  const toggleTag = (id: number) => setTagIds((current) => current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]);

  if (!isAuthenticated) {
    return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">AUTHORIZATION REQUIRED</p><h1 className="display-title mt-4 text-4xl">先进入观测站，<br />再写下一条记录。</h1><Button onClick={() => navigate("/")} className="editorial-button mt-7 px-5">返回首页</Button></div></div>;
  }

  return (
    <div className="pb-10">
      <button onClick={() => navigate("/posts")} className="mb-8 flex items-center gap-2 text-xs text-stone-500 hover:text-[#c6edf0]"><ChevronLeft size={14} /> 返回文章索引</button>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-7"><p className="editorial-kicker">NEW TRANSMISSION / DRAFTING DESK</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">写下一个<br /><span className="display-accent">值得存档的想法。</span></h1></div>
        <div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">文章可以先保存为草稿。标题、摘要、封面、分类与标签都会成为这条记录在未来的索引线索。</p></div>
      </section>

      <section className="grid gap-10 pt-10 lg:grid-cols-12 lg:pt-14">
        <aside className="order-2 border-t border-white/[0.12] pt-7 lg:order-1 lg:col-span-3 lg:border-r lg:border-t-0 lg:pr-8 lg:pt-0">
          <div><p className="editorial-kicker">CLASSIFICATION</p><label className="mt-4 block text-xs text-stone-400">分类</label><select value={categoryId ?? ""} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="quiet-input mt-2 h-10 w-full px-3 text-sm"><option value="">未分类</option>{categories?.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div className="mt-8"><p className="editorial-kicker">KEYWORDS</p><p className="mt-2 text-xs leading-5 text-stone-600">选择与这篇文章真正有关的标签。</p><div className="mt-4 flex flex-wrap gap-2">{tags?.length ? tags.map((tag: any) => <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`border px-2.5 py-1.5 text-xs transition-colors ${tagIds.includes(tag.id) ? "border-[#c6edf0] bg-[#c6edf0] text-[#10110f]" : "border-white/15 text-stone-500 hover:border-stone-500 hover:text-stone-200"}`}>{tagIds.includes(tag.id) && <Check size={12} className="mr-1 inline" />}#{tag.name}</button>) : <p className="text-xs text-stone-600">尚未创建标签，可在管理后台添加。</p>}</div></div>
          <div className="mt-8 border-t border-white/[0.12] pt-5"><p className="editorial-kicker">COVER URL</p><label className="mt-3 block text-xs leading-5 text-stone-600">粘贴已上传到 S3 或可公开访问的封面 URL。</label><div className="relative mt-3"><ImageIcon size={14} className="absolute left-0 top-3 text-stone-600" /><Input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} placeholder="https://…" className="quiet-input h-10 border-x-0 border-t-0 pl-6 text-sm placeholder:text-stone-700" /></div></div>
        </aside>

        <div className="order-1 min-w-0 lg:order-2 lg:col-span-8 lg:col-start-5">
          <div className="grid gap-6"><div><label className="editorial-kicker">TITLE</label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这条记录一个清楚的标题" className="quiet-input mt-3 h-14 border-x-0 border-t-0 px-0 text-2xl placeholder:text-stone-700 focus-visible:ring-0" /></div><div><label className="editorial-kicker">PERMALINK</label><Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="e.g. observing-a-small-problem" className="quiet-input mt-3 h-11 border-x-0 border-t-0 px-0 font-mono text-xs tracking-[0.05em] placeholder:text-stone-700 focus-visible:ring-0" /></div><div><label className="editorial-kicker">ABSTRACT</label><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="用一两句话解释它为什么值得读。" className="quiet-input mt-3 min-h-24 w-full resize-y p-3 text-sm leading-7 placeholder:text-stone-700" /></div><div><label className="editorial-kicker">MANUSCRIPT</label><div className="mt-3"><MarkdownEditor value={content} onChange={setContent} placeholder="从这里开始写。支持 Markdown。" /></div></div></div>
          {createMutation.error && <p className="mt-5 border-l border-[#e39a86] pl-3 text-sm text-[#e39a86]">{createMutation.error.message}</p>}
          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/[0.12] pt-5 sm:flex-row sm:items-center"><p className="text-xs text-stone-600">发布后将立即进入公开索引；草稿仅保存在你的工作台。</p><div className="flex gap-3"><Button disabled={createMutation.isPending || !title.trim() || !slug.trim() || !content.trim()} onClick={() => submit("draft")} variant="ghost" className="editorial-button px-4 text-stone-300 hover:bg-transparent">保存草稿</Button><Button disabled={createMutation.isPending || !title.trim() || !slug.trim() || !content.trim()} onClick={() => submit("published")} className="editorial-button editorial-button-primary px-4">{createMutation.isPending ? "发送中…" : <><Send size={13} className="mr-1.5" /> 发布记录</>}</Button></div></div>
        </div>
      </section>
    </div>
  );
}
