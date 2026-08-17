export const primaryNavigationItems = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "归档", href: "/archives" },
  { label: "标签", href: "/tags" },
  { label: "图片集", href: "/gallery" },
  { label: "关于", href: "/about" },
] as const;

// 所有栏目在任意屏幕尺寸下直接渲染：手机端作为独立的六列导航，宽屏时靠右排列在会话操作前。
export const primaryNavigationLayout = "order-3 grid w-full grid-cols-6 items-stretch border-y border-white/[0.2] lg:order-2 lg:ml-auto lg:flex lg:w-auto lg:gap-5 lg:border-y-0";
