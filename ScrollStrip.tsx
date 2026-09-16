"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State for a horizontally scrolling strip: how far it can still scroll each
 * way, and a one-card step. The strip's markup stays with the caller — snap,
 * padding, and edge fades differ per site. Pair with <ScrollArrow />.
 */
export function useScrollStrip<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  // Pixels left to scroll in each direction.
  const [[before, after], setRoom] = useState([0, 0]);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setRoom([el.scrollLeft, Math.max(0, el.scrollWidth - el.clientWidth - el.scrollLeft)]);
  }, []);

  // Measure on mount and whenever the strip resizes, so a strip whose cards all
  // fit never shows a "more this way" arrow.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onScroll();
    const observer = new ResizeObserver(onScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onScroll]);

  // Advance exactly one card: cards can differ in width, so step to the next
  // child edge rather than a fraction of the viewport.
  const scroll = useCallback((dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const left = el.getBoundingClientRect().left + pad;
    const edges = Array.from(el.children).map((c) => c.getBoundingClientRect().left - left);
    const next = dir > 0 ? edges.find((d) => d > 8) : edges.filter((d) => d < -8).pop();
    el.scrollBy({ left: next ?? dir * el.clientWidth, behavior: "smooth" });
  }, []);

  // 8px of slack so sub-pixel scroll positions don't leave an arrow stuck on.
  return { ref, onScroll, before, after, atStart: before < 8, atEnd: after < 8, scroll };
}

/**
 * Prev/next arrow for a scroll strip. Absolutely positioned at the vertical
 * centre, so its parent needs `relative`. Only rendered for fine pointers: a
 * mouse wheel can't scroll sideways without Shift, but touch and trackpads can
 * swipe. Fades out and stops taking clicks when there's nothing more that way.
 */
export function ScrollArrow({
  dir,
  show,
  onClick,
  className = "",
}: {
  dir: -1 | 1;
  show: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!show}
      aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
      className={`absolute top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white backdrop-blur transition-opacity duration-200 hover:bg-black/70 pointer-fine:block ${
        dir < 0 ? "left-1" : "right-1"
      } ${show ? "opacity-100" : "pointer-events-none opacity-0"} ${className}`}
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points={dir < 0 ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
}
