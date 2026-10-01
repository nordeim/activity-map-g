"use client";

// The Leaflet canvas itself (browser-only; loaded via next/dynamic from
// MapExplorer). Basemap: CARTO light_nolabels tiles — session-65 re-measure:
// the live's /map serves the SAME minimal style as its route map (probed at
// the tile level: basemaps.cartocdn.com/light_nolabels/15/...), NOT Voyager.
// Session-65: the initial view is the live's FITBOUNDS model —
// fitBounds(9 places, {padding: [40, 40], maxZoom: 15}) — so the zoom is
// viewport-dependent (z13 @390 canvas 356×310, z14 @640, z15 @768+), the
// 9-pin cluster centered, and the view RE-FITS on every filter change (the
// pane translated -141px after the Restaurants pill on the live; the 390
// zoom climbed z13 → z14 after the Hotels pill). maxZoom is the live's 18.
// Markers (session-30 re-measure): 12px ink dots with a 2px white
// ring + hover-reveal name-label pills; clicking a pin navigates DIRECTLY to
// the place page (the live has no popup and no violet active state).

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { withCartoKey } from "@/lib/carto";
import type { PlaceDTO } from "@/types";

export function LeafletCanvas({
  places,
  activeSlug,
}: {
  places: PlaceDTO[];
  activeSlug: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  // Session-65: the mount fit runs instantly; later re-fits animate.
  const didInitialFitRef = useRef(false);
  const router = useRouter();

  const points = useMemo(
    () => places.filter((p) => p.lat != null && p.lng != null),
    [places],
  );

  // Keep a stable router reference for the marker click handlers (the
  // markers outlive re-renders; router identity from useRouter is stable
  // in practice but the ref guards the closure).
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // Session-65: no fixed center/zoom — the view is set by the fitBounds
    // below (the live's model). The map stays viewless until the fit runs,
    // so the first tile requests already carry the fitted zoom.
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });
    // Session-63: the basemap carries the operator's CARTO key
    // (src/lib/carto.ts) — the provider's anonymous raster access is
    // deprecated (keyless URLs serve the "API KEY REQUIRED" watermark).
    // Session-65: light_nolabels — the live's /map tile style (measured:
    // basemaps.cartocdn.com/light_nolabels/15/17375/11340.png), the same
    // minimal family as the route map; maxZoom is the live's measured 18
    // (22 clean zoom-ins from the z0 floor never leave 18).
    L.tileLayer(
      withCartoKey("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"),
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 18,
      },
    ).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers with the filtered places.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const wanted = new Set(points.map((p) => p.slug));

    for (const [slug, marker] of markers) {
      if (!wanted.has(slug)) {
        marker.remove();
        markers.delete(slug);
      }
    }

    for (const p of points) {
      if (markers.has(p.slug)) continue;
      const marker = L.marker([p.lat!, p.lng!], {
        icon: L.divIcon({
          className: "",
          html: `<span class="roam-marker" role="presentation"><span class="roam-marker-label">${escapeHtml(p.name)}</span></span>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
        title: p.name,
        alt: p.name,
      });
      // Session-30 (F5): the live's pin click navigates directly to the
      // place page — no popup, no active state. The router ref keeps the
      // marker handler stable across re-renders.
      marker.on("click", () => {
        routerRef.current.push(`/place/${encodeURIComponent(p.slug)}`);
      });
      marker.addTo(map);
      markers.set(p.slug, marker);
    }

    // Session-65: the live's view model — fitBounds(points, {padding:
    // [40, 40], maxZoom: 15}) — pinned by viewport discriminators (canvas
    // 362 → z13, 366 → z14, the 1278-canvas case capped at z15 by the
    // maxZoom). Instant on the first (mount) fit, animated on later
    // filter-driven re-fits (the live's pane translated smoothly). This
    // replaces the old guard-gated .pad(0.18) fit that never fired (the
    // fixed z14 view already contained the bounds center, so the guard
    // failed) and the old fixed center/zoom.
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat!, p.lng!] as L.LatLngTuple));
      if (!didInitialFitRef.current) {
        didInitialFitRef.current = true;
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: false });
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [points]);

  // Reflect the deep-link focus (?place=slug) by flying to the pin — the
  // violet data-active highlight is retired (session-30: the live has no
  // violet pin state); the pin click navigates instead of selecting.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeSlug) return;
    const point = points.find((p) => p.slug === activeSlug);
    if (point) {
      map.flyTo([point.lat!, point.lng!], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [activeSlug, points]);

  // Leaflet needs a manual invalidateSize when the container box changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-label="Augsburg places map" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
