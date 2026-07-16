import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("posts");

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">无权访问</h1>
        <p className="text-gray-400">只有管理员可以访问此页面</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        管理后台
      </h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-slate-800 border border-purple-500/20 w-full justify-start">
          <TabsTrigger value="posts" className="data-[state=active]:bg-purple-500/30">
            📝 文章管理
          </TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-purple-500/30">
            💬 评论审核
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-purple-500/30">
            🏷️ 标签管理
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-purple-500/30">
            📂 分类管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="bg-slate-800/50 p-6 rounded-lg border border-purple-500/20">
          <PostsManagement />
        </TabsContent>

        <TabsContent value="comments" className="bg-slate-800/50 p-6 rounded-lg border border-purple-500/20">
          <CommentsModeration />
        </TabsContent>

        <TabsContent value="tags" className="bg-slate-800/50 p-6 rounded-lg border border-purple-500/20">
          <TagsManagement />
        </TabsContent>

        <TabsContent value="categories" className="bg-slate-800/50 p-6 rounded-lg border border-purple-500/20">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostsManagement() {
  const { data: posts } = trpc.posts.myPosts.useQuery({ page: 1, limit: 20 });
  const deleteMutation = trpc.posts.delete.useMutation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">我的文章</h2>
        <div className="text-sm text-gray-400">共 {posts?.data?.length || 0} 篇文章</div>
      </div>

      <div className="space-y-4">
        {posts?.data && posts.data.length > 0 ? (
          posts.data.map((post: any) => (
            <Card
              key={post.id}
              className="bg-slate-700/50 border-purple-500/20 p-4 flex justify-between items-center hover:border-purple-500/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">{post.title}</h3>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>状态: {post.status === "published" ? "已发布" : "草稿"}</span>
                  <span>👁 {post.viewCount} 次阅读</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/20"
                  onClick={() => {
                    if (confirm("确定删除此文章吗？")) {
                      deleteMutation.mutate({ id: post.id });
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">还没有发布任何文章</div>
        )}
      </div>
    </div>
  );
}

function CommentsModeration() {
  const { data: comments } = trpc.admin.comments.pending.useQuery({ page: 1, limit: 20 });
  const approveMutation = trpc.admin.comments.approve.useMutation();
  const rejectMutation = trpc.admin.comments.reject.useMutation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">待审核评论</h2>
        <div className="text-sm text-gray-400">共 {comments?.length || 0} 条待审核</div>
      </div>

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <Card
              key={comment.id}
              className="bg-slate-700/50 border-purple-500/20 p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="mb-4">
                <p className="text-white mb-2">{comment.content}</p>
                <div className="text-sm text-gray-400">
                  <span>用户ID: {comment.authorId}</span>
                  <span className="ml-4">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => approveMutation.mutate({ id: comment.id })}
                >
                  ✓ 批准
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/20"
                  onClick={() => rejectMutation.mutate({ id: comment.id })}
                >
                  ✕ 拒绝
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">没有待审核的评论</div>
        )}
      </div>
    </div>
  );
}

function TagsManagement() {
  const { data: tags } = trpc.tags.list.useQuery();
  const [newTag, setNewTag] = useState("");
  const createMutation = trpc.tags.create.useMutation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">标签管理</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入标签名称"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 bg-slate-700 border border-purple-500/20 rounded px-3 py-2 text-white placeholder-gray-500"
          />
          <Button
            onClick={() => {
              if (newTag.trim()) {
                createMutation.mutate({
                  name: newTag,
                  slug: newTag.toLowerCase().replace(/\s+/g, "-"),
                });
                setNewTag("");
              }
            }}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            添加
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tags?.map((tag: any) => (
          <Card
            key={tag.id}
            className="bg-slate-700/50 border-purple-500/20 p-4 text-center hover:border-purple-500/50 transition-colors"
          >
            <p className="font-bold text-cyan-400">{tag.name}</p>
            <p className="text-sm text-gray-400 mt-2">{tag.slug}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CategoriesManagement() {
  const { data: categories } = trpc.categories.list.useQuery();
  const [newCategory, setNewCategory] = useState("");
  const createMutation = trpc.categories.create.useMutation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">分类管理</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入分类名称"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-slate-700 border border-purple-500/20 rounded px-3 py-2 text-white placeholder-gray-500"
          />
          <Button
            onClick={() => {
              if (newCategory.trim()) {
                createMutation.mutate({
                  name: newCategory,
                  slug: newCategory.toLowerCase().replace(/\s+/g, "-"),
                });
                setNewCategory("");
              }
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            添加
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories?.map((category: any) => (
          <Card
            key={category.id}
            className="bg-slate-700/50 border-purple-500/20 p-4 text-center hover:border-purple-500/50 transition-colors"
          >
            <p className="font-bold text-purple-400">{category.name}</p>
            <p className="text-sm text-gray-400 mt-2">{category.slug}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
