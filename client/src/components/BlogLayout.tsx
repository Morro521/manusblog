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
    ? <span className={mobile ? "font-mono text-[10px] tracking-[0.12em] text-stone-700" : "hidden font-mono text-[10px] tracking-[0.1em] text-stone-700 sm:block"}>AMBIENT OFFLINE</span>
    : <button onClick={toggleAudio} aria-pressed={audioPlaying} className={mobile ? "flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-stone-500 hover:text-[#c6edf0]" : "hidden items-center gap-1.5 px-2 py-2 font-mono text-[10px] tracking-[0.1em] text-stone-500 hover:text-[#c6edf0] sm:flex"} title="播放或暂停环境音乐">{audioPlaying ? <Pause size={12} /> : <Play size={12} />}{audioPlaying ? (mobile ? "PAUSE AMBIENT" : "PAUSE") : (mobile ? "PLAY AMBIENT" : "AMBIENT")}</button>;

  return <div className="site-shell text-stone-100"><header className="relative z-50 bg-[#10110f]"><div className="container flex min-h-[78px] items-center justify-between gap-5 border-b border-white/[0.15]"><button onClick={() => go("/")} className="flex min-w-0 items-center gap-3 text-left" aria-label="返回 MorroBlog 首页"><span className="grid h-8 w-8 place-items-center border border-[#c6edf0] text-[11px] font-medium text-[#c6edf0]">M</span><span className="min-w-0"><span className="block truncate font-mono text-xs tracking-[0.17em] text-stone-100">MORROBLOG</span><span className="hidden font-mono text-[9px] tracking-[0.12em] text-stone-500 sm:block">MIDNIGHT FIELD NOTES</span></span></button><nav className="hidden items-center gap-5 lg:flex" aria-label="主导航">{navItems.map((item) => { const active = location === item.href || (item.href !== "/" && location.startsWith(item.href)); return <button key={item.href} onClick={() => go(item.href)} className={`border-b py-1 text-sm transition-colors ${active ? "border-[#c6edf0] text-[#c6edf0]" : "border-transparent text-stone-500 hover:border-stone-500 hover:text-stone-200"}`}>{item.label}</button>; })}</nav><div className="flex items-center gap-2">{ambientControl()}{isAuthenticated ? <div className="hidden items-center gap-3 md:flex"><button onClick={() => go("/workspace")} className="max-w-24 truncate text-xs text-stone-500 hover:text-[#c6edf0]">{user?.name || "reader"}</button>{user?.role === "admin" && <button onClick={() => go("/admin")} className="text-xs text-stone-500 hover:text-stone-100">管理</button>}<Button onClick={() => go("/create")} size="sm" className="editorial-button editorial-button-primary px-3"><PenLine size={13} className="mr-1.5" /> 写作</Button><button onClick={() => logout()} className="text-xs text-stone-600 hover:text-[#e39a86]">登出</button></div> : <Button onClick={() => startLogin()} size="sm" className="editorial-button editorial-button-primary px-3">登录</Button>}<button onClick={() => setMobileMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center border border-white/15 text-stone-300 hover:border-[#c6edf0] lg:hidden" aria-label="切换导航菜单" aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}</button></div></div>{mobileMenuOpen && <div className="border-b border-white/[0.15] bg-[#10110f] lg:hidden"><div className="container grid py-4"><div className="grid border-y border-white/[0.12]">{navItems.map((item) => <button key={item.href} onClick={() => go(item.href)} className="border-b border-white/[0.1] py-3 text-left text-sm text-stone-300 last:border-b-0 hover:text-[#c6edf0]">{item.label}</button>)}</div><div className="mt-4 flex items-center justify-between">{ambientControl(true)}{isAuthenticated && <div className="flex items-center gap-4"><button onClick={() => go("/workspace")} className="font-mono text-[10px] tracking-[0.12em] text-stone-500 hover:text-[#c6edf0]">MY INDEX</button><button onClick={() => go("/create")} className="font-mono text-[10px] tracking-[0.12em] text-[#c6edf0]">NEW ENTRY +</button></div>}</div></div></div>}</header><main className="container relative z-10 py-10 sm:py-14">{children}</main><footer className="relative z-10 mt-12 border-t border-white/[0.15] bg-[#10110f] py-8 sm:mt-20 sm:py-11"><div className="container grid gap-8 text-xs sm:grid-cols-12 sm:items-end"><div className="sm:col-span-6"><p className="font-mono text-[10px] tracking-[0.16em] text-stone-300">MORROBLOG / MIDNIGHT FIELD NOTES</p><p className="mt-3 max-w-sm leading-6 text-stone-500">记录关于技术与创造的私人坐标。页面保持安静，内容保持可读。</p></div><div className="sm:col-span-3"><p className="editorial-kicker">READING ROOM</p><p className="mt-2 text-stone-500">文章、归档和图像被组织为一份可重新进入的私人索引。</p></div><div className="text-stone-600 sm:col-span-3 sm:text-right"><p>© 2026 MORRO</p><p className="mt-2 font-mono text-[10px] tracking-[0.1em]">ISSUE 01 / ONLINE</p></div></div></footer><audio ref={audioRef} loop preload="none" src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" onError={() => { setAudioPlaying(false); setAudioUnavailable(true); }} className="hidden" /></div>;
}
