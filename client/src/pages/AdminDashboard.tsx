import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import ImageUpload from "@/components/ImageUpload";
import { Check, ChevronLeft, FileText, Image as ImageIcon, ShieldCheck, Trash2, UserRound, Users, X } from "lucide-react";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
const formatDate = (value: Date | string | null) => value ? new Date(value).toLocaleDateString("zh-CN") : "—";

function Panel({ label, title, count, children }: { label: string; title: string; count?: number; children: React.ReactNode }) {
  return <section className="border-y border-white/[0.12] py-6 sm:py-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="editorial-kicker">{label}</p><h2 className="display-title mt-2 text-3xl">{title}</h2></div>{count !== undefined && <span className="article-index">{String(count).padStart(2, "0")} RECORDS</span>}</div>{children}</section>;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("posts");

  if (loading) return <div className="grid min-h-[45vh] place-items-center"><p className="editorial-kicker">VERIFYING CLEARANCE…</p></div>;
  if (user?.role !== "admin") return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">RESTRICTED CONSOLE</p><h1 className="display-title mt-4 text-4xl">这个入口只对<br />站点管理员开放。</h1><Button onClick={() => navigate("/")} className="editorial-button mt-7 px-5">返回首页</Button></div></div>;

  return (
    <div className="pb-10"><button onClick={() => navigate("/")} className="mb-8 flex items-center gap-2 text-xs text-stone-500 hover:text-[#c6edf0]"><ChevronLeft size={14} /> 返回观测站</button><section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="editorial-kicker">ADMIN CONSOLE / OWNER CLEARANCE</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">内容需要<br /><span className="display-accent">被认真管理。</span></h1></div><div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">这里处理文章、评论、术语、图像与用户目录。所有审核操作都会即时刷新相应索引。</p></div></section><Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-9"><TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-white/[0.12] bg-transparent p-0"><TabsTrigger value="posts" className="console-tab"><FileText size={14} />文章</TabsTrigger><TabsTrigger value="comments" className="console-tab"><ShieldCheck size={14} />审核</TabsTrigger><TabsTrigger value="terms" className="console-tab">术语</TabsTrigger><TabsTrigger value="gallery" className="console-tab"><ImageIcon size={14} />图像</TabsTrigger><TabsTrigger value="users" className="console-tab"><Users size={14} />用户</TabsTrigger></TabsList><TabsContent value="posts" className="mt-0"><PostsManagement /></TabsContent><TabsContent value="comments" className="mt-0"><CommentsModeration /></TabsContent><TabsContent value="terms" className="mt-0"><TermsManagement /></TabsContent><TabsContent value="gallery" className="mt-0"><GalleryManagement /></TabsContent><TabsContent value="users" className="mt-0"><UsersDirectory /></TabsContent></Tabs></div>
  );
}

