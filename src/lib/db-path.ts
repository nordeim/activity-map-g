// Database URL resolution (SQLite relative-path contract).
//
// A RELATIVE `file:` URL in DATABASE_URL resolves against the first
// "anchor" directory that contains prisma/schema.prisma — exactly like the
// Prisma CLI resolves against the schema file — so `file:../db/custom.db`
// points at <anchor>/db/custom.db regardless of the process working
// directory. Absolute file: URLs (POSIX + Windows drive letters) and
// non-SQLite URLs pass through untouched; a missing/blank env value falls
// back to the documented default <anchor>/db/custom.db.
//
// The standalone trap: `next build` emits .next/standalone/server.js which
// process.chdir()s into .next/standalone, and the Next tracer copies
// prisma/schema.prisma into that folder. A plain CWD rule would resolve the
// database against the BUILD OUTPUT. candidateRoots() therefore yields the
// chunk-derived anchor first, then the detected real repo root (when running
// from the in-repo standalone dir), then the CWD — and resolution picks the
// first anchor carrying a schema, which in the standalone context is the
// repo, not the traced copy.
//
// Contract pinned by tests/db-path.test.ts.

import { existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_DB_NAME = "custom.db";

export function resolveDatabaseUrl(
  envValue: string | undefined,
  anchors: string[],
): string {
  // Strip surrounding quotes: some .env loaders pass `KEY="value"` through
  // with the quotes intact, which would otherwise dodge the `file:` branch
  // and hand Prisma a literally-quoted path (SQLite error 14).
  const raw = stripQuotes((envValue ?? "").trim());

  // Missing / blank → documented default: <anchor>/db/custom.db
  if (raw === "") {
    return fileUrl(resolveDefault(anchors));
  }

  // Non-SQLite URLs (e.g. PostgreSQL connection strings) pass through.
  if (!raw.startsWith("file:")) {
    return raw;
  }

  const rest = raw.slice("file:".length);

  // Absolute POSIX (file:/var/data/prod.db) and Windows drive-letter
  // (file:C:\data\prod.db) URLs pass through untouched.
  if (rest.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rest)) {
    return raw;
  }

  // Relative URL → resolve against the schema anchor's prisma/ directory.
  const anchor = schemaAnchor(anchors);
  const resolved = path.resolve(path.join(anchor, "prisma"), rest);
  return fileUrl(resolved);
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function fileUrl(absolutePath: string): string {
  // Normalise to forward slashes so the URL is portable.
  const p = absolutePath.split(path.sep).join("/");
  return `file:${p}`;
}

function resolveDefault(anchors: string[]): string {
  const anchor = schemaAnchor(anchors);
  return path.join(anchor, "db", DEFAULT_DB_NAME);
}

function schemaAnchor(anchors: string[]): string {
  let fallback: string | null = null;
  for (const raw of anchors) {
    if (!raw) continue;
    fallback = raw; // the LAST no-schema anchor, like the plain CWD rule
    // Defense in depth: an anchor that IS the in-repo .next/standalone
    // folder upgrades to the real repo root above it — even when the
    // caller's candidate list lost the repo entry to minification.
    const anchor = upgradeStandaloneAnchor(raw);
    if (process.env.DEBUG_DBPATH) {
      console.log("[dbpath] anchor candidate:", raw, "→", anchor, "has schema:", existsSync(path.join(anchor, "prisma", "schema.prisma")));
    }
    if (existsSync(path.join(anchor, "prisma", "schema.prisma"))) {
      return anchor;
    }
  }
  return fallback ?? process.cwd();
}

/** `<repo>/.next/standalone` → `<repo>` when the repo carries the schema. */
function upgradeStandaloneAnchor(dir: string): string {
  let result = path.resolve(dir);
  if (path.basename(result) === "standalone") {
    const nextDir = path.dirname(result);
    if (path.basename(nextDir) === ".next") {
      const repo = path.dirname(nextDir);
      if (existsSync(path.join(repo, "prisma", "schema.prisma"))) {
        result = repo;
      }
    }
  }
  return result;
}

/**
 * Detect the real repo root when running inside `<repo>/.next/standalone`
 * (the production standalone server). Returns null for a standalone copy
 * deployed elsewhere (no repo above it) or for plain directories.
 *
 * NOTE: single-exit form on purpose — a multi-return variant of this
 * function was observed being mis-minified by the Turbopack production
 * minifier (the final `return repo` dropped, so the repo anchor never
 * reached the candidate list and the runtime resolved SQLite paths
 * against the traced schema copy inside .next/standalone).
 */
export function standaloneRepoRoot(dir: string): string | null {
  let result: string | null = null;
  const standalone = path.resolve(dir);
  if (path.basename(standalone) === "standalone") {
    const nextDir = path.dirname(standalone);
    if (path.basename(nextDir) === ".next") {
      const repo = path.dirname(nextDir);
      if (existsSync(path.join(repo, "prisma", "schema.prisma"))) {
        result = repo;
      }
    }
  }
  return result;
}

/**
 * Candidate anchor directories, in preference order:
 *   1. the chunk-derived anchor (src/lib → repo root in dev; skipped
 *      entirely when it lands inside a .next/standalone subtree, where the
 *      Next tracer places a COPY of prisma/schema.prisma that must not
 *      win over the real repo),
 *   2. the detected real repo root when the process runs from the in-repo
 *      standalone folder,
 *   3. the process working directory (for a standalone copy deployed
 *      elsewhere, this resolves against the traced schema copy — the
 *      documented deployment fallback; use an absolute DATABASE_URL in
 *      that case).
 */
export function candidateRoots(): string[] {
  const roots: string[] = [];

  const here = moduleDir();
  if (here && !insideStandalone(here)) {
    roots.push(path.resolve(here, "..", ".."));
  }

  const repo = standaloneRepoRoot(process.cwd());
  if (repo) roots.push(repo);

  roots.push(process.cwd());
  return roots;
}

/** True when the path lies inside a `.next/standalone` build-output tree. */
function insideStandalone(dir: string): boolean {
  const p = path.resolve(dir).split(path.sep);
  for (let i = 0; i < p.length - 1; i++) {
    if (p[i] === ".next" && p[i + 1] === "standalone") return true;
  }
  return false;
}

function moduleDir(): string | null {
  try {
    if (typeof __dirname === "string" && __dirname.length > 0) {
      return __dirname;
    }
  } catch {
    // __dirname unavailable (ESM) — fall through.
  }
  return null;
}

/** Resolve DATABASE_URL for the running process (used by src/lib/db.ts). */
export function runtimeDatabaseUrl(): string {
  const env = process.env.DATABASE_URL;
  // This app is SQLite-backed at <repo>/db/custom.db. A workspace that
  // injects a PostgreSQL DATABASE_URL (common in the Next.js+Postgres
  // sandbox) must not hijack Prisma onto a dialect the schema is not
  // compiled for.
  if (!env || /^\s*$/.test(env) || env.trim().startsWith("postgres")) {
    return resolveDatabaseUrl("file:../db/custom.db", candidateRoots());
  }
  return resolveDatabaseUrl(env, candidateRoots());
}
