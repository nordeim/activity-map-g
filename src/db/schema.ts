// Prisma owns the SQLite schema (`prisma/schema.prisma`). This file stays as
// the Drizzle entrypoint so `drizzle-kit push` against the sandbox Postgres
// instance is a no-op and never fights the SQLite file at db/custom.db.
export {};
