import { describe, expect, it } from "vitest";
import { getHitokotoQuote, type QuoteFetch } from "./hitokoto";

describe("公开一言接口", () => {
  it("映射 hitokoto 与 from 字段，不向首页泄露第三方原始响应", async () => {
    const fetcher: QuoteFetch = async () => new Response(JSON.stringify({ hitokoto: "知其不可奈何而安之若命。", from: "庄子" }), { status: 200 });

    await expect(getHitokotoQuote(fetcher)).resolves.toEqual({ text: "知其不可奈何而安之若命。", source: "庄子", fallback: false });
  });

  it("在网络或响应异常时返回稳定中文回退", async () => {
    const unavailable: QuoteFetch = async () => { throw new Error("offline"); };
    const malformed: QuoteFetch = async () => new Response(JSON.stringify({ from: "缺少正文" }), { status: 200 });

    await expect(getHitokotoQuote(unavailable)).resolves.toMatchObject({ fallback: true, source: "MorroBlog · 本地回退" });
    await expect(getHitokotoQuote(malformed)).resolves.toMatchObject({ fallback: true });
  });
});
