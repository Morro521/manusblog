import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readSource = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("visitor-first navigation contract", () => {
  it("keeps the global navigation focused on public reading and reserves the role switch for admins", () => {
    const layout = readSource("client/src/components/BlogLayout.tsx");

    expect(layout).toContain('const isAdmin = isAuthenticated && user?.role === "admin"');
    expect(layout).toContain('go("/admin")');
    expect(layout).toContain("管理员视角");
    expect(layout).toContain("已登录");
    expect(layout).toContain("退出");
    expect(layout).not.toContain('go("/workspace")');
    expect(layout).not.toContain('go("/create")');
    expect(layout).not.toContain("写文章");
  });

  it("keeps the home hero visitor-led and turns the privileged action into an admin view", () => {
    const home = readSource("client/src/pages/Home.tsx");

    expect(home).toContain('const isAdmin = isAuthenticated && user?.role === "admin"');
    expect(home).toContain('navigate("/admin")');
    expect(home).toContain("进入管理员视角");
    expect(home).toContain("浏览文章");
    expect(home).not.toContain('navigate("/create")');
    expect(home).not.toContain("登录后写一篇");
  });
});
