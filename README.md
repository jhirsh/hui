# hui

Shared UI kit for [hirshland.xyz](https://hirshland.xyz) and its standalone
pieces (camino, lct), so they stay visually consistent without a design system.

## Install

```bash
npm i github:jhirsh/hui        # latest on main
npm i github:jhirsh/hui#v0.1.0 # pinned to a tag
```

Then tell your bundler to compile it, because this package ships **TypeScript
source rather than a build**:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["hui"],
};
```

That's deliberate. There is no tsup/rollup step, which means the `"use client"`
directives in `Sidebar` and `DarkModeToggle` arrive exactly as written —
bundlers routinely strip or hoist them, which breaks the components silently.

Then point Tailwind at the package, or **none of its styles will be generated**:

```css
/* globals.css */
@import "tailwindcss";
@source "../node_modules/hui";
```

Tailwind v4 scans your source for class names but skips `node_modules`. Without
this line everything compiles, renders, and hydrates correctly — and looks
completely unstyled. It is the easiest thing to miss when adding the kit to a
new site.

## Use

```tsx
import { HomeLink, Byline, SiteFooter, tokens } from "hui";

<HomeLink variant="pill" />
<Byline date="June – August 2026" location="Camino del Norte" />
<SiteFooter variant="pill" themeToggle />
```

| Component | Role |
| --- | --- |
| `HomeLink` | Navigation back to the main site. Any position, not just the footer. |
| `Byline` | Attribution: name, optional date and location. Goes under a title. |
| `SiteFooter` | Closing region. Composes `HomeLink` plus an optional theme toggle. |
| `DarkModeToggle` | Inline theme switch. |
| `SiteChrome` / `Sidebar` | Full sidebar nav shell. Next App Router only. |
| `ThemeScript` | Anti-flash theme restore. Render inside `<head>`. |
| `tokens` / `linkVariants` | Shared class tokens, so your own markup can match. |

## Tracking navigation away (analytics)

`Byline` and `HomeLink` send people to another site — usually from a standalone
piece (camino, lct) back to the apex. `SiteFooter` forwards to the `HomeLink`
inside it. Each takes an optional `onNavigate`, called on click before the
browser leaves:

```tsx
<HomeLink onNavigate={({ to, label, from }) => track(from, to, label)} />
```

This kit stays analytics-free on purpose — it has no runtime dependencies, and
baking in a vendor would push that on every consumer. The callback is the seam.

### With PostHog

Wire it to `capture` at each call site:

```tsx
import posthog from "posthog-js";
import { Byline, SiteFooter, type OnNavigate } from "hui";

const track: OnNavigate = ({ to, label, from }) =>
  posthog.capture("cross_site_link_clicked", { to, label, from });

<Byline date="June – August 2026" onNavigate={track} />
<SiteFooter themeToggle onNavigate={track} />
```

**Sessions across subdomains.** A named event is only useful if both sites agree
on who the visitor is. For one session across `hirshland.xyz` and its
sub-sites, every site must:

1. **Use the same PostHog project token.** The identity cookie is per-token, so
   separate projects cannot be bridged.
2. **Set `persistence: "cookie"`** in `posthog.init`. The default is
   `localStorage+cookie`, and localStorage is per-origin — each subdomain keeps
   its own copy, which drifts from the shared cookie and reads as a new session.

`cross_subdomain_cookie` needs no attention: posthog-js already defaults it on
for a normal apex domain, opting out only for shared hosts like `vercel.app`.

Autocapture records these clicks either way. `onNavigate` earns its place by
giving them a stable event name and typed properties, instead of a query that
depends on CSS selectors.

## Requirements

- **Tailwind v4**, with a dark variant: `@custom-variant dark (&:where(.dark, .dark *));`
- **React 18+**
- **Next App Router** — only for `SiteChrome` / `Sidebar`, which use `next/link`
  and `next/navigation`. `HomeLink`, `Byline`, `SiteFooter`, and
  `DarkModeToggle` are plain React and work anywhere.

## Fonts

The kit does not load a typeface. Components use `font-sans`, and each app
decides what that resolves to. That is on purpose: it keeps structure consistent
across sites while letting each piece set its own type.

## Colors

Everything is `currentColor`-based (see `tokens.ts`), so components inherit the
host page's palette rather than shipping their own light/dark rules. This is why
the footer works unchanged on a white page and on camino's dark one.

## Local development

To iterate without a commit-push-reinstall loop:

```bash
cd hui && npm link
cd ../your-site && npm link hui
# when done
npm unlink hui && npm i
```

## Versioning

Every push to `main` gets an automatic **patch** bump and a matching `vX.Y.Z`
tag, so there is always a pinnable ref.

Minor and major bumps are deliberate. Do them locally and push:

```bash
npm version minor   # or major
git push --follow-tags
```

The workflow notices the version already changed in that commit and skips its
own bump, so your intentional version stands.
