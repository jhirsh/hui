/**
 * Shared visual tokens. These are Tailwind class strings rather than CSS
 * variables so consumers need no extra stylesheet import — the kit stays a
 * drop-in folder.
 *
 * All colors are currentColor-based on purpose: components inherit whatever
 * palette the host page uses instead of carrying their own light/dark rules.
 */
export const tokens = {
  /** Primary secondary-text level: links, bylines. */
  muted: "text-current/60",
  /** One step quieter: labels, separators, the "by" in a byline. */
  subtle: "text-current/40",
  /** Hairline rule that works on any background. */
  hairline: "border-current/10",
  /**
   * Inline link, for a name or phrase sitting inside prose. Underlined because
   * in running text, color alone is not a reliable affordance and hover-only
   * underlines don't exist on touch.
   */
  link: "text-current/60 underline decoration-current/50 underline-offset-2 transition-colors hover:text-current hover:decoration-current",
} as const;

/**
 * Font contract: the kit never loads a typeface. It uses Tailwind's `font-sans`,
 * so each app decides what that resolves to (e.g. via next/font setting
 * --font-sans in its own @theme). Keeping this out of the kit is what lets
 * camino and hirshland.xyz look consistent in structure while differing in type.
 */
export const FONT_CLASS = "font-sans";

/**
 * Standalone link treatments, for links that sit on their own rather than
 * inside a sentence. An isolated link has position and whitespace doing some
 * of the work that an underline does in prose, so it can afford to be quieter.
 */
export const linkVariants = {
  /** Safest default: unmistakable without being loud. */
  underline:
    "text-current/60 underline decoration-current/50 underline-offset-2 transition-colors hover:text-current hover:decoration-current",
  /** No decoration. Relies on placement, so use only where it's obviously a link. */
  plain: "text-current/60 no-underline transition-colors hover:text-current",
  /** Bordered pill. Reads as a button-ish target — good for a lone call to action. */
  pill: "inline-block rounded-full border border-current/20 px-3.5 py-1.5 text-current/70 no-underline transition-colors hover:border-current/40 hover:text-current",
} as const;

export type LinkVariant = keyof typeof linkVariants;
