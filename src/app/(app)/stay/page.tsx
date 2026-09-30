import { requireUser } from "@/lib/page-gate";
import { listPlacesForUser } from "@/lib/places";
import { CATEGORY_META } from "@/types";
import { CategoryExplorer } from "@/components/places/CategoryExplorer";

export const metadata = { title: CATEGORY_META.stay.title };

export default async function StayPage({
  searchParams,
}: {
  searchParams: Promise<{ people?: string; start_date?: string; end_date?: string }>;
}) {
  const user = await requireUser("/stay");
  const sp = await searchParams;
  const places = await listPlacesForUser(user.uid, "stay");
  return (
    <CategoryExplorer
      meta={CATEGORY_META.stay}
      places={places}
      planner={{
        people: Number(sp.people) > 0 ? Number(sp.people) : 2,
        start: sp.start_date ?? null,
        end: sp.end_date ?? null,
      }}
    />
  );
}
