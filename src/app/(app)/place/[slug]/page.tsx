import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/page-gate";
import { getPlaceBySlug } from "@/lib/places";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { priceRangeSymbols } from "@/lib/utils";
import { CATEGORY_META } from "@/types";
import { SaveButton } from "@/components/places/SaveButton";
import { BookingForm } from "@/components/places/BookingForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  // v2.21: the live's place-detail tab title is the STATIC "Place Page |
  // Activity Map" — the place NAME never enters the tab title (measured on
  // the live's Rose Circuit detail, 2026-10-01). The slug is still awaited
  // so the route segment stays dynamic-params-typed.
  return { title: "Place Page" };
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // v2.18: the gate carries the page's own path — a shared /place/<slug>
  // link survives the login-free first visit (the 303 returns here).
  const user = await requireUser(`/place/${slug}`);
  const place = await getPlaceBySlug(slug, user.uid);
  if (!place) notFound();

  const meta = CATEGORY_META[place.category];
  const tags = place.vibeTags.length
    ? place.vibeTags
    : place.cuisineTags.length
      ? place.cuisineTags
      : place.tags;

  return (
    <main className="w-full pb-24">
      {/* Session-18 re-measure: the live restructured the detail page — the
          heading + hero photo card is now a FULL-BLEED section carrying the
          18px graph-paper grid texture at 40% opacity (the live's new
          heading surface), and the About + form content moved BELOW the
          card into a separate two-column grid. */}
      <section className="relative overflow-visible px-4 pt-[60px] md:px-8 md:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(20,20,19,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.055)_1px,transparent_1px)] [background-size:18px_18px]"
        />
        <div className="relative mx-auto max-w-6xl">
          {/* Back — session-24 re-measure: the live's compact white pill —
              36px tall (py-2 px-4, 14px/600), no shadow, no border (the
              clone had the 40px float-shadow pill with asymmetric
              pl-5/pr-7 padding). */}
          <div className="mb-6">
            <Link
              href={meta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-white py-2 px-4 text-sm font-semibold text-ink transition hover:bg-black/[0.03]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} aria-hidden />
              Back
            </Link>
          </div>

          {/* Session-18: the rounded-36 card ends after the hero photo —
              About this place + the booking form live BELOW it now. */}
          <article className="overflow-hidden rounded-[36px] bg-white shadow-[0_24px_70px_rgba(14,14,14,0.12)]">
            {/* Header — the live app's measured stack: eyebrow, 82px h1, meta
                row. Session-14 re-measure: the card's inner padding is p-6 →
                md:p-10 (the live's h1 tops at y≈225, x≈105 at 1280). */}
            <header className="px-6 pb-8 pt-6 md:px-10 md:pb-10 md:pt-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-black/35">
                {meta.eyebrow}
              </p>
              <h1 className="mb-5 font-serif text-[clamp(42px,13vw,82px)] leading-[1.02] tracking-[-0.06em] text-ink">
                {place.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-black/55">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  {place.address ?? place.neighborhood ?? "Augsburg"}
                </span>
                {place.priceRange ? (
                  <>
                    <span className="text-black/25">•</span>
                    <span className="tracking-widest">{priceRangeSymbols(place.priceRange)}</span>
                  </>
                ) : null}
              </div>
            </header>

            {/* Hero image — 260px on phones / 420px at md / 460px at lg
                (session-10 re-measure). The overlays: heart top-left + the white
                RATING pill top-right (the live's photo chrome — no Map
                button). */}
            <section className="relative h-[260px] w-full md:h-[420px] lg:h-[460px]">
              {place.coverImageUrl ? (
                <img
                  src={place.coverImageUrl}
                  alt={place.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-cream-deep font-serif text-6xl text-black/20">
                  {place.name.charAt(0)}
                </div>
              )}

              <SaveButton placeId={place.id} initialSaved={place.saved ?? false} className="absolute left-5 top-5 sm:left-6 sm:top-6" />

              {place.reviewCount > 0 ? (
                <div
                  data-photo-rating
                  className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-white px-3 py-2 sm:right-6 sm:top-6"
                >
                  <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden />
                  <span className="text-xs font-bold text-ink">{place.avgRating.toFixed(1)}</span>
                </div>
              ) : null}
            </section>
          </article>
        </div>
      </section>

      {/* Body — session-18 re-measure: About this place + tags + the booking
          request form moved BELOW the hero card into a separate two-column
          grid (gap 24px, lg:grid-cols-[1.2fr_0.8fr] — the live's 60/40
          split); the form renders as its own rounded-28 white card. */}
      <section className="px-4 pt-8 md:px-8">
        <div
          data-detail-grid
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="space-y-6">
            <h2 className="font-serif text-[34px] leading-[1.08] tracking-[-0.03em] text-ink">About this place</h2>
            {place.description ? (
              <p className="text-base leading-relaxed text-secondary">{place.description}</p>
            ) : null}

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface2 px-3 py-1.5 text-xs font-semibold text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* The booking request form (the live app's Book Now card). */}
          <BookingForm
            place={{
              id: place.id,
              slug: place.slug,
              name: place.name,
              category: place.category,
              isBookable: place.isBookable,
              nightlyPrice: place.nightlyPrice,
              price: place.price,
              priceLabel: place.priceLabel,
              currency: place.currency,
              avgRating: place.avgRating,
              reviewCount: place.reviewCount,
              minParty: place.minParty,
              maxParty: place.maxParty,
            }}
          />
        </div>
      </section>
    </main>
  );
}
