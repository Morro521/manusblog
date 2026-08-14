import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readSource = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("public interaction contract", () => {
  it("removes reserved Live2D messaging and deactivates ambient control after media failure", () => {
    const layout = readSource("client/src/components/BlogLayout.tsx");

    expect(layout).not.toContain("LIVE2D BAY");
    expect(layout).not.toContain("尚未接入角色资源");
    expect(layout).toContain("onError={() => { setAudioPlaying(false); setAudioUnavailable(true); }}");
    expect(layout).toContain("AMBIENT OFFLINE");
  });

  it("uses keyboard-reachable buttons for every public card that routes to a detail page", () => {
    const sources = [
      readSource("client/src/pages/Home.tsx"),
      readSource("client/src/pages/PostsList.tsx"),
      readSource("client/src/pages/Archives.tsx"),
      readSource("client/src/pages/GalleryPage.tsx"),
    ];

    sources.forEach((source) => expect(source).not.toMatch(/<article[^>]+onClick=/));
    expect(sources.join("\n")).toContain("aria-label={`阅读文章：${post.title}`}");
    expect(sources.join("\n")).toContain("aria-label={`打开图片集：${gallery.title}`}");
    expect(sources.join("\n")).not.toMatch(/<article[^>]+onClick=/);
  });

  it("honors the tag query used by detail and tag-index navigation", () => {
    const postsList = readSource("client/src/pages/PostsList.tsx");

    expect(postsList).toContain("const urlParams = new URLSearchParams(queryString)");
    expect(postsList).toContain("const tagFromUrl = urlParams.get(\"tag\")");
    expect(postsList).toContain("useState<string | null>(tagFromUrl)");
  });

  it("keeps category constraints in the tag-filter query branch and its matching total", () => {
    const dbSource = readSource("server/db.ts");

    expect(dbSource.match(/if \(filters\.tagSlug\)[\s\S]*?if \(filters\.categoryId\) conditions\.push\(eq\(posts\.categoryId, filters\.categoryId\)\);/g)?.length).toBe(2);
  });

  it("keeps the writing workspace focused on a publishable entry instead of exposing an unrecoverable draft action", () => {
    const createPost = readSource("client/src/pages/CreatePost.tsx");
    const markdownEditor = readSource("client/src/components/MarkdownEditor.tsx");

    expect(createPost).toContain('status: "published"');
    expect(createPost).not.toContain('submit("draft")');
    expect(createPost).not.toContain("草稿仅保存在你的工作台");
    expect(markdownEditor).toContain("sm:min-h-[640px]");
    expect(markdownEditor).toContain("min-h-[440px]");
  });
});
