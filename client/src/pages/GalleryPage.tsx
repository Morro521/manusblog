import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

export default function GalleryPage() {
  const { data: galleries } = trpc.galleries.list.useQuery({ page: 1, limit: 20 });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        图片集
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries?.map((gallery: any) => (
          <Card key={gallery.id} className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-colors">
            <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-4xl">📸</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-cyan-400">{gallery.title}</h3>
              <p className="text-sm text-gray-400 mt-2">{gallery.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
