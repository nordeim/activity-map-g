// App data access goes through Prisma (`@/lib/db`). This module re-exports
// the same client so platform tooling that imports `@/db` stays aligned.
export { db } from "@/lib/db";
