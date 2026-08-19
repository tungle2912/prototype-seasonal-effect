# Shopify Prototype Base

A static [Polaris](https://polaris.shopify.com) site for prototyping Shopify
admin features, deployed to GitHub Pages. Add a folder, get a shareable URL.

It is **not** a Shopify app: no server, no database, no OAuth, no API access.
Every prototype is a throwaway mockup for getting stakeholder feedback before a
feature is built for real.

```bash
pnpm install
pnpm dev                              # http://localhost:4321
pnpm new-prototype my-feature-name    # scaffold a new one
```

## What you get

- **Auto-discovery** — drop a folder in `src/prototypes/`, it appears on the
  index page and gets its own URL. No routes to register.
- **Fake admin chrome** — Polaris `Frame`/`TopBar`/`Navigation` so screenshots
  read as "inside Shopify" instead of "a web page". Toggle it with `?chrome=off`.
- **Four simulated states** — loading, empty, error and data, each linkable
  (`?state=loading`) for demos and screenshots.
- **Admin-shaped fixtures** — GID ids and real enum values, so a prototype can
  be wired to the real API later without redesigning the UI.
- **Enforced house rules** — lint fails on hardcoded hex colors and on network
  calls.

## Docs

| | |
|---|---|
| [Getting started](docs/getting-started.md) | Setup, scripts, project layout |
| [Prototype rules](docs/prototype-rules.md) | Design, terminology, data and scope rules |
| [Deployment](docs/deployment.md) | GitHub Pages setup — **read the privacy warning** |
| [CLAUDE.md](CLAUDE.md) | Instructions for AI agents |

## ⚠️ The deployed site is public

GitHub Pages on a public repo serves a public website. Before putting client work
or unreleased features here, read
[the warning in deployment.md](docs/deployment.md#-read-this-first-the-site-is-public).

## A note on Polaris React

This base pins `@shopify/polaris` **13.9.5**, which Shopify has **deprecated** in
favour of [Polaris web components](https://shopify.dev/docs/api/polaris). That is
a deliberate trade-off for a prototyping tool:

| | Polaris React (chosen) | Polaris web components |
|---|---|---|
| Distribution | npm, bundled into the build | CDN script tag only |
| Version | pinned; a prototype looks the same in a year | rebuilt continuously upstream |
| Admin chrome | `Frame`/`TopBar`/`Navigation` included | provided by real admin only, unavailable here |
| Maintained | no (final release March 2025) | yes |
| Matches current admin | closely, and drifts over time | exactly |

Deprecated-but-frozen is a feature here: prototypes stay reproducible offline and
cannot break on their own. The cost is that the visual match with the live admin
will slowly drift, and prototype code will not transfer to an app built on web
components — which is fine, since [prototype code is never meant to ship](docs/prototype-rules.md#scope).

Revisit this if prototypes start looking dated next to the real admin.
