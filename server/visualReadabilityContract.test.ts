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
    ].join("\n");

    expect(sources.match(/rounded-\[1\.(?:5|6|75)rem\]/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sources).toContain("bg-[#202630]");
  });

  it("keeps the primary visitor copy concrete and natural in Chinese", () => {
    const home = readSource("client/src/pages/Home.tsx");
    const posts = readSource("client/src/pages/PostsList.tsx");
    const auth = readSource("client/src/pages/AuthPage.tsx");
    const editor = readSource("client/src/components/MarkdownEditor.tsx");

    expect(home).toContain("写给还在");
    expect(posts).toContain("读点真的");
    expect(auth).toContain("用自己的");
    expect(editor).toContain("预览会显示在这里");
    expect(`${home}\n${posts}\n${auth}`).not.toContain("ARCHIVE INDEX / VOL. 01");
    expect(`${home}\n${posts}\n${auth}`).not.toContain("PRIVATE ACCESS / ISSUE 01");
  });
});
