import { describe, expect, it } from "vitest";
import { cookieSecureFlag, hashPassword, verifyPassword } from "@/lib/auth";

describe("cookieSecureFlag", () => {
  it("does not set the Secure flag on HTTP origins even in production", () => {
    expect(cookieSecureFlag("production", "http://localhost:3000")).toBe(false);
  });

  it("sets the Secure flag on HTTPS origins", () => {
    expect(cookieSecureFlag("production", "https://activity-map.jesspete.shop")).toBe(true);
  });

  it("falls back to NODE_ENV when the site URL is unset", () => {
    expect(cookieSecureFlag("production", "")).toBe(true);
    expect(cookieSecureFlag("development", "")).toBe(false);
  });
});

describe("password hashing", () => {
  it("round-trips a known password", () => {
    const stored = hashPassword("$Abcd1234");
    expect(verifyPassword("$Abcd1234", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
});
