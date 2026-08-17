import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const homeSource = () => fs.readFileSync(path.join(projectRoot, "client/src/pages/Home.tsx"), "utf8");

describe("content-first home page", () => {
  it("renders a featured article before the remaining latest articles", () => {
    const home = homeSource();

    expect(home).toContain('splitHomePosts<any>(posts?.data ?? [])');
    expect(home.indexOf("本期精选")).toBeLessThan(home.indexOf("最新文章"));
    expect(home).toContain("latest.map");
  });

  it("keeps the primary reading path responsive without a login call to action in the home body", () => {
    const home = homeSource();

    expect(home).toContain("lg:grid-cols-12");
    expect(home).toContain("sm:text-5xl");
    expect(home).toContain("sm:grid-cols-[auto_minmax(0,1fr)_170px]");
    expect(home).not.toContain("startLogin");
  });
});
