// The CARTO Basemaps API key (session-63, v2.27).
//
// The provider deprecated anonymous raster-tile access — keyless
// basemaps.cartocdn.com URLs now return a 2049B "API KEY REQUIRED"
// watermark placeholder instead of the map. The operator supplied the
// account key (docs/carto_key.txt — committed, non-secret material):
// append it as the ?key= query param and the real tiles return
// (verified: the route's 5×5 light_nolabels grid serves real imagery keyed,
// only the NW rural corner is a legitimately featureless 103B tile).
//
// Override for a different account via NEXT_PUBLIC_CARTO_KEY. The default
// is the committed key so the operator's keyless-env production builds
// still get clean tiles (the value is public in docs/carto_key.txt).

export const CARTO_KEY: string =
  process.env.NEXT_PUBLIC_CARTO_KEY ?? "cb1_465p_1_988c53d611811b5d4bdb6b32";

/**
 * Appends the CARTO Basemaps key as the `?key=` query param of a tile URL
 * (joining with `&` when the URL already carries a query). Leaflet's
 * `{s}/{z}/{x}/{y}/{r}` placeholders pass through verbatim.
 */
export function withCartoKey(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}key=${CARTO_KEY}`;
}
