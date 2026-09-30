import { requireUser } from "@/lib/page-gate";
import { listFavourites } from "@/lib/places";
import { FavouritesView } from "@/components/favourites/FavouritesView";

export const metadata = { title: "Favourites" };

export default async function FavouritesPage() {
  const user = await requireUser("/favourites");
  const places = await listFavourites(user.uid);
  return <FavouritesView places={places} />;
}
