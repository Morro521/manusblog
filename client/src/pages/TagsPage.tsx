import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function TagsPage() {
  const { data: tags } = trpc.tags.list.useQuery();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        标签云
      </h1>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {tags?.map((tag: any) => (
          <Badge
            key={tag.id}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 cursor-pointer px-4 py-2 text-base"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
