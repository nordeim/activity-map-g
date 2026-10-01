import { requireUser } from "@/lib/page-gate";
import { listPlacesForUser } from "@/lib/places";
import { CATEGORY_META } from "@/types";
import { CategoryExplorer } from "@/components/places/CategoryExplorer";

export const metadata = { title: CATEGORY_META.eat.label };
// v2.21: the live's tab title is the SHORT label ("Eat | Activity Map")
// — never the on-page H1 ("Eat Well Tonight"-style). The layout template
// appends "| Activity Map".

export default async function EatPage({
  searchParams,
}: {
  searchParams: Promise<{ people?: string; start_date?: string; end_date?: string }>;
}) {
  const user = await requireUser("/eat");
  const sp = await searchParams;
  const places = await listPlacesForUser(user.uid, "eat");
  return (
    <CategoryExplorer
      meta={CATEGORY_META.eat}
      places={places}
      planner={{
        people: Number(sp.people) > 0 ? Number(sp.people) : 2,
        start: sp.start_date ?? null,
        end: sp.end_date ?? null,
      }}
    />
  );
}
