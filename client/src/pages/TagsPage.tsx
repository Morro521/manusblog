import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export default function TagsPage() {
  const [, navigate] = useLocation();
  const { data: tags, isLoading } = trpc.tags.list.useQuery();

  // 计算标签大小（基于文章数量）
  const getTagSize = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio > 0.8) return "text-4xl";
    if (ratio > 0.6) return "text-3xl";
    if (ratio > 0.4) return "text-2xl";
    if (ratio > 0.2) return "text-xl";
    return "text-lg";
  };

  const maxPostCount = tags ? Math.max(...tags.map((t: any) => t.postCount || 0)) : 1;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          标签云
        </h1>
        <p className="text-gray-400">
          浏览所有文章标签，发现感兴趣的内容
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      ) : tags && tags.length > 0 ? (
        <>
          {/* 标签云展示 */}
          <Card className="bg-slate-800/50 border-purple-500/20 p-12">
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {tags.map((tag: any) => (
                <button
                  key={tag.id}
                  onClick={() => navigate(`/posts?tag=${tag.slug}`)}
                  className={`${getTagSize(tag.postCount || 0, maxPostCount)} font-bold transition-all hover:scale-110 hover:text-cyan-400`}
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400">
                    #{tag.name}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* 标签列表 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <Tag size={24} />
              标签详情
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag: any) => (
                <Card
                  key={tag.id}
                  className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-colors p-6 cursor-pointer group"
                  onClick={() => navigate(`/posts?tag=${tag.slug}`)}
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-purple-400 group-hover:text-cyan-400 transition-colors">
                      #{tag.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      暂无描述
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">
                        📝 {tag.postCount || 0} 篇文章
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/posts?tag=${tag.slug}`);
                        }}
                      >
                        浏览
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">还没有任何标签</p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          >
            返回首页
          </Button>
        </div>
      )}
    </div>
  );
}
