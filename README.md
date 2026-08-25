# hirshland-ui

Shared UI kit for [hirshland.xyz](https://hirshland.xyz) and its standalone
pieces (camino, lct), so they stay visually consistent without a design system.

## Install

```bash
npm i github:jhirsh/hirshland-ui        # latest on main
npm i github:jhirsh/hirshland-ui#v0.1.0 # pinned to a tag
```

Then tell your bundler to compile it, because this package ships **TypeScript
source rather than a build**:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["hirshland-ui"],
};
```

That's deliberate. There is no tsup/rollup step, which means the `"use client"`
directives in `Sidebar` and `DarkModeToggle` arrive exactly as written —
bundlers routinely strip or hoist them, which breaks the components silently.

## Use

```tsx
import { HomeLink, Byline, SiteFooter, tokens } from "hirshland-ui";

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
cd hirshland-ui && npm link
cd ../your-site && npm link hirshland-ui
# when done
npm unlink hirshland-ui && npm i
```
