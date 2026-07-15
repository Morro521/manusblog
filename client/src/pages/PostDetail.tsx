import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PostDetail() {
  const [match, params] = useRoute("/posts/:slug");
  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );

  if (isLoading) return <div className="text-center py-12">加载中...</div>;
  if (!post) return <div className="text-center py-12">文章不存在</div>;

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">{post.title}</h1>
      <div className="text-gray-400 mb-8">
        <span>👁 {post.viewCount} 次阅读</span>
      </div>
      <div className="prose prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </article>
  );
}
