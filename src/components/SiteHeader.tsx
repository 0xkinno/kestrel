import Link from "next/link";

const NAV = [
  { href: "/map", label: "Map" },
  { href: "/warnings", label: "Warnings" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/about-data", label: "About the data" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-5 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-3 shrink-0">
          <span className="text-xl font-[family-name:var(--font-headline)] tracking-tight">
            Kestrel
          </span>
          <span className="hidden sm:inline text-[11px] font-data uppercase tracking-[0.14em] text-ink-faint">
            Early warning, verified
          </span>
        </Link>
        <nav className="flex items-center gap-5 md:gap-7 text-sm overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-ink-muted hover:text-accent-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
