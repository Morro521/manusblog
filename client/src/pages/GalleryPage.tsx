import { trpc } from "@/lib/trpc";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function GalleryPage() {
  const [, navigate] = useLocation();
  const { data: galleries, isLoading } = trpc.galleries.list.useQuery({ page: 1, limit: 20 });

  return (
    <div>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-6"><p className="editorial-kicker">IMAGE CABINET / SELECTED FRAMES</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">图像，不是<br /><span className="display-accent">背景。</span></h1></div>
        <div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">图片集保存那些与文字同样值得回看的画面。上传后的图片会通过存储服务保留原始出处与可访问地址。</p></div>
      </section>

      {isLoading ? <div className="py-28"><p className="editorial-kicker">OPENING CABINET…</p></div> : galleries?.length ? <section className="grid border-b border-white/[0.15] md:grid-cols-2">{galleries.map((gallery: any, index: number) => {
        const imageUrl = gallery.coverImage || gallery.coverUrl || gallery.thumbnailUrl;
        return <button key={gallery.id} type="button" onClick={() => navigate(`/gallery/${gallery.id}`)} className={`group border-b border-white/[0.12] py-6 text-left ${index % 2 === 0 ? "md:border-r md:pr-7" : "md:pl-7"}`} aria-label={`打开图片集：${gallery.title}`}><div className="article-cover aspect-[1.45]">{imageUrl ? <img src={imageUrl} alt={gallery.title} loading="lazy" /> : <div className="grid h-full place-items-center bg-[#191a17]"><span className="article-index">NO COVER IMAGE</span></div>}</div><div className="mt-4 flex items-start justify-between gap-5"><div><p className="article-index">{String(index + 1).padStart(2, "0")} / GALLERY</p><h2 className="mt-2 text-xl text-stone-200 transition-colors group-hover:text-[#c6edf0]">{gallery.title}</h2>{gallery.description && <p className="mt-2 text-sm leading-6 text-stone-500">{gallery.description}</p>}</div><ArrowRight size={15} className="mt-5 text-stone-600 transition-transform group-hover:translate-x-1 group-hover:text-[#c6edf0]" /></div></button>;
      })}</section> : <section className="grid min-h-[420px] place-items-center border-b border-white/[0.15] text-center"><div><ImageIcon size={22} className="mx-auto text-stone-600" /><p className="editorial-kicker mt-5">CABINET EMPTY</p><p className="mt-3 max-w-sm text-sm leading-7 text-stone-500">还没有公开的图片集。登录并在后台创建图片集后，这里只展示真实上传的图像，而不使用伪造的样例内容。</p></div></section>}
    </div>
  );
}
