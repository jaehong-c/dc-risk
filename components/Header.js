"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOOLS = [
  { key: "screener", label: "Site Screener", href: "https://dc-screener.vercel.app" },
  { key: "lease", label: "Lease", href: "https://dc-lease.vercel.app" },
  { key: "risk", label: "Risk Register", href: null },
];

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
          <div className="flex items-center gap-2">
            <span className="eyebrow" style={{ color: "var(--ink-3)" }}>DC tools</span>
            <div
              className="flex items-center"
              style={{ border: "1px solid var(--line-2)", borderRadius: 4, overflow: "hidden" }}
            >
              {TOOLS.map((t, i) => {
                const current = t.href === null;
                const style = {
                  padding: "0 10px",
                  height: 26,
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 11.5,
                  fontWeight: current ? 600 : 500,
                  color: current ? "#fff" : "var(--ink-2)",
                  background: current ? "var(--ink)" : "var(--surface)",
                  borderLeft: i === 0 ? "none" : "1px solid var(--line-2)",
                  textDecoration: "none",
                };
                return current ? (
                  <span key={t.key} style={style}>{t.label}</span>
                ) : (
                  <a key={t.key} href={t.href} target="_blank" rel="noreferrer" style={style}>
                    {t.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}