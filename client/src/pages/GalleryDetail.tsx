import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpRight, Image as ImageIcon } from "lucide-react";

export default function GalleryDetail() {
  const [, params] = useRoute("/gallery/:id");
  const [, navigate] = useLocation();
  const galleryId = Number(params?.id || 0);
  const { data: gallery, isLoading, error } = trpc.galleries.getById.useQuery({ id: galleryId }, { enabled: galleryId > 0, retry: false });

  if (isLoading) return <div className="grid min-h-[55vh] place-items-center"><p className="editorial-kicker">OPENING CABINET…</p></div>;
  if (error || !gallery) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="editorial-kicker">CABINET NOT FOUND</p><h1 className="display-title mt-4 text-4xl">这个图片集不在当前索引里。</h1><p className="mt-4 text-sm text-stone-600">{error?.message || "请回到图片集索引继续浏览。"}</p><button onClick={() => navigate("/gallery")} className="editorial-button mt-7 px-5">返回图片集</button></div></div>;

  return <div className="pb-10"><button onClick={() => navigate("/gallery")} className="mb-8 flex items-center gap-2 text-xs text-stone-500 hover:text-[#c6edf0]"><ArrowLeft size={14} /> 返回图像柜</button><section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="editorial-kicker">IMAGE CABINET / {String(gallery.id).padStart(2, "0")}</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">{gallery.title}</h1></div><div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">{gallery.description || "一组值得被保存与回看的图像记录。"}</p><p className="mt-5 font-mono text-[10px] tracking-[0.12em] text-stone-600">{String(gallery.images.length).padStart(2, "0")} FRAMES · CREATED {new Date(gallery.createdAt).toLocaleDateString("zh-CN")}</p></div></section>{gallery.images.length ? <section className="columns-1 gap-4 py-8 sm:columns-2 lg:columns-3">{gallery.images.map((image: any, index: number) => <figure key={image.id} className="mb-4 break-inside-avoid border border-white/[0.1] bg-[#151613]"><img src={image.url} alt={image.title || `${gallery.title} 图片 ${index + 1}`} loading="lazy" className="block h-auto w-full" /><figcaption className="flex items-start justify-between gap-4 p-3"><div><p className="article-index">{String(index + 1).padStart(2, "0")} / FRAME</p>{image.title && <p className="mt-1 text-sm text-stone-300">{image.title}</p>}{image.description && <p className="mt-1 text-xs leading-5 text-stone-600">{image.description}</p>}</div><a href={image.url} target="_blank" rel="noreferrer" className="text-stone-600 hover:text-[#c6edf0]" aria-label="在新窗口打开原图"><ArrowUpRight size={14} /></a></figcaption></figure>)}</section> : <section className="grid min-h-[360px] place-items-center border-b border-white/[0.15] text-center"><div><ImageIcon size={22} className="mx-auto text-stone-600" /><p className="editorial-kicker mt-5">NO FRAMES YET</p><p className="mt-3 text-sm text-stone-500">管理员上传真实图片后，它们会显示在这里。</p></div></section>}</div>;
}
