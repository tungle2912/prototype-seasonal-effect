import type { ComponentType } from 'react';

/**
 * Auto-discovery of prototypes.
 *
 * Every folder under `src/prototypes/` that contains a `meta.ts` and an
 * `index.tsx` becomes a route (`#/p/<folder-name>`) and a row on the index
 * page. Nothing else needs to be registered by hand — adding a folder is
 * enough. Folders prefixed with `_` (like `_template`) are ignored.
 */

export const PROTOTYPE_STATUSES = ['draft', 'in-review', 'approved'] as const;
export type PrototypeStatus = (typeof PROTOTYPE_STATUSES)[number];

export interface PrototypeMeta {
  /** Shown as the row title and page heading. Sentence case. */
  title: string;
  /** One line: what this prototype is exploring. */
  description: string;
  status: PrototypeStatus;
  /** Free-form labels used by the index page filter, e.g. ['products', 'bulk']. */
  tags: string[];
  /** ISO date (YYYY-MM-DD) of the last meaningful change. */
  updated: string;
  /** Who to ask about this prototype. */
  owner?: string;
}

export interface PrototypeEntry extends PrototypeMeta {
  slug: string;
  /** Lazy import of the prototype's default-exported component. */
  load: () => Promise<{ default: ComponentType }>;
}

const metaModules = import.meta.glob<{ meta: PrototypeMeta }>('../prototypes/*/meta.ts', {
  eager: true,
});

const componentModules = import.meta.glob<{ default: ComponentType }>('../prototypes/*/index.tsx');

const SLUG_PATTERN = /\/prototypes\/([^/]+)\//;

function slugFromPath(path: string): string | null {
  return SLUG_PATTERN.exec(path)?.[1] ?? null;
}

function collectPrototypes(): PrototypeEntry[] {
  // Index the lazy component loaders by slug so meta and component can be paired.
  const loaders = new Map<string, () => Promise<{ default: ComponentType }>>();
  for (const [path, load] of Object.entries(componentModules)) {
    const slug = slugFromPath(path);
    if (slug) loaders.set(slug, load);
  }

  const entries: PrototypeEntry[] = [];

  for (const [path, mod] of Object.entries(metaModules)) {
    const slug = slugFromPath(path);
    if (!slug || slug.startsWith('_')) continue;

    if (!mod.meta) {
      console.warn(`[registry] ${path} does not export "meta" — skipping.`);
      continue;
    }

    const load = loaders.get(slug);
    if (!load) {
      console.warn(`[registry] src/prototypes/${slug}/index.tsx is missing — skipping.`);
      continue;
    }

    entries.push({ slug, load, ...mod.meta });
  }

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}

export const prototypes: PrototypeEntry[] = collectPrototypes();

export function getPrototype(slug: string | undefined): PrototypeEntry | undefined {
  if (!slug) return undefined;
  return prototypes.find((entry) => entry.slug === slug);
}

/** Every tag used across all prototypes, sorted, deduplicated. */
export function allTags(): string[] {
  return [...new Set(prototypes.flatMap((entry) => entry.tags))].sort();
}
