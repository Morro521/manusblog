import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useRef, useState } from "react";
import { startLogin } from "@/const";
import { Menu, Pause, PenLine, Play, X } from "lucide-react";

const navItems = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "归档", href: "/archives" },
  { label: "标签", href: "/tags" },
  { label: "图片集", href: "/gallery" },
  { label: "关于", href: "/about" },
];

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (!audioRef.current || audioUnavailable) return;
    if (audioRef.current.paused) {
      void audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioUnavailable(true));
      return;
    }
    audioRef.current.pause();
    setAudioPlaying(false);
  };

  const go = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const ambientControl = (mobile = false) => audioUnavailable
    ? <span className={mobile ? "text-xs text-slate-400" : "hidden text-xs text-slate-400 sm:block"}>环境音不可用</span>
    : <button onClick={toggleAudio} aria-pressed={audioPlaying} className={mobile ? "flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-200 hover:bg-white/[0.08] hover:text-[#bce8eb]" : "hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-[#bce8eb] sm:flex"} title="播放或暂停环境音乐">{audioPlaying ? <Pause size={13} /> : <Play size={13} />}{audioPlaying ? "暂停环境音" : "播放环境音"}</button>;

  return (
    <div className="site-shell text-slate-100">
      <header className="relative z-50 bg-[#181b22]/94 backdrop-blur-xl">
        <div className="container flex min-h-[76px] items-center justify-between gap-4 border-b border-white/[0.12]">
          <button onClick={() => go("/")} className="flex min-w-0 items-center gap-3 text-left" aria-label="返回 MorroBlog 首页">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#bce8eb]/70 bg-[#bce8eb]/10 text-[11px] font-semibold text-[#d9fcfd]">M</span>
            <span className="min-w-0">
              <span className="block truncate font-mono text-xs font-medium tracking-[0.12em] text-white">MORROBLOG</span>
              <span className="hidden text-[10px] text-slate-400 sm:block">个人技术笔记</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
            {navItems.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return <button key={item.href} onClick={() => go(item.href)} aria-current={active ? "page" : undefined} className={`rounded-full px-3 py-2 text-sm transition-colors ${active ? "bg-[#bce8eb]/14 text-[#d7fbfc]" : "text-slate-300 hover:bg-white/[0.08] hover:text-white"}`}>{item.label}</button>;
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {ambientControl()}
            {isAuthenticated ? <div className="hidden items-center gap-2 md:flex"><button onClick={() => go("/workspace")} className="max-w-24 truncate rounded-lg px-2 py-2 text-xs text-slate-200 hover:bg-white/[0.08] hover:text-[#bce8eb]">{user?.name || "我的文章"}</button>{user?.role === "admin" && <button onClick={() => go("/admin")} className="rounded-lg px-2 py-2 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white">管理</button>}<Button onClick={() => go("/create")} size="sm" className="editorial-button editorial-button-primary px-3"><PenLine size={13} className="mr-1.5" /> 写文章</Button><button onClick={() => logout()} className="rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-[#efaa91]/10 hover:text-[#ffd1c4]">退出</button></div> : <Button onClick={() => startLogin()} size="sm" className="editorial-button editorial-button-primary px-4">登录</Button>}
            <button onClick={() => setMobileMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.18] bg-white/[0.05] text-slate-100 transition-colors hover:border-[#bce8eb] hover:bg-[#bce8eb]/10 lg:hidden" aria-label="切换导航菜单" aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>

        {mobileMenuOpen && <div className="border-b border-white/[0.12] bg-[#1d222b]/98 px-0 py-3 lg:hidden"><div className="container"><div className="grid overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.04] p-1.5">{navItems.map((item) => { const active = location === item.href || (item.href !== "/" && location.startsWith(item.href)); return <button key={item.href} onClick={() => go(item.href)} className={`rounded-xl px-4 py-3 text-left text-sm transition-colors ${active ? "bg-[#bce8eb]/14 text-[#d7fbfc]" : "text-slate-200 hover:bg-white/[0.08]"}`}>{item.label}</button>; })}</div><div className="mt-3 flex items-center justify-between rounded-2xl border border-white/[0.1] bg-white/[0.04] px-2 py-1.5">{ambientControl(true)}{isAuthenticated && <div className="flex items-center gap-1"><button onClick={() => go("/workspace")} className="rounded-lg px-2 py-2 text-xs text-slate-200 hover:bg-white/[0.08]">我的文章</button><button onClick={() => go("/create")} className="rounded-lg bg-[#bce8eb]/12 px-2 py-2 text-xs text-[#d7fbfc]">写文章</button></div>}</div></div></div>}
      </header>

      <main className="container relative z-10 py-8 sm:py-12">{children}</main>

      <footer className="relative z-10 mt-12 border-t border-white/[0.12] bg-[#15191f]/86 py-9 sm:mt-20 sm:py-12"><div className="container grid gap-8 text-sm sm:grid-cols-12 sm:items-end"><div className="sm:col-span-6"><p className="font-mono text-[10px] font-medium tracking-[0.12em] text-slate-200">MORROBLOG</p><p className="mt-3 max-w-sm leading-6 text-slate-300">记录代码、工具、硬件与创作过程中的真实问题。这里不追求快，只希望内容经得起回看。</p></div><div className="sm:col-span-3"><p className="text-xs font-medium text-slate-100">慢慢读</p><p className="mt-2 leading-6 text-slate-400">文章、归档和图片会留在这里，方便下次继续。</p></div><div className="text-xs text-slate-400 sm:col-span-3 sm:text-right"><p>© 2026 MORRO</p><p className="mt-2">持续更新中</p></div></div></footer>
      <audio ref={audioRef} loop preload="none" src="/manus-storage/smile-drone-ambient_a15c3c11.mp3" onError={() => { setAudioPlaying(false); setAudioUnavailable(true); }} className="hidden" />
    </div>
  );
}
