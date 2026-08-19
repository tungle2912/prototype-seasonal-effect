# CLAUDE.md

Instructions for AI agents working in this repo.

## What this is

A **static Polaris prototype site** for mocking up Shopify admin features,
deployed to GitHub Pages. It is **not** a Shopify app. There is no server, no
database, no OAuth, no webhooks, and no Shopify API access. Every prototype is a
throwaway mockup built to get stakeholder feedback.

Do not turn this into an app. If a task seems to need auth, a backend or a real
API call, that work belongs in a separate repo.

## Stack

React 18 · TypeScript · Vite 6 · `@shopify/polaris` 13.9.5 (React) ·
`react-router` 7 (HashRouter) · pnpm

## Commands

```bash
pnpm dev                      # dev server, port 4321
pnpm typecheck                # tsc --noEmit
pnpm lint                     # ESLint incl. house rules
pnpm build                    # typecheck + dist/
pnpm new-prototype <slug>     # scaffold a prototype
```

Always run `pnpm typecheck && pnpm lint` before reporting work as done.

## Where things go

| Adding | Put it in |
|---|---|
| A new prototype | `src/prototypes/<slug>/` via `pnpm new-prototype` — never by hand |
| Fixture data | `src/mocks/` |
| A helper used by 2+ prototypes | `src/lib/` |
| Chrome / index / host changes | `src/shell/` |
| Docs | `docs/` |
| Plans | `plans/` |

Never create markdown outside `docs/` or `plans/` unless asked.

## Hard rules

These are non-negotiable; two are enforced by lint.

1. **No hardcoded hex colors** (lint error). Use Polaris tokens: `var(--p-color-*)`, `var(--p-space-*)`.
2. **No network calls** (lint error). `fetch` and `XMLHttpRequest` are banned. Data comes from `src/mocks/`.
3. **No new dependencies.** React + Polaris + react-router covers it. Check the 158 Polaris exports before building any UI primitive.
4. **Never hand-write a component Polaris already has** — button, card, table, badge, banner, form control, empty state, skeleton.
5. **Never register a route manually.** `src/lib/registry.ts` auto-discovers `src/prototypes/*/` folders containing `meta.ts` + `index.tsx`.
6. **All four states.** Every prototype must render for `data`, `loading`, `empty`, `error`. Use `useMockData(fixture, emptyValue)` from `src/lib/mock-state.ts`.
7. **Fixtures keep Admin API shape**: GID ids (`gid://shopify/Product/123`), real enum values (`ACTIVE`/`DRAFT`/`ARCHIVED`).
8. **Format through `src/lib/format.ts`** — never render a raw number as currency.
9. **Never commit real customer, merchant or store data.** The deployed site may be publicly reachable.
10. **Shopify vocabulary**: merchant (not user), storefront (not website), variant (not option), collection (not category).

## Gotchas that will bite you

- **`base: './'` in `vite.config.ts`** — relative paths are required for GitHub
  Pages project sites. Changing it to `'/'` breaks every asset.
- **`HashRouter`, not `BrowserRouter`** — Pages cannot rewrite paths, so a
  path-based deep link 404s on refresh.
- **`allowBuilds: {esbuild: true}` in `pnpm-workspace.yaml`** — pnpm 11 does not
  read settings from `package.json`'s `pnpm` field or `.npmrc`. Remove it and
  `pnpm exec` fails with `ERR_PNPM_IGNORED_BUILDS`.
- **`ContextualSaveBar` needs the admin chrome.** It renders into Polaris'
  `Frame`, so guard it with `useChromeHidden()` from `src/shell/chrome-state.ts`.
- **Polaris React is deprecated upstream** (last release 13.9.5, March 2025).
  That is a deliberate choice here — see the README. Do not "fix" it by
  switching to Polaris web components without asking.

## Reference

- [docs/prototype-rules.md](docs/prototype-rules.md) — full rules and review criteria
- [docs/getting-started.md](docs/getting-started.md) — setup and layout
- [docs/deployment.md](docs/deployment.md) — Pages setup and the privacy warning
