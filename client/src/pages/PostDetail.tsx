import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { MessageCircle, Eye, Calendar, User } from "lucide-react";

export default function PostDetail() {
  const [match, params] = useRoute("/posts/:slug");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");

  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );

  const { data: comments } = trpc.comments.list.useQuery(
    { postId: post?.id || 0 },
    { enabled: !!post?.id }
  );

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentContent("");
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">文章不存在</h1>
        <Button
          onClick={() => navigate("/posts")}
          className="bg-gradient-to-r from-cyan-500 to-purple-500"
        >
          返回文章列表
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 文章头部 */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>用户 #{post.authorId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '未发布'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span>{post.viewCount} 次阅读</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span>{comments?.data?.length || 0} 条评论</span>
          </div>
        </div>

        {post.excerpt && (
          <p className="text-lg text-gray-300 italic">{post.excerpt}</p>
        )}
      </div>

      {/* 文章内容 */}
      <Card className="bg-slate-800/50 border-purple-500/20 p-8">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold text-cyan-400 mb-4 mt-6" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold text-purple-400 mb-3 mt-5" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-bold text-pink-400 mb-2 mt-4" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
              ),
              code: ({ node, inline, className, children, ...props }: any) =>
                inline ? (
                  <code className="bg-slate-900 text-cyan-400 px-2 py-1 rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="block bg-slate-900 text-gray-300 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                    {children}
                  </code>
                ),
              pre: ({ node, ...props }) => (
                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-cyan-400 pl-4 py-2 italic text-gray-400 mb-4"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />
              ),
              table: ({ node, ...props }) => (
                <table className="w-full border-collapse border border-purple-500/30 mb-4" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-purple-500/30 bg-slate-900 text-cyan-400 p-2 text-left" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-purple-500/30 p-2 text-gray-300" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-cyan-400 hover:text-purple-400 underline" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="max-w-full h-auto rounded-lg my-4" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </Card>

      {/* 评论区 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">评论区</h2>

        {isAuthenticated ? (
          <Card className="bg-slate-800/50 border-purple-500/20 p-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full bg-slate-700 border border-purple-500/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-24"
            />
            <Button
              onClick={() => {
                if (commentContent.trim() && post.id) {
                  createCommentMutation.mutate({
                    postId: post.id,
                    content: commentContent,
                  });
                }
              }}
              disabled={createCommentMutation.isPending || !commentContent.trim()}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              {createCommentMutation.isPending ? "发布中..." : "发布评论"}
            </Button>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-purple-500/20 p-6 text-center">
            <p className="text-gray-400 mb-4">请登录后发表评论</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
            >
              返回首页登录
            </Button>
          </Card>
        )}

        {/* 评论列表 */}
        <div className="space-y-4">
          {comments?.data && comments.data.length > 0 ? (
            comments.data.map((comment: any) => (
              <Card
                key={comment.id}
                className="bg-slate-800/50 border-purple-500/20 p-4 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-cyan-400">用户 #{comment.authorId}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              还没有评论，成为第一个评论者吧！
            </div>
          )}
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="text-center">
        <Button
          onClick={() => navigate("/posts")}
          variant="outline"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
        >
          ← 返回文章列表
        </Button>
      </div>
    </div>
  );
}
