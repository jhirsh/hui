import { linkVariants, type LinkVariant } from "./tokens";
import type { OnNavigate } from "./types";

/**
 * Navigation back to the main site, for standalone pieces (camino, lct) that
 * don't render the sidebar.
 *
 * Not tied to the page bottom — it reads fine above a title as a "you are in a
 * sub-site" marker, or below the content as a way out. <SiteFooter /> is just
 * one place to put it.
 */
export default function HomeLink({
  href = "https://hirshland.xyz",
  label = "Back to hirshland.xyz",
  variant = "underline",
  arrow = true,
  className = "",
  onNavigate,
}: {
  href?: string;
  label?: string;
  variant?: LinkVariant;
  arrow?: boolean;
  className?: string;
  /** Called on click, before navigation. For analytics; see README. */
  onNavigate?: OnNavigate;
}) {
  return (
    <a
      href={href}
      className={`${linkVariants[variant]} ${className}`}
      onClick={onNavigate && (() => onNavigate({ to: href, label, from: "HomeLink" }))}
    >
      {arrow && <>&larr; </>}
      {label}
    </a>
  );
}
