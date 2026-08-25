import Sidebar from "./Sidebar";
import type { NavLink } from "./types";

export { default as ThemeScript } from "./ThemeScript";
export { default as Sidebar } from "./Sidebar";
export { default as SiteFooter } from "./SiteFooter";
export { default as HomeLink } from "./HomeLink";
export { default as Byline } from "./Byline";
export { default as DarkModeToggle } from "./DarkModeToggle";
export { tokens, linkVariants, FONT_CLASS } from "./tokens";
export type { LinkVariant } from "./tokens";
export type { NavLink } from "./types";

/**
 * Site chrome: sidebar nav and the content column it offsets.
 * Pair with <ThemeScript /> in <head>.
 */
export function SiteChrome({
  links,
  children,
}: {
  links: NavLink[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar links={links} />
      <div className="md:ml-[30%] mr-[7.5%] p-4 pt-4 md:pt-[60px]">{children}</div>
    </>
  );
}
