# Prototype rules

Rules for building prototypes in this repo. They exist so every mockup reads as
"a real feature inside Shopify admin" and so the work translates cleanly when a
feature is later implemented for real.

`pnpm lint` enforces the mechanical ones. The rest are review criteria.

---

## Design

- **Polaris first.** Never hand-write a button, card, table, badge, banner or
  form control. If Polaris has it, use it. 158 components are exported from
  `@shopify/polaris` — check before building anything.
- **No hardcoded colors.** Hex literals are a lint error. Use Polaris design
  tokens (`var(--p-color-*)`, `var(--p-space-*)`). If you find yourself needing
  a color Polaris does not have, that is a signal the design is drifting.
- **Custom CSS only for layout** that Polaris does not cover, kept inline or
  next to the component. No global stylesheets.
- **Follow admin page structure**: `Page` → `Layout` → `Layout.Section` →
  `Card`. Primary action top-right, destructive actions never primary.
- **Use the real admin chrome.** Prototypes render inside `AdminFrame`; do not
  build your own header or sidebar.

## Content and terminology

- Use Shopify's vocabulary, not generic software words:

  | Use | Not |
  |---|---|
  | merchant | user, shop owner |
  | storefront | website, frontend |
  | variant | option, SKU (unless you mean the SKU field) |
  | collection | category |
  | fulfillment | shipping status |
  | draft order | pending order |

- Sentence case for headings and buttons ("Save discount", not "Save Discount").
- Buttons are verbs. Never "OK", "Submit", or "Click here".
- No lorem ipsum in anything a stakeholder will see.

## Data

- All data comes from `src/mocks/`. **Network calls are a lint error** —
  `fetch` and `XMLHttpRequest` are banned.
- Fixtures keep the shape of the real Admin API: GID ids
  (`gid://shopify/Product/123`), handles, and the real enum values
  (`ACTIVE`/`DRAFT`/`ARCHIVED`, `PAID`/`PENDING`/`REFUNDED`). A prototype whose
  data shape is honest can be wired to the real API without redesigning the UI.
- Format money and dates through `src/lib/format.ts`. Never render a raw number
  as currency.
- Fixture content must be plausible: real-sounding product names, sensible
  prices, dates that make sense together. "Test product 1" undermines a demo.
- **Never commit real customer, merchant or store data.** See the warning in
  [deployment.md](deployment.md) — this site may be publicly reachable.

## States

Every prototype must render sensibly in all four simulated states. The host
toolbar switches between them and each is linkable:

| State | URL | Meaning |
|---|---|---|
| With data | `#/p/slug` | The normal case |
| Loading | `?state=loading` | Skeletons, never a blank page |
| Empty | `?state=empty` | `EmptyState` explaining the first action |
| Error | `?state=error` | `Banner tone="critical"` with a retry |

Use `useMockData(fixture, emptyValue)` from `src/lib/mock-state.ts` — it wires
all four states for you.

Keep `status` in `meta.ts` honest (`draft` → `in-review` → `approved`). The
index page filters on it and reviewers rely on it.

## Scope

- **Prototypes are disposable.** Optimize for speed and visual fidelity, not
  architecture. Duplication between prototypes is fine and often clearer.
- **Do not add dependencies.** The stack is React + Polaris + react-router. If a
  prototype seems to need a date picker, a table library or state management,
  Polaris almost certainly covers it.
- **No routing inside a prototype.** One prototype is one screen or one flow
  driven by local state. Add a second prototype instead.
- **Do not copy prototype code into production.** Rewrite it in the real app
  repo. This base is deliberately not production-shaped: no error handling, no
  auth, no API layer.

## Accessibility

Polaris gives you most of this, but do not break it:

- Every input has a real `label` (use `labelHidden`, never an empty label).
- Every icon-only button has an `accessibilityLabel`.
- Meaning is never carried by color alone — pair a colored `Badge` with text.
- The whole flow must be operable by keyboard.

## Adding a prototype

```bash
pnpm new-prototype my-feature-name
```

Then fill in `meta.ts` (description, tags, status, owner) and build the screen
in `index.tsx`. It appears on the index page automatically — the registry
discovers folders, so there is no route to register.
