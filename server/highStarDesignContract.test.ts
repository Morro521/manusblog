import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readSource = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("high-star design research contract", () => {
  it("keeps the GitHub research record and its explicit non-copying boundary", () => {
    const research = readSource("DESIGN_RESEARCH_HIGH_STAR.md");

    expect(research).toContain("TryGhost/Ghost");
    expect(research).toContain("ueberdosis/tiptap");
    expect(research).toContain("hexojs/hexo");
    expect(research).toContain("adityatelange/hugo-PaperMod");
    expect(research).toContain("不复刻任何项目的视觉成品");
  });

  it("keeps the public reading path content-first and URL-restorable", () => {
    const home = readSource("client/src/pages/Home.tsx");
    const posts = readSource("client/src/pages/PostsList.tsx");
    const detail = readSource("client/src/pages/PostDetail.tsx");

    expect(home).toContain("此刻一言");
    expect(home).toContain("换一句");
    expect(home).toContain("全部文章");
    expect(home).toContain("formatReadingTime(post.content || \"\")");
    expect(home).toContain('aria-label="继续探索"');
    expect(posts).toContain("筛选条件会写进链接");
    expect(posts).toContain("buildPostIndexLocation");
    expect(posts).toContain("const [filtersOpen, setFiltersOpen]");
    expect(posts).toContain('aria-pressed={selectedTag === tag.slug}');
    expect(posts).toContain('aria-pressed={selectedCategory === String(category.id)}');
    expect(detail).toContain("等待审核");
    expect(detail).toContain("回复作者 #{comment.authorId}");
    expect(detail).not.toContain("PENDING REVIEW");
    expect(detail).not.toContain("Observer #");
  });

  it("keeps writing status truthful, the body accessible, and mobile settings distinct from desktop", () => {
    const createPost = readSource("client/src/pages/CreatePost.tsx");
    const editor = readSource("client/src/components/MarkdownEditor.tsx");

    expect(createPost).toContain("const [cleanSnapshot, setCleanSnapshot]");
    expect(createPost).toContain("有未保存的修改");
    expect(createPost).toContain("草稿已保存");
    expect(createPost).toContain("rounded-t-[1.1rem]");
    expect(createPost).toContain("sm:inset-y-0");
    expect(editor).toContain('aria-label="文章正文"');
    expect(editor).toContain("const characterCount = value.replace");
    expect(editor).toContain("正文 {characterCount.toLocaleString()} 字");
  });

  it("keeps the fixed player compact until the visitor asks for full controls", () => {
    const layout = readSource("client/src/components/BlogLayout.tsx");
    const compactPlayer = readSource("client/src/components/CompactMusicPlayer.tsx");
    const fullPlayer = readSource("client/src/components/FullMusicPlayer.tsx");

    expect(layout).toContain("progressLabel");
    expect(layout).toContain("FullMusicPlayer");
    expect(compactPlayer).toContain("可拖拽的紧凑音乐播放器");
    expect(compactPlayer).toContain("compact-music-player--idle");
    expect(fullPlayer).toContain('aria-label="音乐播放器"');
    expect(fullPlayer).toContain("选择歌曲");
    const css = readSource("client/src/index.css");
    expect(css).toContain("compact-player-controls-in");
    expect(css).toContain("compact-music-player.cursor-grabbing");
  });
});
