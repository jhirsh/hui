"use client";

/**
 * Inline text toggle, sized to sit in a footer row. Uses currentColor so it
 * inherits the host page's palette, same as SiteFooter.
 */
export default function DarkModeToggle({
  label = "Dark mode",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={() => {
        const on = document.documentElement.classList.toggle("dark");
        localStorage.setItem("darkMode", on ? "enabled" : "disabled");
      }}
      className={`cursor-pointer text-current/60 transition-colors hover:text-current ${className}`}
    >
      {label}
    </button>
  );
}
