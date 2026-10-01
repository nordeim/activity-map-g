import { describe, expect, it } from "vitest";
import { initials } from "@/lib/utils";

// Session-50: the avatar-derivation seam. The live's desktop navbar avatar
// flipped BACK to the session-14 contract (the third identity oscillation —
// Explorer→sepnetflix2023→Explorer→sepnetflix2023): the black 36×36 disc
// carries the white 14px/700 Inter INITIAL derived from the account email
// (not the account-agnostic lucide-user icon session 48 measured). This
// pins the letter-derivation rule the Navbar's `userEmail` wiring consumes
// (the E2E mobile-navigation spec pins the disc chrome itself).

describe("initials — the email-derived avatar letter (session-50 contract)", () => {
  it("derives the demo account's initial from its email", () => {
    expect(initials("sepnetflix2023@outlook.com")).toBe("S");
  });

  it("derives the guest account's initial from its email", () => {
    expect(initials("guest@roam.local")).toBe("G");
  });

  it("uppercases a lowercase first letter and ignores the rest", () => {
    expect(initials("augsburg.roam")).toBe("A");
  });

  it("falls back to ? for empty or whitespace-only input", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});
