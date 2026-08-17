import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CompactMusicPlayer } from "@/components/CompactMusicPlayer";
import { FullMusicPlayer } from "@/components/FullMusicPlayer";
import { getLyricAtTime, parseLrc, type LyricLine } from "@/lib/lyrics";
import { getAdjacentTrackIndex, morroPlaylist } from "@/lib/musicPlaylist";
import { primaryNavigationItems, primaryNavigationLayout } from "@/lib/siteNavigation";
import { chooseBackgroundImage, safeBackgroundImages } from "@/lib/backgroundGallery";
import { siteBrand } from "@/lib/siteBrand";
import { startLogin } from "@/const";
import { useLocation } from "wouter";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

type PlayerPosition = { left: number; top: number };
type DragSession = { pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean };
function formatClock(value: number) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  return `${Math.floor(safeValue / 60)}:${String(Math.floor(safeValue % 60)).padStart(2, "0")}`;
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [playerLevel, setPlayerLevel] = useState<1 | 2 | 3>(1);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition | null>(null);
  const [fullPanelPosition, setFullPanelPosition] = useState<PlayerPosition | null>(null);
  const [playerDragging, setPlayerDragging] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const keepPlayingOnTrackChange = useRef(false);
  const dragSession = useRef<DragSession | null>(null);
  const suppressPlayerClick = useRef(false);
  const track = morroPlaylist[trackIndex];
  const lyric = getLyricAtTime(lyricLines, currentTime);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const progressLabel = duration > 0 ? `${formatClock(currentTime)} / ${formatClock(duration)}` : "正在读取进度";
  const [backgroundImage, setBackgroundImage] = useState(() => safeBackgroundImages[0]);

  useEffect(() => {
    const savedId = sessionStorage.getItem("morroblog-background-id");
    const selected = safeBackgroundImages.find((image) => image.id === savedId) || chooseBackgroundImage();
    if (!selected) return;
    let active = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (active) {
        setBackgroundImage(selected);
        sessionStorage.setItem("morroblog-background-id", selected.id);
      }
    };
    image.onerror = () => sessionStorage.removeItem("morroblog-background-id");
    image.src = selected.src;
    return () => { active = false; };
  }, []);

  useEffect(() => { let active = true; setLyricLines([]); void fetch(track.lyricsUrl).then((response) => (response.ok ? response.text() : "")).then((source) => { if (active) setLyricLines(parseLrc(source)); }).catch(() => { if (active) setLyricLines([]); }); return () => { active = false; }; }, [track.lyricsUrl]);
  useEffect(() => { setCurrentTime(0); setDuration(0); setAudioUnavailable(false); audioRef.current?.load(); }, [trackIndex]);

  const playCurrentTrack = () => { const audio = audioRef.current; if (!audio || audioUnavailable) return; void audio.play().then(() => setAudioPlaying(true)).catch(() => { setAudioPlaying(false); setAudioUnavailable(true); }); };
  const toggleAudio = () => { const audio = audioRef.current; if (!audio || audioUnavailable) return; if (audio.paused) { playCurrentTrack(); return; } audio.pause(); setAudioPlaying(false); };
  const moveTrack = (direction: 1 | -1, shouldPlay = audioPlaying) => { keepPlayingOnTrackChange.current = shouldPlay; setTrackIndex((current) => getAdjacentTrackIndex(current, direction)); };
  const selectTrack = (nextIndex: number) => { keepPlayingOnTrackChange.current = audioPlaying; setTrackIndex(nextIndex); };
  const seekTo = (nextTime: number) => { const audio = audioRef.current; if (!audio || !Number.isFinite(nextTime)) return; audio.currentTime = nextTime; setCurrentTime(nextTime); };
  const go = (href: string) => navigate(href);
  const clampPlayerPosition = (left: number, top: number): PlayerPosition => { const inset = 12; const playerWidth = Math.min(window.innerWidth - inset * 2, 304); const playerHeight = 56; return { left: Math.min(Math.max(inset, left), Math.max(inset, window.innerWidth - playerWidth - inset)), top: Math.min(Math.max(inset, top), Math.max(inset, window.innerHeight - playerHeight - inset)) }; };
  const handlePlayerPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); dragSession.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); setPlayerDragging(true); };
  const handlePlayerPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => { const session = dragSession.current; if (!session || session.pointerId !== event.pointerId) return; if (Math.hypot(event.clientX - session.startX, event.clientY - session.startY) > 4) session.moved = true; if (!session.moved) return; event.preventDefault(); setPlayerPosition(clampPlayerPosition(event.clientX - session.offsetX, event.clientY - session.offsetY)); };
  const finishPlayerPointer = (event: ReactPointerEvent<HTMLDivElement>) => { const session = dragSession.current; if (!session || session.pointerId !== event.pointerId) return; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); suppressPlayerClick.current = session.moved; dragSession.current = null; setPlayerDragging(false); };
  const consumeDragClick = () => { const shouldSuppress = suppressPlayerClick.current; suppressPlayerClick.current = false; return shouldSuppress; };
  const sessionActions = () => !isAuthenticated ? <Button onClick={() => startLogin()} size="sm" className="editorial-button editorial-button-primary px-4">登录</Button> : <div className="flex items-center gap-3"><span className="hidden text-xs text-[#d0cfca] xl:inline">已登录</span>{isAdmin && <button onClick={() => go("/admin")} className="hidden items-center gap-1.5 border-b border-[#d0f4ee] py-2 text-xs text-[#d0f4ee] hover:text-white md:flex"><ShieldCheck size={13} />管理员视角</button>}<button onClick={() => logout()} className="hidden border-b border-transparent py-2 text-xs text-[#d0cfca] hover:border-[#eab78c] hover:text-[#fff0df] md:block">退出</button></div>;
  const compactPlayerStyle = playerPosition ? { left: `${playerPosition.left}px`, top: `${playerPosition.top}px` } : undefined;
  const compactPlayerPositionClass = playerPosition ? "" : "bottom-3 right-3 sm:bottom-5 sm:right-5";
  const getFullPanelPosition = () => {
    const inset = 12; const panelWidth = Math.min(window.innerWidth - inset * 2, 448); const panelHeight = Math.min(window.innerHeight - inset * 2, 520);
    const origin = playerPosition ?? { left: window.innerWidth - Math.min(window.innerWidth - inset * 2, 304) - 20, top: window.innerHeight - 56 - 20 };
    return { left: Math.min(Math.max(inset, origin.left), Math.max(inset, window.innerWidth - panelWidth - inset)), top: Math.min(Math.max(inset, origin.top), Math.max(inset, window.innerHeight - panelHeight - inset)) };
  };
  const openFullPanel = () => { setFullPanelPosition(getFullPanelPosition()); setPlayerLevel(3); };
  const fullPanelStyle = fullPanelPosition ? { left: `${fullPanelPosition.left}px`, top: `${fullPanelPosition.top}px` } : undefined;
  const fullPanelPositionClass = fullPanelPosition ? "" : "bottom-3 right-3 sm:bottom-5 sm:right-5";

  return <div className="site-shell text-[#f5f0e7]" data-background={backgroundImage?.id || "fallback"} style={{ "--site-background-image": backgroundImage ? `url(${backgroundImage.src})` : "none" } as React.CSSProperties}>
    <header className="relative z-50 bg-[#33414b]/72 backdrop-blur-xl"><div className="container flex min-h-[70px] flex-wrap items-center gap-x-4 border-b border-white/[0.25]"><button onClick={() => go("/")} className="order-1 flex min-w-0 items-center gap-3 py-3 text-left" aria-label="返回 MorroBlog 首页"><img src={siteBrand.avatarSrc} alt={siteBrand.avatarAlt} className="h-9 w-9 rounded-[0.7rem] border border-[#d0f4ee]/70 object-cover shadow-[0_6px_18px_rgb(7_15_22_/_22%)]" /><span className="min-w-0"><span className="block truncate font-mono text-xs font-medium tracking-[0.12em] text-[#fff8ed]">{siteBrand.name}</span><span className="hidden text-[10px] text-[#d0cfca] sm:block">{siteBrand.subtitle}</span></span></button><nav className={primaryNavigationLayout} aria-label="主要栏目">{primaryNavigationItems.map((item) => { const active = location === item.href || (item.href !== "/" && location.startsWith(item.href)); return <button key={item.href} onClick={() => go(item.href)} aria-current={active ? "page" : undefined} className={`min-w-0 border-b border-l border-white/[0.16] px-1 py-2 text-center text-xs transition-colors first:border-l-0 lg:border-l-0 lg:px-0 lg:py-2 lg:text-sm ${active ? "border-[#d0f4ee] text-[#d0f4ee]" : "border-transparent text-[#e5e2db] hover:border-white/[0.42] hover:text-white"}`}>{item.label}</button>; })}</nav><div className="order-2 flex items-center py-3 lg:order-3 lg:ml-4">{sessionActions()}</div></div></header>
    <main className="container relative z-10 py-8 sm:py-12">{children}</main>
    <footer className="relative z-10 mt-12 border-t border-white/[0.25] bg-[#2c3943]/54 py-9 sm:mt-20 sm:py-12"><div className="container grid gap-8 text-sm sm:grid-cols-12 sm:items-end"><div className="sm:col-span-6"><p className="font-mono text-[10px] font-medium tracking-[0.12em] text-[#fff8ed]">MORROBLOG</p><p className="mt-3 max-w-sm leading-6 text-[#e5e2db]">记录代码、工具、硬件与创作过程里的实际问题。内容不追求抢先，只求下次需要时还能找到。</p></div><div className="sm:col-span-3"><p className="text-xs font-medium text-[#fff8ed]">阅读线索</p><p className="mt-2 leading-6 text-[#d0cfca]">文章、归档和图片集会留在这里，方便按线索继续查找。</p></div><div className="text-xs text-[#d0cfca] sm:col-span-3 sm:text-right"><p>© 2026 MORRO</p><p className="mt-2">站点持续维护</p></div></div></footer>
    <CompactMusicPlayer level={playerLevel === 3 ? 2 : playerLevel} concealed={playerLevel === 3} onLevelChange={setPlayerLevel} track={track} trackIndex={trackIndex} audioPlaying={audioPlaying} audioUnavailable={audioUnavailable} currentTime={currentTime} duration={duration} progressLabel={progressLabel} positionClass={compactPlayerPositionClass} style={compactPlayerStyle} dragging={playerDragging} onOpenFull={openFullPanel} onPrevious={() => moveTrack(-1)} onNext={() => moveTrack(1)} onToggle={toggleAudio} onSeek={seekTo} onDragStart={handlePlayerPointerDown} onDragMove={handlePlayerPointerMove} onDragEnd={finishPlayerPointer} consumeDragClick={consumeDragClick} />
    <FullMusicPlayer visible={playerLevel === 3} positionClass={fullPanelPositionClass} style={fullPanelStyle} track={track} trackIndex={trackIndex} playlist={morroPlaylist} lyric={lyric} audioPlaying={audioPlaying} audioUnavailable={audioUnavailable} currentTime={currentTime} duration={duration} formatClock={formatClock} onReturnToControls={() => setPlayerLevel(2)} onPrevious={() => moveTrack(-1)} onNext={() => moveTrack(1)} onToggle={toggleAudio} onSeek={seekTo} onSelectTrack={selectTrack} />
    <audio ref={audioRef} preload="metadata" src={track.audioUrl} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)} onCanPlay={() => { if (keepPlayingOnTrackChange.current) { keepPlayingOnTrackChange.current = false; playCurrentTrack(); } }} onEnded={() => moveTrack(1, true)} onError={() => { setAudioPlaying(false); setAudioUnavailable(true); }} className="hidden" />
  </div>;
}
