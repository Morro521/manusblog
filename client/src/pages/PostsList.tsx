import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";

export default function PostsList() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: postsData, isLoading } = trpc.posts.list.useQuery({
    page,
    limit: 10,
  });

  const { data: tags } = trpc.tags.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  // 客户端搜索和筛选
  const filteredPosts = postsData?.data?.filter((post: any) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || post.tags?.some((t: any) => t.slug === selectedTag);
    const matchesCategory = !selectedCategory || post.categoryId === parseInt(selectedCategory);

    return matchesSearch && matchesTag && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSelectedCategory(null);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          文章列表
        </h1>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="搜索文章标题或内容..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-slate-800 border-purple-500/20 focus:border-purple-500/50"
          />
        </div>

        {/* 标签筛选 */}
        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">📌 标签筛选</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag.slug ? null : tag.slug);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag.slug
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800 border border-purple-500/20 text-gray-300 hover:border-purple-500/50"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 分类筛选 */}
        {categories && categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">📂 分类筛选</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === String(category.id) ? null : String(category.id));
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === String(category.id)
                      ? "bg-purple-500 text-white"
                      : "bg-slate-800 border border-purple-500/20 text-gray-300 hover:border-purple-500/50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 清除筛选按钮 */}
        {(searchQuery || selectedTag || selectedCategory) && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-cyan-400"
          >
            <X size={16} className="mr-2" />
            清除所有筛选
          </Button>
        )}
      </div>

      {/* 文章列表 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      ) : filteredPosts && filteredPosts.length > 0 ? (
        <>
          <div className="grid gap-6">
            {filteredPosts.map((post: any) => (
              <Card
                key={post.id}
                className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-colors p-6 cursor-pointer group"
                onClick={() => navigate(`/posts/${post.slug}`)}
              >
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-cyan-400 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 line-clamp-2">{post.excerpt}</p>

                  {/* 标签显示 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-block px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-400 pt-2">
                    <span>👁 {post.viewCount} 次阅读</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/posts/${post.slug}`);
                      }}
                    >
                      阅读全文 →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              ← 上一页
            </Button>
            <span className="py-2 text-gray-400">第 {page} 页</span>
            <Button
              onClick={() => setPage(page + 1)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              下一页 →
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">没有找到匹配的文章</p>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          >
            清除筛选条件
          </Button>
        </div>
      )}
    </div>
  );
}
