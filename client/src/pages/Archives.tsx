import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function Archives() {
  const [, navigate] = useLocation();
  const { data: posts, isLoading } = trpc.posts.list.useQuery({
    page: 1,
    limit: 1000, // 获取所有文章用于时间轴展示
  });

  // 按年月分组文章
  const groupedPosts = posts?.data?.reduce(
    (acc: Record<string, any[]>, post: any) => {
      const date = new Date(post.publishedAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[yearMonth]) acc[yearMonth] = [];
      acc[yearMonth].push(post);
      return acc;
    },
    {}
  );

  // 按时间倒序排列
  const sortedYearMonths = Object.keys(groupedPosts || {}).sort().reverse();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          文章归档
        </h1>
        <p className="text-gray-400">
          按时间顺序浏览所有文章
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      ) : sortedYearMonths.length > 0 ? (
        <div className="max-w-3xl mx-auto">
          {/* 时间轴 */}
          <div className="relative">
            {/* 竖线 */}
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-400"></div>

            {/* 时间轴项目 */}
            <div className="space-y-8">
              {sortedYearMonths.map((yearMonth) => (
                <div key={yearMonth} className="relative pl-20">
                  {/* 时间点 */}
                  <div className="absolute left-0 top-1 w-9 h-9 bg-slate-900 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  </div>

                  {/* 年月标题 */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                      <Calendar size={24} />
                      {yearMonth}
                    </h2>
                  </div>

                  {/* 该月的文章列表 */}
                  <div className="space-y-3 ml-4 pb-8 border-l-2 border-purple-500/30 pl-6">
                    {groupedPosts?.[yearMonth]?.map((post: any) => (
                      <div
                        key={post.id}
                        className="group cursor-pointer transition-all hover:translate-x-2"
                        onClick={() => navigate(`/posts/${post.slug}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-purple-400 group-hover:text-cyan-400 transition-colors truncate">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.publishedAt).toLocaleDateString()} · 👁 {post.viewCount} 次阅读
                            </p>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">还没有任何文章</p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          >
            返回首页
          </Button>
        </div>
      )}

      {/* 统计信息 */}
      {posts?.data && posts.data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400">{posts.data.length}</div>
            <div className="text-sm text-gray-400 mt-2">总文章数</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">{sortedYearMonths.length}</div>
            <div className="text-sm text-gray-400 mt-2">发布月份</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-pink-400">
              {posts.data.reduce((sum: number, post: any) => sum + post.viewCount, 0)}
            </div>
            <div className="text-sm text-gray-400 mt-2">总阅读数</div>
          </div>
        </div>
      )}
    </div>
  );
}
