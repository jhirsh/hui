export type NavLink = {
  href: string;
  label: string;
  /** Sub-pages, shown indented under this link while you're on it or any of them. */
  children?: NavLink[];
};

/**
 * Fired when a link in this kit sends someone to another site. Analytics-free
 * on purpose: consumers decide what, if anything, to report. See README.
 */
export type NavigateInfo = {
  /** Destination href, as rendered. */
  to: string;
  /** Visible link text. */
  label: string;
  /** Which component the link came from. */
  from: "Byline" | "HomeLink";
};

export type OnNavigate = (info: NavigateInfo) => void;
