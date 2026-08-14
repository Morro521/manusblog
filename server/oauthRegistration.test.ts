import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const oauthSource = fs.readFileSync(path.resolve(import.meta.dirname, "_core/oauth.ts"), "utf8");

describe("OAuth first-login registration", () => {
  it("upserts the authenticated identity before creating its session", () => {
    const upsertIndex = oauthSource.indexOf("await db.upsertUser");
    const sessionIndex = oauthSource.indexOf("await sdk.createSessionToken");

    expect(upsertIndex).toBeGreaterThan(-1);
    expect(sessionIndex).toBeGreaterThan(upsertIndex);
    expect(oauthSource).toContain("openId: userInfo.openId");
    expect(oauthSource).toContain("lastSignedIn: new Date()");
  });
});
