import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const source = (file: string) => fs.readFileSync(path.join(projectRoot, file), "utf8");

describe("gallery empty and missing states", () => {
  it("gives visitors a truthful empty gallery state without fabricated image cards", () => {
    const galleryPage = source("client/src/pages/GalleryPage.tsx");

    expect(galleryPage).toContain("CABINET EMPTY");
    expect(galleryPage).toContain("这里只展示真实上传的图像，而不使用伪造的样例内容。");
    expect(galleryPage).toContain("登录并在后台创建图片集后");
  });

  it("turns a missing gallery into an immediate, recoverable return state", () => {
    const detail = source("client/src/pages/GalleryDetail.tsx");

    expect(detail).toContain("retry: false");
    expect(detail).toContain("CABINET NOT FOUND");
    expect(detail).toContain('navigate("/gallery")');
  });
});
