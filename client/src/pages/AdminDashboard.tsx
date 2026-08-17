import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ImageUpload from "@/components/ImageUpload";
import { Check, ChevronLeft, FileText, FolderOpen, Image as ImageIcon, ImagePlus, ShieldCheck, Trash2, UserRound, Users, X } from "lucide-react";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
const formatDate = (value: Date | string | null) => value ? new Date(value).toLocaleDateString("zh-CN") : "—";

function Panel({ label, title, count, children }: { label: string; title: string; count?: number; children: React.ReactNode }) {
  return <section className="mt-6 border-y border-white/[0.25] px-1 py-6 sm:mt-8 sm:px-2 sm:py-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="editorial-kicker">{label}</p><h2 className="display-title mt-2 text-3xl">{title}</h2></div>{count !== undefined && <span className="border-b border-[#d0f4ee] px-1 py-1.5 text-sm text-[#d0f4ee]">{count} 条</span>}</div>{children}</section>;
}

function Empty({ title, description }: { title: string; description: string }) {
  return <div className="grid min-h-44 place-items-center border-y border-dashed border-white/[0.3] px-5 text-center"><div><p className="text-sm font-medium text-[#f0ede7]">{title}</p><p className="mt-3 text-sm text-[#d0cfca]">{description}</p></div></div>;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("posts");

  if (loading) return <div className="grid min-h-[45vh] place-items-center"><p className="text-sm text-[#e5e2db]">正在验证管理员权限…</p></div>;
  if (user?.role !== "admin") return <div className="grid min-h-[55vh] place-items-center text-center"><div className="border-y border-white/[0.25] px-7 py-10"><p className="text-sm text-[#e5e2db]">此页面只对管理员开放</p><h1 className="display-title mt-4 text-4xl">当前账号没有<br />后台管理权限。</h1><Button onClick={() => navigate("/")} className="editorial-button mt-7 px-5">返回首页</Button></div></div>;

  return <div className="pb-10"><button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 border-b border-transparent pb-1 text-sm text-[#e5e2db] hover:border-[#d0f4ee] hover:text-[#d0f4ee]"><ChevronLeft size={15} />返回首页</button><section className="grid border-y border-white/[0.28] px-1 py-10 sm:py-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="editorial-kicker">管理后台</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">管理站内内容，<br /><span className="display-accent">也管理公开边界。</span></h1></div><div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-2"><p className="copy-lede">可在这里查看文章、审核评论、维护标签和分类、管理图片集，并核对已注册用户。每项操作完成后都会刷新当前数据。</p></div></section><Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-6"><TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-y border-white/[0.25] bg-transparent p-0"><TabsTrigger value="posts" className="console-tab rounded-none"><FileText size={14} />文章</TabsTrigger><TabsTrigger value="comments" className="console-tab rounded-none"><ShieldCheck size={14} />审核</TabsTrigger><TabsTrigger value="terms" className="console-tab rounded-none">标签与分类</TabsTrigger><TabsTrigger value="gallery" className="console-tab rounded-none"><ImageIcon size={14} />图片集</TabsTrigger><TabsTrigger value="users" className="console-tab rounded-none"><Users size={14} />用户</TabsTrigger></TabsList><TabsContent value="posts" className="mt-0"><PostsManagement /></TabsContent><TabsContent value="comments" className="mt-0"><CommentsModeration /></TabsContent><TabsContent value="terms" className="mt-0"><TermsManagement /></TabsContent><TabsContent value="gallery" className="mt-0"><GalleryManagement /></TabsContent><TabsContent value="users" className="mt-0"><UsersDirectory /></TabsContent></Tabs></div>;
}

function PostsManagement() {
  const [, navigate] = useLocation();
  const { data: posts, refetch, isLoading } = trpc.admin.posts.list.useQuery({ page: 1, limit: 50 });
  const deleteMutation = trpc.posts.delete.useMutation({ onSuccess: () => void refetch() });
  return <Panel label="内容管理" title="文章" count={posts?.length}>{isLoading ? <p className="text-sm text-slate-300">正在读取文章…</p> : posts?.length ? <div className="grid gap-3">{posts.map((post: any) => <article key={post.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.12] bg-white/[0.035] p-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-xs text-slate-400">{post.status === "published" ? "已发布" : "草稿"} · {post.viewCount || 0} 次阅读 · 更新于 {formatDate(post.updatedAt)}</p><h3 className="mt-2 truncate text-lg font-medium text-white">{post.title}</h3></div><div className="flex gap-2"><Button onClick={() => navigate(`/posts/${post.slug}`)} variant="ghost" className="h-9 px-2.5 text-xs text-slate-200 hover:bg-white/[0.08] hover:text-[#bce8eb]">查看</Button><Button disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`确定删除「${post.title}」吗？此操作不可恢复。`)) deleteMutation.mutate({ id: post.id }); }} variant="ghost" className="h-9 px-2.5 text-xs text-slate-300 hover:bg-[#efaa91]/10 hover:text-[#ffd1c4]"><Trash2 size={13} className="mr-1.5" />删除</Button></div></article>)}</div> : <Empty title="暂时没有文章记录" description="新建草稿或发布文章后，都会显示在这里。" />}</Panel>;
}

function CommentsModeration() {
  const { data: comments, refetch, isLoading } = trpc.admin.comments.pending.useQuery({ page: 1, limit: 50 });
  const approveMutation = trpc.admin.comments.approve.useMutation({ onSuccess: () => void refetch() });
  const rejectMutation = trpc.admin.comments.reject.useMutation({ onSuccess: () => void refetch() });
  return <Panel label="评论管理" title="待审核评论" count={comments?.length}>{isLoading ? <p className="text-sm text-slate-300">正在读取待审核评论…</p> : comments?.length ? <div className="grid gap-3">{comments.map((comment: any) => <article key={comment.id} className="flex flex-col gap-4 rounded-2xl border border-white/[0.12] bg-white/[0.035] p-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm leading-7 text-slate-100">{comment.content}</p><p className="mt-3 text-xs text-slate-400">用户 #{comment.authorId} · 文章 #{comment.postId} · {formatDate(comment.createdAt)}</p></div><div className="flex shrink-0 gap-2"><Button disabled={approveMutation.isPending || rejectMutation.isPending} onClick={() => approveMutation.mutate({ id: comment.id })} className="editorial-button editorial-button-primary h-9 px-3 text-xs"><Check size={13} className="mr-1.5" />通过</Button><Button disabled={approveMutation.isPending || rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: comment.id })} variant="ghost" className="h-9 px-2.5 text-xs text-slate-300 hover:bg-[#efaa91]/10 hover:text-[#ffd1c4]"><X size={13} className="mr-1.5" />拒绝</Button></div></article>)}</div> : <Empty title="没有等待处理的评论" description="新评论提交后，会先在这里等待审核。" />}</Panel>;
}

function TermsManagement() {
  const { data: tags, refetch: refetchTags } = trpc.tags.list.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.categories.list.useQuery();
  const [tagName, setTagName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const createTag = trpc.tags.create.useMutation({ onSuccess: () => { setTagName(""); void refetchTags(); } });
  const createCategory = trpc.categories.create.useMutation({ onSuccess: () => { setCategoryName(""); void refetchCategories(); } });
  const termForm = (label: string, value: string, setValue: (next: string) => void, submit: () => void, pending: boolean) => <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-4"><p className="text-sm font-medium text-slate-100">{label}</p><div className="mt-3 flex gap-2"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={`输入${label}名称`} className="quiet-input h-10 flex-1 px-3 text-sm" /><Button disabled={pending || !value.trim()} onClick={submit} className="editorial-button editorial-button-primary h-10 px-3 text-xs">添加</Button></div></div>;
  return <Panel label="内容术语" title="标签与分类"><div className="grid gap-4 lg:grid-cols-2"><div>{termForm("标签", tagName, setTagName, () => createTag.mutate({ name: tagName.trim(), slug: slugify(tagName) }), createTag.isPending)}<div className="mt-4 flex flex-wrap gap-2">{tags?.map((tag: any) => <span key={tag.id} className="rounded-full border border-white/[0.15] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200">#{tag.name}</span>)}</div></div><div>{termForm("分类", categoryName, setCategoryName, () => createCategory.mutate({ name: categoryName.trim(), slug: slugify(categoryName) }), createCategory.isPending)}<div className="mt-4 flex flex-wrap gap-2">{categories?.map((category: any) => <span key={category.id} className="rounded-full border border-white/[0.15] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200">{category.name}</span>)}</div></div></div></Panel>;
}

function UsersDirectory() {
  const { data: users, isLoading } = trpc.admin.users.list.useQuery({ page: 1, limit: 50 });
  return <Panel label="用户管理" title="用户" count={users?.length}>{isLoading ? <p className="text-sm text-slate-300">正在读取用户…</p> : users?.length ? <div className="grid gap-3">{users.map((member: any) => <article key={member.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.035] p-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="flex items-center gap-2 text-sm text-slate-100"><UserRound size={15} className="text-[#bce8eb]" /> {member.name || "未命名用户"}</p><p className="mt-2 truncate text-xs text-slate-400">{member.email || member.openId}</p></div><div className="text-left sm:text-right"><span className={`rounded-full px-2.5 py-1 text-xs ${member.role === "admin" ? "bg-[#bce8eb]/14 text-[#d6fbfc]" : "bg-white/[0.08] text-slate-300"}`}>{member.role === "admin" ? "管理员" : "用户"}</span><p className="mt-2 text-xs text-slate-400">最近登录：{formatDate(member.lastSignedIn)}</p></div></article>)}</div> : <Empty title="还没有用户记录" description="完成注册的账号会显示在这里。" />}</Panel>;
}

function GalleryManagement() {
  const { data: galleries, refetch: refetchGalleries } = trpc.galleries.list.useQuery({ page: 1, limit: 50 });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const { data: selectedGallery, refetch: refetchSelected } = trpc.galleries.getById.useQuery({ id: selectedGalleryId || 0 }, { enabled: Boolean(selectedGalleryId) });
  const createMutation = trpc.galleries.create.useMutation({ onSuccess: (gallery) => { setTitle(""); setDescription(""); setSelectedGalleryId(Number(gallery.id)); void refetchGalleries(); } });
  const updateMutation = trpc.galleries.update.useMutation({ onSuccess: () => { void refetchSelected(); void refetchGalleries(); } });
  const addImageMutation = trpc.galleries.addImage.useMutation({ onSuccess: () => { void refetchSelected(); void refetchGalleries(); } });
  const removeImageMutation = trpc.galleries.removeImage.useMutation({ onSuccess: () => void refetchSelected() });
  const deleteGalleryMutation = trpc.galleries.delete.useMutation({ onSuccess: () => { setSelectedGalleryId(null); void refetchGalleries(); } });

  useEffect(() => {
    if (selectedGallery) {
      setDraftTitle(selectedGallery.title);
      setDraftDescription(selectedGallery.description || "");
    }
  }, [selectedGallery?.id, selectedGallery?.title, selectedGallery?.description]);

  const addUploadedImage = (url: string) => { if (selectedGalleryId && url) addImageMutation.mutate({ galleryId: selectedGalleryId, url, order: selectedGallery?.images.length || 0 }); };
  const hasMetadataChanges = Boolean(selectedGallery && (draftTitle.trim() !== selectedGallery.title || draftDescription.trim() !== (selectedGallery.description || "")));

  return <Panel label="图片管理" title="图片集" count={galleries?.length}>
    <div className="grid border-y border-white/[0.2] lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-b border-white/[0.2] px-1 py-5 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center gap-2"><FolderOpen size={16} className="text-[#d0f4ee]" /><p className="text-sm font-medium text-[#fff8ed]">图片集目录</p></div>
        <p className="mt-2 text-xs leading-5 text-[#d0cfca]">先选择一个图片集，再上传或整理其中的真实图片。</p>
        <div className="mt-5 border-t border-white/[0.16] pt-5"><p className="text-xs font-medium text-[#e5e2db]">新建图片集</p><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="图片集名称" className="quiet-input mt-3 h-10 px-3 text-sm" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="可选说明" className="quiet-input mt-3 min-h-20 w-full resize-y p-3 text-sm" /><Button disabled={createMutation.isPending || !title.trim()} onClick={() => createMutation.mutate({ title: title.trim(), description: description.trim() || undefined })} className="editorial-button editorial-button-primary mt-3 w-full">{createMutation.isPending ? "正在创建…" : "创建图片集"}</Button></div>
        <div className="mt-6 border-t border-white/[0.16] pt-5"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#e5e2db]">已有图片集</p><span className="text-xs text-[#d0cfca]">{galleries?.length || 0} 个</span></div>{galleries?.length ? <div className="mt-3 grid gap-1">{galleries.map((gallery: any, index: number) => <button key={gallery.id} onClick={() => setSelectedGalleryId(gallery.id)} className={`flex items-center gap-3 border-l-2 px-3 py-3 text-left transition-colors ${selectedGalleryId === gallery.id ? "border-[#d0f4ee] bg-[#d0f4ee]/10 text-[#e8fffb]" : "border-transparent text-[#e5e2db] hover:border-white/[0.5] hover:bg-white/[0.045]"}`}><span className="font-mono text-[10px] text-[#d0cfca]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-sm">{gallery.title}</span>{selectedGalleryId === gallery.id && <span className="text-[10px] text-[#d0f4ee]">当前</span>}</button>)}</div> : <p className="mt-3 text-xs leading-5 text-[#d0cfca]">还没有图片集。创建后可在右侧添加真实图片。</p>}</div>
      </aside>
      <section className="min-w-0 px-1 py-5 lg:px-7 lg:py-6">{selectedGallery ? <>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.16] pb-5"><div><p className="editorial-kicker">当前图片集 · {selectedGallery.images.length} 张图片</p><h3 className="display-title mt-2 text-3xl">{selectedGallery.title}</h3></div><span className="border-b border-[#d0f4ee] px-1 pb-1 text-xs text-[#d0f4ee]">可公开浏览</span></div>
        <div className="grid gap-5 border-b border-white/[0.16] py-6 lg:grid-cols-[minmax(0,1fr)_220px]"><div><p className="text-sm font-medium text-[#fff8ed]">图片集信息</p><p className="mt-2 text-xs leading-5 text-[#d0cfca]">修改名称或说明后需要点击保存。不会改变已上传图片。</p><Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="图片集名称" className="quiet-input mt-4 h-10 px-3 text-sm" /><textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder="图片集说明" className="quiet-input mt-3 min-h-24 w-full resize-y p-3 text-sm" /><Button disabled={updateMutation.isPending || !draftTitle.trim() || !hasMetadataChanges} onClick={() => updateMutation.mutate({ id: selectedGallery.id, title: draftTitle.trim(), description: draftDescription.trim() || undefined })} className="editorial-button editorial-button-primary mt-3 px-4">{updateMutation.isPending ? "正在保存…" : "保存图片集信息"}</Button></div><div className="border-l border-[#eab78c] pl-4"><p className="text-xs font-medium text-[#fff8ed]">上传前确认</p><p className="mt-2 text-xs leading-5 text-[#d0cfca]">图片会进入当前图片集，并在公开图库中按顺序展示。</p></div></div>
        <div className="border-b border-white/[0.16] py-6"><div className="flex items-center gap-2"><ImagePlus size={16} className="text-[#d0f4ee]" /><div><p className="text-sm font-medium text-[#fff8ed]">添加真实图片</p><p className="mt-1 text-xs text-[#d0cfca]">上传完成后会自动加入当前图片集。</p></div></div><div className="mt-4 border border-dashed border-white/[0.28] p-4"><ImageUpload onUpload={addUploadedImage} label="上传图片到当前图片集" /></div></div>
        <div className="py-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-[#fff8ed]">已收录图片</p><p className="mt-1 text-xs text-[#d0cfca]">移除图片会立即从此图片集的公开展示中消失。</p></div><span className="text-xs text-[#d0cfca]">{selectedGallery.images.length} 张</span></div>{selectedGallery.images.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{selectedGallery.images.map((image: any, index: number) => <div key={image.id} className="overflow-hidden border border-white/[0.16] bg-white/[0.025]"><img src={image.url} alt={image.title || `图片 ${index + 1}`} className="aspect-[1.4] w-full object-cover" /><div className="flex items-center justify-between gap-3 p-3"><span className="text-xs text-[#e5e2db]">图片 {String(index + 1).padStart(2, "0")}</span><Button disabled={removeImageMutation.isPending} onClick={() => { if (window.confirm(`确定从「${selectedGallery.title}」移除图片 ${index + 1} 吗？`)) removeImageMutation.mutate({ id: image.id }); }} variant="ghost" className="h-8 px-2 text-xs text-[#d0cfca] hover:bg-[#efaa91]/10 hover:text-[#ffd1c4]"><Trash2 size={13} className="mr-1" />移除</Button></div></div>)}</div> : <div className="mt-4"><Empty title="这个图片集还没有图片" description="可从上方上传真实图片；上传前不会出现无效预览或示例素材。" /></div>}</div>
        <div className="border-t border-[#eab78c]/50 py-6"><p className="text-sm font-medium text-[#fff0df]">危险操作</p><p className="mt-2 text-xs leading-5 text-[#d0cfca]">删除图片集会同时删除其中的图片记录，无法撤销；存储中的原文件不会在此界面被伪装为可恢复内容。</p><Button disabled={deleteGalleryMutation.isPending} onClick={() => { if (window.confirm(`确定删除图片集「${selectedGallery.title}」及其 ${selectedGallery.images.length} 张图片记录吗？此操作不可恢复。`)) deleteGalleryMutation.mutate({ id: selectedGallery.id }); }} variant="ghost" className="mt-3 h-9 px-2.5 text-xs text-[#ffd1c4] hover:bg-[#efaa91]/10"><Trash2 size={13} className="mr-1.5" />删除这个图片集</Button></div>
      </> : <Empty title="先选择一个图片集" description="从左侧目录选择已有图片集，或先创建一个图片集；选择后才会显示上传和整理操作。" />}</section>
    </div>
  </Panel>;
}
