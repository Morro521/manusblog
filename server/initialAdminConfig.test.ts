import { describe, expect, it } from "vitest";

describe("initial administrator configuration", () => {
  it("uses an explicit valid recipient email that is distinct from the SMTP sender", () => {
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const smtpSender = process.env.SMTP_USER?.trim().toLowerCase();

    expect(initialAdminEmail).toMatch(/^\S+@\S+\.\S+$/);
    expect(initialAdminEmail).not.toBe(smtpSender);
  });
});
