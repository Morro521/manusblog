/**
 * 地层信号设计基线：固定的坐标式导航把个人主页、技术档案和 GitHub
 * 连接为一个可追溯的入口，避免使用任何运行时身份或服务端状态。
 */
import { ExternalLink, Github, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { assetUrl, siteLinks } from "@/data/site";

const navigation = [["首页", "/"], ["文章", "/posts"], ["归档", "/archives"], ["标签", "/tags"], ["关于", "/about"]] as const;
const isActive = (pathname: string, href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return <div className="site-shell">
    <header className="site-header"><div className="site-header__inner">
      <Link href="/" className="brand-lockup" onClick={closeMenu} aria-label="返回 MorroBlog 首页"><img src={assetUrl("morro-mark.png")} alt="Morro 标志" className="brand-mark" /><span><span className="brand-name">MORROBLOG</span><span className="brand-subline">FIELD NOTES / 2026</span></span></Link>
      <nav className="site-nav" aria-label="主导航">{navigation.map(([label, href]) => <Link key={href} href={href} className={isActive(location, href) ? "site-nav__link site-nav__link--active" : "site-nav__link"}>{label}</Link>)}</nav>
      <div className="site-actions"><a href={siteLinks.home} target="_blank" rel="noreferrer" className="site-action site-action--quiet">主页 <ExternalLink size={13} strokeWidth={1.7} /></a><a href={siteLinks.github} target="_blank" rel="noreferrer" className="site-action" aria-label="访问 Morro 的 GitHub"><Github size={16} strokeWidth={1.7} /><span className="site-action__label">GitHub</span></a><button className="menu-toggle" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="切换导航菜单" aria-expanded={mobileOpen}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
    </div>{mobileOpen && <nav className="mobile-nav" aria-label="移动端主导航">{navigation.map(([label, href], index) => <Link key={href} href={href} onClick={closeMenu} className="mobile-nav__link"><span>0{index + 1}</span>{label}</Link>)}<a href={siteLinks.home} target="_blank" rel="noreferrer" className="mobile-nav__link"><span>↗</span>访问个人主页</a></nav>}</header>
    <main className="site-main">{children}</main>
    <footer className="site-footer"><div className="site-footer__grid"><div><p className="signal-label">MORROBLOG / FIELD NOTES</p><p className="site-footer__copy">记录自托管、网络、硬件与个人技术实验。本站由静态文件构成，可直接随 GitHub 版本发布。</p></div><div className="site-footer__links"><a href={siteLinks.home} target="_blank" rel="noreferrer">Morro 主页 <ExternalLink size={12} /></a><a href={siteLinks.blog} target="_blank" rel="noreferrer">原始博客 <ExternalLink size={12} /></a><a href={siteLinks.github} target="_blank" rel="noreferrer">GitHub <ExternalLink size={12} /></a></div><p className="site-footer__meta">© 2026 MORRO<br />STATIC / GITHUB READY</p></div></footer>
  </div>;
}
