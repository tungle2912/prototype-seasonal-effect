import type { PrototypeMeta } from '../../lib/registry';

/**
 * Folders starting with `_` are ignored by the registry, so this template never
 * shows up on the index page. Use `pnpm new-prototype <slug>` to copy it.
 */
export const meta: PrototypeMeta = {
  title: 'Template',
  description: 'Copy this folder to start a new prototype.',
  status: 'draft',
  tags: [],
  updated: '2026-08-19',
  owner: 'unassigned',
};
