import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PostsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.posts.list.useQuery({ page, limit: 10 });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        文章列表
      </h1>
      
      {isLoading ? (
        <div className="text-center py-12">加载中...</div>
      ) : (
        <>
          <div className="grid gap-6">
            {data?.data?.map((post: any) => (
              <Card key={post.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-colors p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-2">{post.title}</h2>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>👁 {post.viewCount} 次阅读</span>
                  <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400">
                    阅读全文
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
            >
              上一页
            </Button>
            <span className="py-2">第 {page} 页</span>
            <Button
              onClick={() => setPage(page + 1)}
              variant="outline"
            >
              下一页
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
