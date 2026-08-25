import HomeLink from "./HomeLink";
import DarkModeToggle from "./DarkModeToggle";
import { tokens, type LinkVariant } from "./tokens";
import type { OnNavigate } from "./types";

/**
 * Closing region for a standalone piece: a rule, then whatever belongs at the
 * end of the page. Today that's the way home and an optional theme toggle.
 *
 * This is only a container — the navigation itself is <HomeLink />, which works
 * on its own anywhere on the page.
 */
export default function SiteFooter({
  href,
  label,
  variant = "underline",
  themeToggle = false,
  onNavigate,
}: {
  href?: string;
  label?: string;
  variant?: LinkVariant;
  themeToggle?: boolean;
  /** Forwarded to the <HomeLink /> inside. */
  onNavigate?: OnNavigate;
}) {
  return (
    <footer
      className={`mt-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t ${tokens.hairline} pt-6 pb-12 text-sm`}
    >
      <HomeLink href={href} label={label} variant={variant} onNavigate={onNavigate} />
      {themeToggle && <DarkModeToggle />}
    </footer>
  );
}
