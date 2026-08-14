import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getGalleryById: vi.fn(),
  getGalleryImages: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const publicContext = { user: null, req: {}, res: {} } as unknown as TrpcContext;
const userContext = {
  user: { id: 6, openId: "reader-6", email: null, name: "Reader", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: {},
  res: {},
} as unknown as TrpcContext;

describe("gallery routes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a public gallery with its real ordered image records", async () => {
    const gallery = { id: 4, title: "Tokyo at night", description: "Field photographs", createdAt: new Date(), updatedAt: new Date() };
    const images = [{ id: 11, galleryId: 4, url: "/manus-storage/tokyo.webp", title: "Station", description: null, order: 0, createdAt: new Date() }];
    dbMocks.getGalleryById.mockResolvedValue(gallery);
    dbMocks.getGalleryImages.mockResolvedValue(images);

    await expect(appRouter.createCaller(publicContext).galleries.getById({ id: 4 })).resolves.toEqual({ ...gallery, images });
    expect(dbMocks.getGalleryImages).toHaveBeenCalledWith(4);
  });

  it("does not expose gallery creation to an ordinary user", async () => {
    await expect(appRouter.createCaller(userContext).galleries.create({ title: "Not allowed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
