import { linkVariants, type LinkVariant } from "./tokens";

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
}: {
  href?: string;
  label?: string;
  variant?: LinkVariant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <a href={href} className={`${linkVariants[variant]} ${className}`}>
      {arrow && <>&larr; </>}
      {label}
    </a>
  );
}
