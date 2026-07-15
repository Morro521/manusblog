import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <div className="text-center py-12">无权访问</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">管理后台</h1>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-slate-800 border border-purple-500/20">
          <TabsTrigger value="posts">文章管理</TabsTrigger>
          <TabsTrigger value="comments">评论审核</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="bg-slate-800/50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">文章管理</h2>
          <p className="text-gray-400">文章管理功能开发中...</p>
        </TabsContent>
        
        <TabsContent value="comments" className="bg-slate-800/50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">评论审核</h2>
          <p className="text-gray-400">评论审核功能开发中...</p>
        </TabsContent>
        
        <TabsContent value="users" className="bg-slate-800/50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">用户管理</h2>
          <p className="text-gray-400">用户管理功能开发中...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
