import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn() }));
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

const now = new Date();
const ctx = {
  user: { id: 5, openId: "uploader-5", email: null, name: "Uploader", loginMethod: "manus", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
  req: {},
  res: {},
} as TrpcContext;

describe("media.uploadImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores an authenticated image and returns its public storage path", async () => {
    storageMocks.storagePut.mockResolvedValue({ key: "blog/5/images/record.png", url: "/manus-storage/blog/5/images/record.png" });
    const result = await appRouter.createCaller(ctx).media.uploadImage({
      fileName: "night signal.png",
      mimeType: "image/png",
      base64: Buffer.from("small-image").toString("base64"),
    });

    expect(result.url).toBe("/manus-storage/blog/5/images/record.png");
    expect(storageMocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^blog\/5\/images\//),
      expect.any(Buffer),
      "image/png"
    );
  });

  it("rejects an image that exceeds the 5MB binary limit", async () => {
    const oversizedBase64 = Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64");
    await expect(appRouter.createCaller(ctx).media.uploadImage({
      fileName: "oversized.png",
      mimeType: "image/png",
      base64: oversizedBase64,
    })).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });
});
