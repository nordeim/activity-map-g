"use client";

// The Leaflet canvas itself (browser-only; loaded via next/dynamic from
// MapExplorer). Basemap: CARTO Voyager tiles (the reference app's carto.com
// basemap). Markers (session-30 re-measure): 12px ink dots with a 2px white
// ring + hover-reveal name-label pills; clicking a pin navigates DIRECTLY to
// the place page (the live has no popup and no violet active state).

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { withCartoKey } from "@/lib/carto";
import type { PlaceDTO } from "@/types";

const AUSGBURG_CENTER: L.LatLngExpression = [48.3713, 10.8982];

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
    const map = L.map(containerRef.current, {
      center: AUSGBURG_CENTER,
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });
    // Session-63: the Voyager basemap carries the operator's CARTO key
    // (src/lib/carto.ts) — the provider's anonymous raster access is
    // deprecated (keyless URLs serve the "API KEY REQUIRED" watermark).
    L.tileLayer(
      withCartoKey("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"),
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
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

    // Fit the view to the plotted points (once, when there are any).
    if (points.length > 0 && markers.size === points.length && !map.getBounds().contains(L.latLngBounds(points.map((p) => [p.lat!, p.lng!] as L.LatLngTuple)).getCenter())) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat!, p.lng!] as L.LatLngTuple)).pad(0.18), {
        animate: false,
      });
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
