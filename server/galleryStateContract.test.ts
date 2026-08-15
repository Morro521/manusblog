import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const source = (file: string) => fs.readFileSync(path.join(projectRoot, file), "utf8");

describe("gallery empty and missing states", () => {
  it("gives visitors a truthful empty gallery state without fabricated image cards", () => {
    const galleryPage = source("client/src/pages/GalleryPage.tsx");

    expect(galleryPage).toContain("这里还没有公开图片集");
    expect(galleryPage).toContain("公开展示的图片均来自真实上传，不用示例内容填充。");
    expect(galleryPage).toContain("管理员创建图片集并上传真实图片后");
  });

  it("turns a missing gallery into an immediate, recoverable return state", () => {
    const detail = source("client/src/pages/GalleryDetail.tsx");

    expect(detail).toContain("retry: false");
    expect(detail).toContain("找不到这个图片集");
    expect(detail).toContain('navigate("/gallery")');
  });
});
