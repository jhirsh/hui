import { tokens } from "./tokens";
import type { OnNavigate } from "./types";

/**
 * Attribution line: who made it, and optionally when and where.
 * Renders "by Jonas Hirshland · June – August 2026 · Basque coast".
 */
export default function Byline({
  name = "Jonas Hirshland",
  href = "https://hirshland.xyz",
  date,
  location,
  prefix = "by",
  className = "",
  onNavigate,
}: {
  name?: string;
  /** Omit to render the name as plain text instead of a link. */
  href?: string;
  date?: string;
  location?: string;
  prefix?: string;
  className?: string;
  /** Called on click, before navigation. For analytics; see README. */
  onNavigate?: OnNavigate;
}) {
  const details = [date, location].filter(Boolean);

  // Muted styles go on the individual parts, never on a wrapper around the
  // link. currentColor alphas compound, so nesting text-current/60 inside
  // text-current/40 lands at ~24% and makes the link fainter than the plain
  // text beside it.
  return (
    <span className={`text-sm ${className}`}>
      {prefix && <span className={tokens.subtle}>{prefix} </span>}
      {href ? (
        <a
          href={href}
          className={tokens.link}
          onClick={onNavigate && (() => onNavigate({ to: href, label: name, from: "Byline" }))}
        >
          {name}
        </a>
      ) : (
        <span className={tokens.muted}>{name}</span>
      )}
      {details.map((d) => (
        <span key={d} className={tokens.subtle}>
          <span className="mx-1.5">&middot;</span>
          {d}
        </span>
      ))}
    </span>
  );
}
