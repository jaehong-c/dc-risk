"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ right }) {
  const path = usePathname();
  const link = (href, label) => (
    <Link
      href={href}
      className="text-[12.5px]"
      style={{
        color: path === href ? "var(--ink)" : "var(--ink-3)",
        fontWeight: path === href ? 600 : 500,
        borderBottom: path === href ? "2px solid var(--ink)" : "2px solid transparent",
        paddingBottom: 2,
      }}
    >
      {label}
    </Link>
  );

  return (
    <header className="h-14 border-b border-line bg-surface">
      <div
        className="mx-auto h-full max-w-[1440px] px-6"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div className="flex items-baseline" style={{ gap: 28 }}>
          <div className="flex items-baseline gap-3">
            <Link href="/" className="display text-[15px]">
              DC Risk Register
            </Link>
            <span className="eyebrow">Lifecycle risk · v0.1</span>
          </div>
          <nav className="flex items-baseline" style={{ gap: 18 }}>
            {link("/", "Register")}
            {link("/about", "About")}
          </nav>
        </div>
        <div className="flex items-center" style={{ gap: 24 }}>
          {right}
          <span className="mono text-[11px] text-ink-3">Prototype · curated risk library</span>
        </div>
      </div>
    </header>
  );
}