const stack = [
  ["01", "WRITING SURFACE", "React 19 · TypeScript · Tailwind CSS 4"],
  ["02", "SERVICE LAYER", "Express · tRPC · Manus OAuth"],
  ["03", "PERSISTENCE", "MySQL · Drizzle ORM · S3 Storage"],
  ["04", "DEPLOYMENT", "Docker Compose · fnos"],
];

export default function About() {
  return (
    <div>
      <section className="grid border-y border-white/[0.15] py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-7"><p className="editorial-kicker">ABOUT THIS PLACE / EST. 2026</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">不是内容平台。<br />是一份<span className="display-accent">私人刊物。</span></h1></div>
        <div className="mt-7 max-w-md lg:col-span-4 lg:col-start-9 lg:mt-1"><p className="copy-lede">MorroBlog 想成为一个可以慢慢积累的个人技术空间。这里有极客的细节，也允许二次元的趣味；但它们都服务于写作本身。</p></div>
      </section>

      <section className="grid border-b border-white/[0.15] py-12 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-3"><p className="editorial-kicker">EDITORIAL NOTE</p></div>
        <div className="lg:col-span-7"><p className="text-2xl leading-[1.8] text-stone-200 sm:text-3xl" style={{ fontFamily: '"Noto Serif SC", serif' }}>“技术写作不一定要显得很吵。它可以像深夜打开的一盏台灯：不解释一切，只照亮眼前正在研究的问题。”</p><p className="mt-8 max-w-2xl text-sm leading-8 text-stone-500">因此，这个项目保留了完整博客该有的发布、阅读、评论、归档和权限能力，同时努力让界面退到内容后面。它应该像工作台、索引卡和观察日志的组合，而不是一组被反复使用的 SaaS 卡片。</p></div>
      </section>

      <section className="border-b border-white/[0.15] py-12 sm:py-16"><p className="editorial-kicker">CONSTRUCTION LOG / TECHNICAL STACK</p><div className="mt-7 grid border-t border-white/[0.12] md:grid-cols-2">{stack.map(([number, title, value], index) => <div key={title} className={`grid grid-cols-[54px_1fr] gap-3 border-b border-white/[0.12] py-5 ${index % 2 === 0 ? "md:border-r md:pr-8" : "md:pl-8"}`}><span className="article-index">{number}</span><div><h2 className="font-mono text-[11px] tracking-[0.13em] text-[#c6edf0]">{title}</h2><p className="mt-2 text-sm text-stone-500">{value}</p></div></div>)}</div></section>

      <section className="grid gap-8 border-b border-white/[0.15] py-12 sm:py-16 lg:grid-cols-12"><div className="lg:col-span-3"><p className="editorial-kicker">PRINCIPLES</p></div><div className="grid gap-7 sm:grid-cols-2 lg:col-span-8"><div><h2 className="text-lg text-stone-200">内容比装饰重要</h2><p className="mt-3 text-sm leading-7 text-stone-500">图像、动效和色彩应该建立阅读节奏，而不是抢走文章的注意力。</p></div><div><h2 className="text-lg text-stone-200">有趣，但不廉价</h2><p className="mt-3 text-sm leading-7 text-stone-500">二次元与极客文化可以共存，但不靠夸张霓虹、堆叠贴纸或模板化卡片表达。</p></div><div><h2 className="text-lg text-stone-200">部署是现实的一部分</h2><p className="mt-3 text-sm leading-7 text-stone-500">项目提供 Docker Compose，并以可部署到 fnos 的方式组织服务和存储。</p></div><div><h2 className="text-lg text-stone-200">档案会慢慢长出来</h2><p className="mt-3 text-sm leading-7 text-stone-500">标签、归档和图片集都不是装饰性模块，而是为了让未来的自己能找到过去。</p></div></div></section>
    </div>
  );
}
