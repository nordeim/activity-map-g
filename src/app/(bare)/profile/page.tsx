import { requireUser } from "@/lib/page-gate";
import { listBookings } from "@/lib/places";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  // v2.18: the page owns the path-aware gate (the (bare) layout no longer
  // redirects — it cannot know the request path; see src/lib/page-gate.ts).
  const session = await requireUser("/profile");

  const [bookings, user, favourites] = await Promise.all([
    listBookings(session.uid),
    db.user.findUnique({ where: { id: session.uid }, select: { email: true, name: true, createdAt: true } }),
    db.savedPlace.count({ where: { userId: session.uid } }),
  ]);

  return (
    <ProfileView
      user={{ name: user?.name ?? session.name, email: user?.email ?? session.email }}
      bookings={bookings}
      favouriteCount={favourites}
    />
  );
}
