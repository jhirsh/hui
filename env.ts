/**
 * True when the page is being served from a development machine.
 *
 * hui itself never sends anything — the components only call the callbacks you
 * give them — so this is here for the consumer's analytics init, which is where
 * the decision belongs. Keyed on hostname rather than NODE_ENV, because a
 * static export served locally (`next build && npx serve out`) runs as
 * production and is exactly when real traffic is easy to pollute.
 *
 * Returns false during SSR: there is no hostname to judge, and the client
 * re-evaluates on hydration anyway.
 */
export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "::1" ||
    h.endsWith(".local") ||
    h.endsWith(".localhost")
  );
}
