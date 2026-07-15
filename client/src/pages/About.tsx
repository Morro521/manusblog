export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        关于 MorroBlog
      </h1>
      
      <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-8 space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">项目介绍</h2>
          <p>
            MorroBlog 是一个沉浸式宇宙美学风格的个人技术博客系统，融合了二次元与极客文化的审美元素。
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">技术栈</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>前端: React 19 + Tailwind CSS 4</li>
            <li>后端: Express + tRPC + Node.js</li>
            <li>数据库: MySQL</li>
            <li>部署: Docker + fnos</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">功能特性</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>✨ 沉浸式宇宙美学设计</li>
            <li>🌸 樱花粒子动效</li>
            <li>📝 Markdown 编辑器</li>
            <li>💬 嵌套评论系统</li>
            <li>🏷️ 标签与分类</li>
            <li>📸 图片集展示</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
