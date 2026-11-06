"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/identity";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Identity">
      {routes.map((route) => {
        const current =
          route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
        return (
          <Link
            key={route.href}
            href={route.href}
            aria-current={current ? "page" : undefined}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
