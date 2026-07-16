import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Sparkles, BookOpen, MessageCircle, Tag, Image, BarChart3 } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: posts } = trpc.posts.list.useQuery({ page: 1, limit: 3 });

  const features = [
    {
      icon: BookOpen,
      title: "Markdown 编辑",
      description: "支持完整的 Markdown 语法，代码高亮渲染",
    },
    {
      icon: MessageCircle,
      title: "嵌套评论",
      description: "支持楼层式回复，完整的评论审核机制",
    },
    {
      icon: Tag,
      title: "标签分类",
      description: "灵活的标签和分类系统，快速筛选文章",
    },
    {
      icon: Image,
      title: "图片集",
      description: "独立的图片集展示功能，支持 S3 存储",
    },
    {
      icon: BarChart3,
      title: "阅读统计",
      description: "实时统计文章阅读量，了解内容热度",
    },
    {
      icon: Sparkles,
      title: "宇宙美学",
      description: "沉浸式设计，樱花粒子动效，极客二次元风格",
    },
  ];

  return (
    <div className="space-y-20">
      {/* 英雄区 */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center space-y-8 py-20">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            MorroBlog
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            沉浸式宇宙美学风格的个人技术博客系统
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            融合二次元与极客文化，打造属于你的深邃星空博客
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Button
                size="lg"
                onClick={() => navigate("/posts")}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8"
              >
                开始阅读
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/create")}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 px-8"
              >
                发布文章
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => startLogin()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8"
              >
                立即登录
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/posts")}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 px-8"
              >
                浏览文章
              </Button>
            </>
          )}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400">{posts?.total || 0}</div>
            <div className="text-gray-400 mt-2">篇文章</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400">∞</div>
            <div className="text-gray-400 mt-2">无限可能</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400">✨</div>
            <div className="text-gray-400 mt-2">宇宙美学</div>
          </div>
        </div>
      </section>

      {/* 特性展示 */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            核心特性
          </h2>
          <p className="text-gray-400">完整的博客功能，为你的创意提供无限舞台</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20 p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors">
                    <Icon className="text-cyan-400 group-hover:text-purple-400 transition-colors" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 最新文章 */}
      {posts?.data && posts.data.length > 0 && (
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              最新文章
            </h2>
            <p className="text-gray-400">探索最新的技术文章和创意分享</p>
          </div>

          <div className="grid gap-6">
            {posts.data.map((post: any) => (
              <Card
                key={post.id}
                className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20 p-6 cursor-pointer group"
                onClick={() => navigate(`/posts/${post.slug}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-cyan-400 group-hover:text-purple-400 transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👁 {post.viewCount} 次阅读</span>
                      <span>📅 {new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      阅读
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => navigate("/posts")}
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              查看所有文章
            </Button>
          </div>
        </section>
      )}

      {/* 号召行动 */}
      <section className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">准备好开始了吗？</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          加入 MorroBlog 社区，分享你的技术见解，在宇宙美学的怀抱中创作属于自己的故事。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              现在就写文章
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => startLogin()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              登录开始创作
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => navigate("/about")}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          >
            了解更多
          </Button>
        </div>
      </section>
    </div>
  );
}
