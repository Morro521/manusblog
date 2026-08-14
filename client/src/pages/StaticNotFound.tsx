/** 地层信号设计基线：为 GitHub Pages 的静态 Hash 路由提供明确回退出口。 */
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
export default function StaticNotFound() { return <div className="empty-state"><p className="signal-label">404 / LOST SIGNAL</p><p>这个坐标暂时没有记录。回到首页，或从文章索引继续浏览。</p><Link href="/" className="text-link"><ArrowLeft size={16} /> 返回首页</Link></div>; }
