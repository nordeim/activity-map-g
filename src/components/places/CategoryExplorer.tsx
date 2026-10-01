"use client";

// The shared Eat / Stay / Do browse surface (session-8 re-measure): the
// serif headline (clamp 36→55px, ls −0.06em) + subtitle, the UNIFIED
// browse planner (one white card on phones / one sticky white pill from
// md — search + labelled date/people fields + the two circular icon
// actions; see BrowsePlanner), the horizontally-scrolling filter-chip
// row, and the max-w-7xl responsive card grid.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CategoryMeta, PlaceDTO } from "@/types";
import { FILTER_CHIPS, filterPlaces } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { PlaceCard } from "./PlaceCard";
import { StayCard } from "./StayCard";
import { BrowsePlanner } from "@/components/planner/BrowsePlanner";

export function CategoryExplorer({
  meta,
  places,
  planner,
}: {
  meta: CategoryMeta;
  places: PlaceDTO[];
  planner?: { people: number; start: string | null; end: string | null };
}) {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const chipsAvailable = FILTER_CHIPS[meta.key];

  const visible = useMemo(() => filterPlaces(places, query, chips), [places, query, chips]);

  function toggleChip(label: string) {
    setChips((prev) => {
      if (label === "All") return prev.includes("All") ? [] : ["All"];
      const withoutAll = prev.filter((c) => c !== "All");
      return withoutAll.includes(label)
        ? withoutAll.filter((c) => c !== label)
        : [...withoutAll, label];
    });
  }

  return (
    <main className="w-full">
      {/* Headline — session-14 re-measure: the live's section runs
          px-5/pt-16 → md:px-8/md:pt-24 (h1 y≈168) and the heading block
          spans the full max-w-7xl width; the subtitle is 14px #3A3A3A.
          Session-18 re-measure: the browse heading is now a FULL-BLEED
          relative section carrying the 18px graph-paper grid texture at
          40% opacity — and the live's textured block WRAPS the planner +
          the filter chips too (section h≈385 at 1280), not just the h1.
          The live's mobile padding computes to 16px (px-4). */}
      <section className="relative overflow-visible px-4 pb-[22px] pt-[60px] md:px-8 md:pb-8 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(20,20,19,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.055)_1px,transparent_1px)] [background-size:18px_18px]"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-7xl text-center">
            {/* Session-57 (v2.24): the live's h1 — leading 0.92, no own
                margin (the subtitle's mt carries the gap). */}
            <h1 className="font-serif text-[clamp(42px,13vw,55px)] font-normal leading-[0.92] tracking-[-0.06em] text-ink">
              {meta.title}
            </h1>
            {/* Session-57 (v2.24): the live's subtitle — the centered
                max-w-xl block (mx-auto mt-6 at md) with the phones'
                computed 14px mt + the 24px inner inset (px-6). The live's
                leading-7 computes to 20px — text-sm's own default — so no
                leading class is needed. */}
            <p className="mx-auto mt-3.5 max-w-xl px-6 font-inter text-sm text-[#3A3A3A] md:mt-6 md:px-0">{meta.subtitle}</p>
          </div>

          {/* The unified browse planner (session 8): search + labelled date /
              people fields + the two icon actions in ONE container — a white
              card below md (not sticky), one sticky white pill from md.
              Session-18: inside the textured heading section (live parity). */}
          <section className="mb-2">
            <BrowsePlanner
              category={meta.key}
              searchPlaceholder={meta.searchPlaceholder}
              query={query}
              onQueryChange={setQuery}
              initialPeople={planner?.people ?? 2}
              initialStart={planner?.start ?? null}
              initialEnd={planner?.end ?? null}
            />

            {/* Filter chips — session-12 live chrome: compact 38px pills
                with 12px text; session-24 re-measure: 600 weight, the
                rgba(14,14,14,0.08) hairline, #555550 inactive text, the
                violet #571AFF active fill, and 44px min-height touch
                targets on phones (the live's mobile override). The live's
                row bleeds past the inner container to the section edges. */}
            {/* Session-57 (v2.24): the live's chips row — the first chip
                sits at x=16 on phones (the inner px-4; was px-1 → x=4). */}
            <div className="relative mt-[14px] -mx-4 md:-mx-8 md:mt-5">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
                {chipsAvailable.map(({ label }) => {
                  const active = chips.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleChip(label)}
                      aria-pressed={active}
                      className={cn(
                        "flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 py-[10px] text-xs font-semibold transition-all md:min-h-[38px]",
                        active
                          ? "border-[rgba(14,14,14,0.08)] bg-roam text-white"
                          : "border-[rgba(14,14,14,0.08)] bg-white text-[#555550] hover:shadow-[0_8px_18px_rgba(14,14,14,0.1)]",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 bottom-2 hidden w-8 bg-gradient-to-l from-cream to-transparent md:block"
              />
            </div>
          </section>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-8">

      {/* Results */}
      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "place" : "places"}
      </p>

      <section className="grid grid-cols-1 gap-[18px] md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {visible.map((place) =>
          meta.key === "stay" ? (
            <StayCard key={place.id} place={place} />
          ) : (
            <PlaceCard key={place.id} place={place} />
          ),
        )}
      </section>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-card">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface2">
            <Search className="h-5 w-5 text-black/40" strokeWidth={1.5} aria-hidden />
          </span>
          <h2 className="font-serif text-2xl text-ink">No matches</h2>
          <p className="mt-2 max-w-sm text-sm text-black/50">
            Nothing in the guide fits that combination — try removing a filter or two.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setChips([]);
            }}
            className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Reset filters
          </button>
        </div>
      ) : null}
      </div>
    </main>
  );
}