function PostsManagement() {
  const [, navigate] = useLocation();
  const { data: posts, refetch, isLoading } = trpc.admin.posts.list.useQuery({ page: 1, limit: 50 });
  const deleteMutation = trpc.posts.delete.useMutation({ onSuccess: () => void refetch() });
  return <Panel label="EDITORIAL LEDGER" title="文章清单" count={posts?.length}>{isLoading ? <p className="text-sm text-stone-600">正在读取文章索引…</p> : posts?.length ? <div>{posts.map((post: any, index: number) => <article key={post.id} className="grid gap-3 border-t border-white/[0.12] py-5 sm:grid-cols-[60px_minmax(0,1fr)_auto] sm:items-center"><span className="article-index">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><h3 className="truncate text-lg text-stone-200">{post.title}</h3><p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-stone-600">{post.status.toUpperCase()} · {post.viewCount || 0} VIEWS · {formatDate(post.updatedAt)}</p></div><div className="flex gap-2"><Button onClick={() => navigate(`/posts/${post.slug}`)} variant="ghost" className="h-8 px-2 text-xs text-stone-500 hover:bg-transparent hover:text-[#c6edf0]">查看</Button><Button disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`确定删除「${post.title}」吗？此操作不可恢复。`)) deleteMutation.mutate({ id: post.id }); }} variant="ghost" className="h-8 px-2 text-xs text-stone-600 hover:bg-transparent hover:text-[#e39a86]"><Trash2 size={13} className="mr-1" />删除</Button></div></article>)}</div> : <Empty label="NO ARTICLES" description="还没有可管理的文章。" />}</Panel>;
}

function CommentsModeration() {
  const { data: comments, refetch, isLoading } = trpc.admin.comments.pending.useQuery({ page: 1, limit: 50 });
  const approveMutation = trpc.admin.comments.approve.useMutation({ onSuccess: () => void refetch() });
  const rejectMutation = trpc.admin.comments.reject.useMutation({ onSuccess: () => void refetch() });
  return <Panel label="MODERATION QUEUE" title="待审核回应" count={comments?.length}>{isLoading ? <p className="text-sm text-stone-600">正在读取审核队列…</p> : comments?.length ? <div>{comments.map((comment: any, index: number) => <article key={comment.id} className="grid gap-4 border-t border-white/[0.12] py-5 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-start"><div><p className="article-index">{String(index + 1).padStart(2, "0")}</p><p className="mt-2 text-xs text-stone-600">USER #{comment.authorId}</p></div><div><p className="text-sm leading-7 text-stone-300">{comment.content}</p><p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-stone-600">POST #{comment.postId} · {formatDate(comment.createdAt)}</p></div><div className="flex gap-2"><Button disabled={approveMutation.isPending || rejectMutation.isPending} onClick={() => approveMutation.mutate({ id: comment.id })} className="editorial-button editorial-button-primary h-8 px-3 text-xs"><Check size={13} className="mr-1" />通过</Button><Button disabled={approveMutation.isPending || rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: comment.id })} variant="ghost" className="h-8 px-2 text-xs text-stone-600 hover:bg-transparent hover:text-[#e39a86]"><X size={13} className="mr-1" />拒绝</Button></div></article>)}</div> : <Empty label="QUEUE CLEAR" description="目前没有需要审核的评论。" />}</Panel>;
}

function TermsManagement() {
  const { data: tags, refetch: refetchTags } = trpc.tags.list.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.categories.list.useQuery();
  const [tagName, setTagName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const createTag = trpc.tags.create.useMutation({ onSuccess: () => { setTagName(""); void refetchTags(); } });
  const createCategory = trpc.categories.create.useMutation({ onSuccess: () => { setCategoryName(""); void refetchCategories(); } });
  const termForm = (label: string, value: string, setValue: (next: string) => void, submit: () => void, pending: boolean) => <div className="border-t border-white/[0.12] pt-5"><p className="editorial-kicker">{label}</p><div className="mt-3 flex gap-3"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={`新建${label === "TAGS" ? "标签" : "分类"}`} className="quiet-input h-10 border-x-0 border-t-0 px-0 text-sm placeholder:text-stone-700" /><Button disabled={pending || !value.trim()} onClick={submit} className="editorial-button editorial-button-primary h-9 px-3 text-xs">添加</Button></div></div>;
  return <Panel label="VOCABULARY INDEX" title="标签与分类"><div className="grid gap-10 lg:grid-cols-2"><div>{termForm("TAGS", tagName, setTagName, () => createTag.mutate({ name: tagName.trim(), slug: slugify(tagName) }), createTag.isPending)}<div className="mt-6 flex flex-wrap gap-2">{tags?.map((tag: any) => <span key={tag.id} className="border border-white/[0.12] px-2.5 py-1.5 text-xs text-stone-400">#{tag.name}</span>)}</div></div><div>{termForm("CATEGORIES", categoryName, setCategoryName, () => createCategory.mutate({ name: categoryName.trim(), slug: slugify(categoryName) }), createCategory.isPending)}<div className="mt-6 flex flex-wrap gap-2">{categories?.map((category: any) => <span key={category.id} className="border border-white/[0.12] px-2.5 py-1.5 text-xs text-stone-400">{category.name}</span>)}</div></div></div></Panel>;
}

function UsersDirectory() {
  const { data: users, isLoading } = trpc.admin.users.list.useQuery({ page: 1, limit: 50 });
  return <Panel label="MEMBER DIRECTORY" title="用户目录" count={users?.length}>{isLoading ? <p className="text-sm text-stone-600">正在读取用户目录…</p> : users?.length ? <div>{users.map((member: any, index: number) => <article key={member.id} className="grid gap-3 border-t border-white/[0.12] py-5 sm:grid-cols-[60px_minmax(0,1fr)_auto] sm:items-center"><span className="article-index">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="flex items-center gap-2 text-sm text-stone-200"><UserRound size={14} className="text-[#c6edf0]" /> {member.name || "Unnamed observer"}</p><p className="mt-1 truncate font-mono text-[10px] tracking-[0.08em] text-stone-600">{member.email || member.openId}</p></div><div className="text-right"><span className={`border px-2 py-1 font-mono text-[9px] tracking-[0.1em] ${member.role === "admin" ? "border-[#c6edf0]/50 text-[#c6edf0]" : "border-white/[0.12] text-stone-500"}`}>{member.role.toUpperCase()}</span><p className="mt-2 text-[10px] text-stone-600">LAST {formatDate(member.lastSignedIn)}</p></div></article>)}</div> : <Empty label="NO USERS" description="尚无可展示的用户记录。" />}</Panel>;
}

function Empty({ label, description }: { label: string; description: string }) { return <div className="grid min-h-44 place-items-center border-t border-white/[0.12] text-center"><div><p className="editorial-kicker">{label}</p><p className="mt-3 text-sm text-stone-600">{description}</p></div></div>; }

function GalleryManagement() {
  const { data: galleries, refetch: refetchGalleries } = trpc.galleries.list.useQuery({ page: 1, limit: 50 });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  const { data: selectedGallery, refetch: refetchSelected } = trpc.galleries.getById.useQuery({ id: selectedGalleryId || 0 }, { enabled: Boolean(selectedGalleryId) });
  const createMutation = trpc.galleries.create.useMutation({ onSuccess: (gallery) => { setTitle(""); setDescription(""); setSelectedGalleryId(Number(gallery.id)); void refetchGalleries(); } });
  const addImageMutation = trpc.galleries.addImage.useMutation({ onSuccess: () => { void refetchSelected(); void refetchGalleries(); } });
  const removeImageMutation = trpc.galleries.removeImage.useMutation({ onSuccess: () => void refetchSelected() });
  const deleteGalleryMutation = trpc.galleries.delete.useMutation({ onSuccess: () => { setSelectedGalleryId(null); void refetchGalleries(); } });

  const addUploadedImage = (url: string) => {
    if (!selectedGalleryId || !url) return;
    addImageMutation.mutate({ galleryId: selectedGalleryId, url, order: selectedGallery?.images.length || 0 });
  };

  return <Panel label="IMAGE CABINET" title="图片集管理" count={galleries?.length}><div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="border-b border-white/[0.12] pb-7 lg:border-b-0 lg:border-r lg:pr-7 lg:pb-0"><p className="editorial-kicker">NEW CABINET</p><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="图片集名称" className="quiet-input mt-3 h-10 border-x-0 border-t-0 px-0 text-sm placeholder:text-stone-700" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="可选说明" className="quiet-input mt-3 min-h-20 w-full resize-y p-3 text-sm placeholder:text-stone-700" /><Button disabled={createMutation.isPending || !title.trim()} onClick={() => createMutation.mutate({ title: title.trim(), description: description.trim() || undefined })} className="editorial-button editorial-button-primary mt-3 w-full">创建图片集</Button><div className="mt-8 border-t border-white/[0.12] pt-5"><p className="editorial-kicker">CABINETS</p><div className="mt-3 grid gap-1">{galleries?.map((gallery: any) => <button key={gallery.id} onClick={() => setSelectedGalleryId(gallery.id)} className={`border-l px-3 py-2 text-left text-sm transition-colors ${selectedGalleryId === gallery.id ? "border-[#c6edf0] text-stone-100" : "border-white/[0.12] text-stone-500 hover:border-stone-500 hover:text-stone-200"}`}>{gallery.title}</button>)}</div></div></aside><div>{selectedGallery ? <div><div className="flex items-start justify-between gap-5"><div><p className="article-index">CABINET {String(selectedGallery.id).padStart(2, "0")}</p><h3 className="mt-2 text-2xl text-stone-200">{selectedGallery.title}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{selectedGallery.description || "没有说明。"}</p></div><Button disabled={deleteGalleryMutation.isPending} onClick={() => { if (window.confirm(`确定删除图片集「${selectedGallery.title}」及其图片记录吗？`)) deleteGalleryMutation.mutate({ id: selectedGallery.id }); }} variant="ghost" className="h-8 px-2 text-xs text-stone-600 hover:bg-transparent hover:text-[#e39a86]"><Trash2 size={13} className="mr-1" />删除</Button></div><div className="mt-7 border-y border-white/[0.12] py-5"><ImageUpload onUpload={addUploadedImage} label="ADD IMAGE TO THIS CABINET" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{selectedGallery.images.length ? selectedGallery.images.map((image: any, index: number) => <div key={image.id} className="border border-white/[0.12]"><img src={image.url} alt={image.title || `图片 ${index + 1}`} className="aspect-[1.4] w-full object-cover" /><div className="flex items-center justify-between p-2"><span className="article-index">{String(index + 1).padStart(2, "0")}</span><Button disabled={removeImageMutation.isPending} onClick={() => removeImageMutation.mutate({ id: image.id })} variant="ghost" className="h-7 px-1 text-xs text-stone-600 hover:bg-transparent hover:text-[#e39a86]"><Trash2 size={12} /></Button></div></div>) : <div className="sm:col-span-2"><Empty label="NO FRAMES" description="上传真实图片后会显示在这里。" /></div>}</div></div> : <Empty label="SELECT A CABINET" description="从左侧选择或新建一个图片集以开始上传。" />}</div></div></Panel>;
}
