#!/usr/bin/env node
/**
 * Scaffolds a new prototype by copying src/prototypes/_template.
 *
 * Usage: pnpm new-prototype <kebab-case-slug>
 */

import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prototypesDir = join(projectRoot, 'src', 'prototypes');
const templateDir = join(prototypesDir, '_template');

const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function toPascalCase(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toSentenceCase(slug) {
  const words = slug.split('-').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const slug = process.argv[2];

if (!slug) {
  const existing = existsSync(prototypesDir)
    ? (await readdir(prototypesDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
        .map((entry) => entry.name)
    : [];

  fail(
    [
      'Missing slug.',
      '',
      '  Usage: pnpm new-prototype <kebab-case-slug>',
      '  Example: pnpm new-prototype shipping-rule-builder',
      '',
      existing.length > 0 ? `  Existing prototypes: ${existing.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

if (!SLUG_PATTERN.test(slug)) {
  fail(`"${slug}" is not a valid slug. Use lowercase kebab-case, e.g. shipping-rule-builder.`);
}

if (slug.startsWith('_')) {
  fail('Slugs cannot start with "_" — the registry ignores those folders.');
}

const targetDir = join(prototypesDir, slug);

if (existsSync(targetDir)) {
  fail(`src/prototypes/${slug} already exists.`);
}

if (!existsSync(templateDir)) {
  fail('src/prototypes/_template is missing — cannot scaffold.');
}

await mkdir(targetDir, { recursive: true });
await cp(templateDir, targetDir, { recursive: true });

const componentName = toPascalCase(slug);
const title = toSentenceCase(slug);
const today = new Date().toISOString().slice(0, 10);

// meta.ts: title, description placeholder and the updated date.
const metaPath = join(targetDir, 'meta.ts');
let meta = await readFile(metaPath, 'utf8');
meta = meta
  .replace(
    /\/\*\*[\s\S]*?\*\/\n/,
    '', // drop the template-only explanation comment
  )
  .replace("title: 'Template'", `title: '${title}'`)
  .replace(
    "description: 'Copy this folder to start a new prototype.'",
    "description: 'TODO: one line on what this prototype explores.'",
  )
  .replace(/updated: '[\d-]+'/, `updated: '${today}'`);
await writeFile(metaPath, meta);

// index.tsx: component name and page title.
const indexPath = join(targetDir, 'index.tsx');
let index = await readFile(indexPath, 'utf8');
index = index
  .replace('export default function Template()', `export default function ${componentName}()`)
  .replace('title="Template"', `title="${title}"`);
await writeFile(indexPath, index);

console.log(`
✔ Created src/prototypes/${slug}/

  meta.ts     — set the description, tags, status and owner
  index.tsx   — build the screen (${componentName})

  Then run:  pnpm dev
  Open:      http://localhost:4321/#/p/${slug}

It already appears on the index page — the registry picks up the folder automatically.
`);
