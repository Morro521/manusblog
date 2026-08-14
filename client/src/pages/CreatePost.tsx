import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import MarkdownEditor from "@/components/MarkdownEditor";
import ImageUpload from "@/components/ImageUpload";
import { Check, ChevronLeft, FileText, Send, Settings2, X } from "lucide-react";

const toSlug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");

export default function CreatePost() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, editParams] = useRoute("/edit/:id");
  const editId = Number(editParams?.id || 0);
  const isEditing = editId > 0;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadedEditId, setLoadedEditId] = useState<number | null>(null);

  const { data: tags } = trpc.tags.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: editablePost, isLoading: isEditLoading, error: editError } = trpc.posts.getForEdit.useQuery({ id: editId }, { enabled: isEditing });
  const createMutation = trpc.posts.create.useMutation({ onSuccess: () => navigate("/posts") });
  const updateMutation = trpc.posts.update.useMutation({ onSuccess: () => navigate(`/posts/${slug}`) });
  useEffect(() => {
    if (!editablePost || loadedEditId === editablePost.id) return;
    setTitle(editablePost.title);
    setSlug(editablePost.slug);
    setSlugLocked(true);
    setExcerpt(editablePost.excerpt || "");
    setCoverImage(editablePost.coverImage || "");
    setContent(editablePost.content);
    setCategoryId(editablePost.categoryId || undefined);
    setTagIds(editablePost.tags.map((tag: any) => tag.id));
    setLoadedEditId(editablePost.id);
  }, [editablePost, loadedEditId]);
  const dirty = Boolean(title || content || excerpt || coverImage || slug);
  const canSubmit = Boolean(title.trim() && slug.trim() && content.trim());
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const changeTitle = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!slugLocked) setSlug(toSlug(nextTitle));
  };
  const toggleTag = (id: number) => setTagIds((current) => current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]);
  const publish = () => {
    if (isEditing) {
      updateMutation.mutate({ id: editId, title: title.trim(), slug: slug.trim(), content, excerpt: excerpt.trim() || null, coverImage: coverImage.trim() || null, categoryId: categoryId ?? null, tagIds, status: "published" });
      return;
    }
    createMutation.mutate({ title: title.trim(), slug: slug.trim(), content, excerpt: excerpt.trim() || undefined, coverImage: coverImage.trim() || undefined, categoryId, tagIds, status: "published" });
  };

  if (!isAuthenticated) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">AUTHORIZATION REQUIRED</p><h1 className="display-title mt-4 text-4xl">先进入观测站，<br />再写下一条记录。</h1><Button onClick={() => navigate("/")} className="editorial-button mt-7 px-5">返回首页</Button></div></div>;
  if (isEditing && isEditLoading) return <div className="grid min-h-[55vh] place-items-center"><p className="editorial-kicker">OPENING ENTRY…</p></div>;
  if (isEditing && editError) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">ENTRY UNAVAILABLE</p><h1 className="display-title mt-4 text-4xl">这篇记录无法编辑。</h1><p className="mt-4 text-sm text-stone-600">{editError.message}</p><Button onClick={() => navigate("/posts")} className="editorial-button mt-7 px-5">返回文章索引</Button></div></div>;

  return <div className="pb-16"><header className="sticky top-0 z-30 -mx-4 border-b border-white/[0.12] bg-[#10110f]/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><button onClick={() => navigate("/posts")} className="grid h-8 w-8 shrink-0 place-items-center border border-white/[0.12] text-stone-500 hover:border-[#c6edf0] hover:text-[#c6edf0]" aria-label="返回文章索引"><ChevronLeft size={15} /></button><div className="min-w-0"><p className="truncate font-mono text-[10px] tracking-[0.1em] text-stone-400">{title || (isEditing ? "EDITING ENTRY" : "UNTITLED ENTRY")}</p><p className={`mt-0.5 font-mono text-[9px] tracking-[0.08em] ${dirty ? "text-[#e2b27c]" : "text-stone-600"}`}>{isEditing ? "EDITING" : dirty ? "UNPUBLISHED" : "READY"} · {wordCount} WORDS</p></div></div><div className="flex items-center gap-2"><Button type="button" onClick={() => setSettingsOpen(true)} variant="ghost" className="h-8 gap-1.5 px-2 text-xs text-stone-400 hover:bg-white/[0.04] hover:text-[#c6edf0]"><Settings2 size={14} /><span className="hidden sm:inline">文档设置</span></Button><Button disabled={isSubmitting || !canSubmit} onClick={publish} className="editorial-button editorial-button-primary h-8 px-3 text-xs">{isSubmitting ? "处理中…" : <><Send size={13} className="mr-1.5" />{isEditing ? "更新" : "发布"}</>}</Button></div></div></header>

    <main className="mx-auto max-w-[820px] pt-12 sm:pt-16"><div className="border-b border-white/[0.12] pb-7"><p className="editorial-kicker">{isEditing ? "EDIT TRANSMISSION / ENTRY" : "NEW TRANSMISSION / ENTRY 01"}</p><Input value={title} onChange={(event) => changeTitle(event.target.value)} placeholder="无标题记录" className="mt-4 h-auto border-0 bg-transparent px-0 py-0 font-serif text-4xl leading-tight text-stone-100 placeholder:text-stone-700 focus-visible:ring-0 sm:text-6xl" /><p className="mt-4 text-sm leading-7 text-stone-600">先写下你真正想说的内容。分类、封面、摘要和链接都在右上角的文档设置中。</p></div><section className="pt-2"><MarkdownEditor value={content} onChange={setContent} placeholder="从这里开始。先把真正的问题放在页面上。" /></section>{(createMutation.error || updateMutation.error) && <p className="mt-5 border-l border-[#e39a86] pl-3 text-sm text-[#e39a86]">{createMutation.error?.message || updateMutation.error?.message}</p>}<footer className="mt-8 flex flex-col justify-between gap-4 border-y border-white/[0.12] py-4 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-stone-600">{isEditing ? "更新后会立即回到这篇公开记录。" : "填写完成后发布，文章会出现在公开文章索引。"}</p><div className="flex sm:hidden"><Button disabled={isSubmitting || !canSubmit} onClick={publish} className="editorial-button editorial-button-primary px-3 text-xs"><Send size={13} className="mr-1" />{isEditing ? "更新记录" : "发布记录"}</Button></div></footer></main>

    {settingsOpen && <div className="fixed inset-0 z-50"><button aria-label="关闭文档设置" onClick={() => setSettingsOpen(false)} className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" /><aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/[0.15] bg-[#141512] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[0.12] px-5 py-4"><div><p className="editorial-kicker">DOCUMENT SETTINGS</p><h2 className="mt-1 text-lg text-stone-200">索引与发布信息</h2></div><button onClick={() => setSettingsOpen(false)} className="grid h-8 w-8 place-items-center border border-white/[0.12] text-stone-500 hover:border-[#c6edf0] hover:text-[#c6edf0]" aria-label="关闭"><X size={15} /></button></div><div className="flex-1 overflow-y-auto px-5 py-6"><section><label className="editorial-kicker">PERMALINK</label><Input value={slug} onChange={(event) => { setSlugLocked(true); setSlug(toSlug(event.target.value)); }} placeholder="observing-a-small-problem" className="quiet-input mt-3 h-10 border-x-0 border-t-0 px-0 font-mono text-xs placeholder:text-stone-700" /><p className="mt-2 text-xs leading-5 text-stone-600">公开链接：/posts/{slug || "your-slug"}</p></section><section className="mt-8 border-t border-white/[0.12] pt-6"><label className="editorial-kicker">ABSTRACT</label><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="用一两句话说明，这篇记录为何值得被读到。" className="quiet-input mt-3 min-h-28 w-full resize-y p-3 text-sm leading-7 placeholder:text-stone-700" /></section><section className="mt-8 border-t border-white/[0.12] pt-6"><label className="editorial-kicker">CLASSIFICATION</label><select value={categoryId ?? ""} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="quiet-input mt-3 h-10 w-full px-3 text-sm"><option value="">未分类</option>{categories?.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></section><section className="mt-8 border-t border-white/[0.12] pt-6"><label className="editorial-kicker">KEYWORDS</label><div className="mt-3 flex flex-wrap gap-2">{tags?.length ? tags.map((tag: any) => <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`border px-2.5 py-1.5 text-xs transition-colors ${tagIds.includes(tag.id) ? "border-[#c6edf0] bg-[#c6edf0] text-[#10110f]" : "border-white/15 text-stone-500 hover:border-stone-500 hover:text-stone-200"}`}>{tagIds.includes(tag.id) && <Check size={12} className="mr-1 inline" />}#{tag.name}</button>) : <p className="text-xs text-stone-600">暂无标签，可在管理控制台创建。</p>}</div></section><section className="mt-8 border-t border-white/[0.12] pt-6"><ImageUpload value={coverImage} onUpload={setCoverImage} label="COVER IMAGE" /><label className="mt-5 block text-xs leading-5 text-stone-600">也可粘贴公开或 `/manus-storage/` 图片 URL。</label><Input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} placeholder="https://…" className="quiet-input mt-2 h-10 border-x-0 border-t-0 px-0 text-sm placeholder:text-stone-700" /></section></div><div className="border-t border-white/[0.12] px-5 py-4"><p className="flex items-center gap-2 text-xs text-stone-600"><FileText size={13} /> {wordCount} words · {content.length.toLocaleString()} chars</p></div></aside></div>}
  </div>;
}
