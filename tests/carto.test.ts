import { describe, expect, it } from "vitest";

// Session-63 (v2.27): the CARTO Basemaps API key — the provider deprecated
// anonymous raster-tile access (both sites' maps showed the "API KEY
// REQUIRED" watermark placeholder), and the operator supplied the account
// key (docs/carto_key.txt, committed non-secret). The contract: a shared
// module exposes the key (overridable via NEXT_PUBLIC_CARTO_KEY, defaulting
// to the committed key so the operator's keyless-env builds still get clean
// tiles) and a tiny URL helper that appends it as the ?key= query param.
import { CARTO_KEY, withCartoKey } from "@/lib/carto";

const KEY = "cb1_465p_1_988c53d611811b5d4bdb6b32";

describe("carto basemap key (session 63)", () => {
  it("defaults to the operator's committed key (the docs/carto_key.txt value)", () => {
    // The test env never sets NEXT_PUBLIC_CARTO_KEY, so the fallback must
    // be the committed key — a regression to "" (keyless, watermarked
    // tiles) fails here.
    expect(CARTO_KEY).toBe(KEY);
  });

  it("appends the key to a query-less tile URL", () => {
    expect(withCartoKey(`https://a.basemaps.cartocdn.com/light_nolabels/14/8697/5642.png`)).toBe(
      `https://a.basemaps.cartocdn.com/light_nolabels/14/8697/5642.png?key=${CARTO_KEY}`,
    );
  });

  it("keeps the Leaflet {z}/{x}/{y} template placeholders intact", () => {
    const url = withCartoKey("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png");
    expect(url).toBe(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    );
    // The placeholders survive verbatim (Leaflet substitutes them).
    expect(url).toContain("{s}");
    expect(url).toContain("{z}");
    expect(url).toContain("{x}");
    expect(url).toContain("{y}");
    expect(url).toContain("{r}");
  });

  it("joins with & when the URL already carries a query", () => {
    expect(withCartoKey("https://x.example/t.png?foo=1")).toBe(`https://x.example/t.png?foo=1&key=${CARTO_KEY}`);
  });
});
