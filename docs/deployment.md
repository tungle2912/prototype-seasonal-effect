# Deployment

## ⚠️ Read this first: the site is public

GitHub Pages on a **public repository serves a public website**. Anyone with the
URL can open it, and search engines can index it.

`index.html` sends `noindex, nofollow`, which discourages indexing but **does not
restrict access**. It is not a security control.

Before putting anything here, decide:

| Situation | What to do |
|---|---|
| Generic prototypes, no client names, nothing unreleased | Public repo is fine |
| Unreleased features, client names, anything under NDA | Private repo + Pages (needs a paid GitHub plan), or host elsewhere |
| Needs real access control | Vercel/Netlify password protection, or Cloudflare Access |

Never commit real customer, merchant or store data regardless of visibility.

## One-time setup

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   Do not pick "Deploy from a branch" — the workflow uploads an artifact.
3. Push to `main`. The workflow publishes to
   `https://<user>.github.io/<repo>/`.

## How it deploys

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

- **Pull requests**: typecheck, lint and build only. Nothing is published.
- **Push to `main`**: same checks, then upload `dist/` and deploy to Pages.

Concurrency is set so a newer push cancels a queued deploy.

## Two things that make this work on Pages

Both are already configured. Understand them before changing them.

**1. Relative asset base** — `vite.config.ts` sets `base: './'`.

A project site is served from a subpath (`/<repo>/`), not the domain root. With
an absolute base, every asset request would 404. Relative paths work at any
subpath, so the repo can be renamed without touching config.

If you move to a custom domain or a user site (`<user>.github.io`), `'./'` still
works — you do not need to change it.

**2. Hash routing** — `src/app.tsx` uses `HashRouter`.

Pages serves static files and cannot rewrite unknown paths to `index.html`. With
path-based routing, `/<repo>/p/my-feature` would 404 on refresh or when someone
opens a shared link. Hash routes (`/#/p/my-feature`) never hit the server.

The common workaround is copying `index.html` to `404.html`. That is not needed
here, and switching to `BrowserRouter` would require it.

## Verifying a build locally

```bash
pnpm build
pnpm preview
```

`pnpm preview` serves `dist/` on port 4322 exactly as Pages would.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Blank page, 404s on `/assets/*` | `base` was changed away from `'./'` |
| Deep link 404s on refresh | Router was switched to `BrowserRouter` |
| Workflow fails on `pnpm install` | `pnpm-lock.yaml` is stale — run `pnpm install` and commit it |
| `ERR_PNPM_IGNORED_BUILDS` | `allowBuilds` in `pnpm-workspace.yaml` was removed; esbuild needs its install script |
| Pages shows the README instead of the app | Source is still "Deploy from a branch" — set it to GitHub Actions |
