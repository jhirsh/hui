"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavLink } from "./types";

export default function Sidebar({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* In-flow (not fixed) so it pushes content down instead of overlapping it. */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-xl cursor-pointer bg-[#111] dark:bg-[#333] text-white px-4 py-4 m-4 hover:bg-[#444]"
      >
        ☰
      </button>
      <nav
        className={`fixed top-0 left-0 h-full z-10 overflow-x-hidden bg-white dark:bg-[#1e1e1e] transition-[width] duration-300
          md:w-[30%] md:visible md:pt-[60px] md:border-0
          ${open ? "w-[175px] visible border-r border-[#e0e0e0] dark:border-[#333]" : "w-0 invisible"} pt-4 pl-4`}
      >
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-xl cursor-pointer bg-[#111] dark:bg-[#333] text-white px-4 py-4 mb-7 hover:bg-[#444]"
        >
          ☰
        </button>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block no-underline text-lg md:text-[25px] md:ml-[20%] py-2.5 px-2 text-[#818181] dark:text-[#b0b0b0] hover:text-black dark:hover:text-white transition"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
