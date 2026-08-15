import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readSource = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("visual readability and language contract", () => {
  it("keeps the dark theme readable with elevated foreground and muted text tokens", () => {
    const css = readSource("client/src/index.css");

    expect(css).toContain("--background: #181b22");
    expect(css).toContain("--foreground: #f2f5f4");
    expect(css).toContain("--muted-foreground: #bac3ce");
    expect(css).toContain("--radius-lg: 1.05rem");
    expect(css).toContain("border-radius: 0.9rem");
  });

  it("uses layered rounded surfaces rather than a square archival shell on key visitor pages", () => {
    const sources = [
      readSource("client/src/pages/Home.tsx"),
      readSource("client/src/pages/PostsList.tsx"),
      readSource("client/src/pages/PostDetail.tsx"),
      readSource("client/src/pages/AuthPage.tsx"),
      readSource("client/src/pages/Archives.tsx"),
      readSource("client/src/pages/TagsPage.tsx"),
      readSource("client/src/pages/GalleryPage.tsx"),
    ].join("\n");

    expect(sources.match(/rounded-\[1\.(?:5|6|75)rem\]/g)?.length).toBeGreaterThanOrEqual(7);
    expect(sources).toContain("bg-[#202630]");
  });

  it("keeps the primary visitor copy concrete and natural in Chinese", () => {
    const home = readSource("client/src/pages/Home.tsx");
    const posts = readSource("client/src/pages/PostsList.tsx");
    const auth = readSource("client/src/pages/AuthPage.tsx");
    const editor = readSource("client/src/components/MarkdownEditor.tsx");
    const workspace = readSource("client/src/pages/PostWorkspace.tsx");
    const admin = readSource("client/src/pages/AdminDashboard.tsx");
    const archives = readSource("client/src/pages/Archives.tsx");
    const tags = readSource("client/src/pages/TagsPage.tsx");
    const gallery = readSource("client/src/pages/GalleryPage.tsx");
    const galleryDetail = readSource("client/src/pages/GalleryDetail.tsx");
    const upload = readSource("client/src/components/ImageUpload.tsx");

    expect(home).toContain("写给还在");
    expect(posts).toContain("读点真的");
    expect(auth).toContain("用自己的");
    expect(editor).toContain("预览会显示在这里");
    expect(workspace).toContain("我的文章");
    expect(workspace).toContain("还没有待续写的草稿。");
    expect(workspace).toContain("rounded-[1.6rem]");
    expect(workspace).not.toContain("AUTHOR WORKSPACE / PRIVATE INDEX");
    expect(workspace).not.toContain("DRAFT SHELF");
    expect(workspace).not.toContain("PUBLISHED INDEX");
    expect(admin).toContain("管理后台");
    expect(admin).toContain("正在验证管理员权限…");
    expect(admin).toContain("还没有文章");
    expect(admin).toContain("rounded-[1.6rem]");
    expect(admin).not.toContain("ADMIN CONSOLE / OWNER CLEARANCE");
    expect(admin).not.toContain("RESTRICTED CONSOLE");
    expect(archives).toContain("文章归档");
    expect(archives).toContain("正在读取归档…");
    expect(archives).not.toContain("CHRONOLOGICAL ARCHIVE");
    expect(tags).toContain("文章标签");
    expect(tags).toContain("还没有标签");
    expect(tags).not.toContain("SUBJECT INDEX / KEYWORDS");
    expect(gallery).toContain("图片集");
    expect(gallery).toContain("这里还没有公开图片集");
    expect(galleryDetail).toContain("找不到这个图片集");
    expect(galleryDetail).not.toContain("CABINET NOT FOUND");
    expect(upload).toContain("插入图片");
    expect(upload).toContain("已保存到站内存储");
    expect(upload).not.toContain("INSERT IMAGE");
    expect(upload).not.toContain("STORED ON S3");
    expect(`${home}\n${posts}\n${auth}`).not.toContain("ARCHIVE INDEX / VOL. 01");
    expect(`${home}\n${posts}\n${auth}`).not.toContain("PRIVATE ACCESS / ISSUE 01");
  });
});
