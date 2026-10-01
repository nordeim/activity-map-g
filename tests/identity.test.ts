import { describe, expect, it } from "vitest";
import {
  ANON_PROFILE_SUBTITLE,
  GUEST_EMAIL,
  GUEST_NAME,
  avatarIsIcon,
  isGuestEmail,
  profileSubtitle,
} from "@/lib/identity";

// v2.21: the identity seam. The live went OPEN — anonymous visitors browse
// every page, and their state renders its OWN identity surfaces: the
// profile h1 "Explorer" + the STATIC "Your Roam account" 16px subtitle, and
// the desktop navbar avatar as the white 17px stroke-2 lucide-user glyph on
// the black disc. The clone's guest account (guest@roam.local) IS its
// anonymous state, so the guest renders the anonymous contract — while the
// AUTHENTICATED contracts stay as v2.20 pinned them (the demo account's
// h1/subtitle = name + email, the desktop avatar = the email-derived
// initial). The seam decides which contract a session renders, purely and
// client-safely (the Navbar and ProfileView are client components — the
// module must never import node: or server-only code).

describe("identity — the guest/anonymous contract seam (v2.21)", () => {
  it("pins the guest constants (the single source of truth)", () => {
    expect(GUEST_EMAIL).toBe("guest@roam.local");
    expect(GUEST_NAME).toBe("Explorer");
    expect(ANON_PROFILE_SUBTITLE).toBe("Your Roam account");
  });

  it("recognizes the guest email (case- and whitespace-insensitive)", () => {
    expect(isGuestEmail("guest@roam.local")).toBe(true);
    expect(isGuestEmail("  Guest@Roam.Local ")).toBe(true);
  });

  it("does not classify the demo account (or any real account) as guest", () => {
    expect(isGuestEmail("sepnetflix2023@outlook.com")).toBe(false);
    expect(isGuestEmail("ada@example.com")).toBe(false);
    expect(isGuestEmail("")).toBe(false);
  });

  it("renders the static anonymous subtitle for the guest, the email otherwise", () => {
    expect(profileSubtitle("guest@roam.local")).toBe("Your Roam account");
    expect(profileSubtitle("sepnetflix2023@outlook.com")).toBe("sepnetflix2023@outlook.com");
  });

  it("renders the lucide-user icon avatar for the guest, the email initial otherwise", () => {
    expect(avatarIsIcon("guest@roam.local")).toBe(true);
    expect(avatarIsIcon("sepnetflix2023@outlook.com")).toBe(false);
  });
});
