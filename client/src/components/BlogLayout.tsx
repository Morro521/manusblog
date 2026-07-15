import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { startLogin } from "@/const";
import { Music, Menu, X } from "lucide-react";
import { useState } from "react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 初始化樱花粒子效果
  useEffect(() => {
    const createSakuraParticle = () => {
      const particle = document.createElement("div");
      particle.className = "sakura-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = "-10px";
      particle.style.opacity = String(Math.random() * 0.7 + 0.3);
      particle.style.animation = `sakuraFall ${Math.random() * 3 + 2}s linear forwards`;
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 5000);
    };

    const interval = setInterval(createSakuraParticle, 300);
    return () => clearInterval(interval);
  }, []);

  // 自动播放背景音乐
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // 浏览器可能阻止自动播放，用户需要交互
      });
    }
  }, []);

  const navItems = [
    { label: "首页", href: "/" },
    { label: "文章", href: "/posts" },
    { label: "归档", href: "/archives" },
    { label: "标签", href: "/tags" },
    { label: "图片集", href: "/gallery" },
    { label: "关于", href: "/about" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* 背景星空效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="stars"></div>
      </div>

      {/* 樱花粒子容器 */}
      <style>{`
        @keyframes sakuraFall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .sakura-particle {
          position: fixed;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, rgba(255,192,203,0.8), rgba(255,182,193,0.4));
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
          box-shadow: 0 0 10px rgba(255,192,203,0.6);
        }
        
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, rgba(255,255,255,0.8), rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>

      {/* 顶部导航栏 */}
      <nav className="relative z-50 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            >
              MorroBlog
            </h1>
          </div>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (audioRef.current.paused) {
                    audioRef.current.play();
                  } else {
                    audioRef.current.pause();
                  }
                }
              }}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              title="音乐播放器"
            >
              <Music size={20} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{user?.name}</span>
                {user?.role === "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                  >
                    管理
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => navigate("/create")}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  发文章
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logout()}
                  className="border-red-500 text-red-400 hover:bg-red-500/20"
                >
                  登出
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => startLogin()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                登录
              </Button>
            )}

            {/* 移动菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 移动菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-purple-500/20 py-4 px-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Live2D 看板娘占位区 */}
      <div className="fixed bottom-4 right-4 z-40 w-32 h-40 bg-gradient-to-b from-purple-500/20 to-transparent border border-purple-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
        <div className="text-center text-xs text-gray-400">
          <div className="text-2xl mb-2">✨</div>
          <p>Live2D</p>
          <p>看板娘</p>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* 背景音乐播放器 */}
      <audio
        ref={audioRef}
        loop
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        className="hidden"
      />

      {/* 页脚 */}
      <footer className="relative z-20 border-t border-purple-500/20 bg-slate-950/80 backdrop-blur-md mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 MorroBlog - 沉浸式宇宙美学博客系统</p>
          <p className="mt-2">Powered by Next.js + React + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
