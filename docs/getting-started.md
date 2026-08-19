# Getting started

A static Polaris site for prototyping Shopify admin features. No Shopify app, no
store, no API keys — it runs entirely in the browser.

## Requirements

- Node 20+ (developed on 24)
- pnpm 10+ (developed on 11)

## Run it

```bash
pnpm install
pnpm dev
```

Open <http://localhost:4321>. The index page lists every prototype.

## Create a prototype

```bash
pnpm new-prototype shipping-rule-builder
```

This copies `src/prototypes/_template/` and wires the names up. Then:

1. Edit `src/prototypes/shipping-rule-builder/meta.ts` — description, tags,
   status, owner.
2. Build the screen in `index.tsx`.
3. Open <http://localhost:4321/#/p/shipping-rule-builder>.

There is no route to register and no index to update. The registry
(`src/lib/registry.ts`) discovers any folder under `src/prototypes/` that has
both a `meta.ts` and an `index.tsx`. Folders starting with `_` are ignored.

## Demoing a prototype

Two URL switches, both linkable and screenshot-friendly:

| What | How |
|---|---|
| Show loading / empty / error | `#/p/slug?state=loading` (also `empty`, `error`) |
| Strip the fake admin chrome | `#/p/slug?chrome=off` |

The state switcher sits in the toolbar above every prototype, and "Hide admin
chrome" is in the user menu (top right).

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Dev server on port 4321 |
| `pnpm build` | Typecheck, then produce `dist/` |
| `pnpm preview` | Serve the built `dist/` on port 4322 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint, including the house rules |
| `pnpm format` | Prettier |
| `pnpm new-prototype <slug>` | Scaffold a prototype |

## Layout

```
src/
├── app.tsx                    HashRouter + routes
├── main.tsx                   AppProvider + Polaris stylesheet
├── shell/
│   ├── admin-frame.tsx        Fake admin chrome (Frame/TopBar/Navigation)
│   ├── prototype-index.tsx    Index page with search and filters
│   ├── prototype-host.tsx     Per-prototype wrapper: banner, state switcher
│   └── chrome-state.ts        ?chrome=off handling
├── lib/
│   ├── registry.ts            Auto-discovery of prototypes
│   ├── mock-state.ts          Four simulated data states
│   └── format.ts              Money, dates, numbers, GIDs
├── mocks/                     Fixtures shaped like the Admin API
└── prototypes/
    └── _template/             Copied by pnpm new-prototype
```

The base ships no example prototypes — `pnpm new-prototype <slug>` gives you the
first one. Ready-made fixtures for products, orders, customers and the shop are
already in `src/mocks/`.

## Before you build

Read [prototype-rules.md](prototype-rules.md). Two of the rules are enforced by
`pnpm lint` and will fail CI: no hardcoded hex colors, no network calls.

## Deploying

Push to `main`. GitHub Actions builds and publishes to GitHub Pages — see
[deployment.md](deployment.md), including a **privacy warning** you should read
before putting client work here.
