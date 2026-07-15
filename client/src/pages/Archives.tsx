import { trpc } from "@/lib/trpc";

export default function Archives() {
  const { data: posts } = trpc.posts.list.useQuery({ page: 1, limit: 100 });

  const groupedByYear = (posts?.data || []).reduce((acc: any, post: any) => {
    const year = new Date(post.publishedAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        文章归档
      </h1>
      
      {Object.entries(groupedByYear).map(([year, yearPosts]: any) => (
        <div key={year} className="mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 border-l-4 border-cyan-400 pl-4">
            {year} 年
          </h2>
          <div className="space-y-4">
            {yearPosts.map((post: any) => (
              <div key={post.id} className="flex gap-4 text-gray-300 hover:text-cyan-400 transition-colors">
                <span className="text-sm text-gray-500 min-w-fit">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
                <span className="flex-1">{post.title}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
