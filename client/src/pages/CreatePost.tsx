import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import MarkdownEditor from "@/components/MarkdownEditor";

export default function CreatePost() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  
  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      navigate("/posts");
    },
  });

  if (!isAuthenticated) {
    return <div className="text-center py-12">请先登录</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-cyan-400">发布新文章</h1>
      
      <Input
        placeholder="文章标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-slate-800 border-purple-500/20"
      />
      
      <Input
        placeholder="URL Slug (例: my-first-post)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="bg-slate-800 border-purple-500/20"
      />
      
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="输入文章内容 (支持 Markdown)"
      />
      
      <Button
        onClick={() => createMutation.mutate({ title, slug, content, status: "published" })}
        disabled={createMutation.isPending}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
      >
        {createMutation.isPending ? "发布中..." : "发布文章"}
      </Button>
    </div>
  );
}
