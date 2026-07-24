import Link from "next/link";
import { prisma } from "@/lib/db";
import SeverityBadge from "@/components/SeverityBadge";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Awaiting review",
  APPROVED: "Approved - not yet dispatched",
  DISPATCHED: "Dispatched",
};

export default async function WarningsPage() {
  const warnings = await prisma.warning.findMany({
    orderBy: { createdAt: "desc" },
    include: { location: true, hazardSignal: true },
  });

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">Warning feed</p>
        <h1 className="mt-3 text-4xl">Every warning, in the language it was sent.</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Each entry below is a real Groq-generated warning drafted from an actual
          hazard reading - not placeholder copy. Nothing here is dispatched without
          an officer&rsquo;s approval first.
        </p>

        <div className="mt-14 divide-y divide-hairline border-t border-hairline">
          {warnings.length === 0 && (
            <p className="py-10 text-ink-faint">
              No warnings generated yet. Head to the{" "}
              <Link href="/admin" className="underline underline-offset-4">
                admin console
              </Link>{" "}
              to pull hazard data and draft the first one.
            </p>
          )}

          {warnings.map((w) => (
            <Link
              key={w.id}
              href={`/warnings/${w.id}`}
              className="group grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:gap-6 hover:bg-paper-dim transition-colors px-2 -mx-2"
            >
              <div className="md:col-span-2 flex flex-col gap-2">
                <SeverityBadge severity={w.severity} />
                <span className="font-data text-[11px] text-ink-faint">
                  {new Date(w.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="md:col-span-7">
                <h2 className="text-xl group-hover:text-accent-ink transition-colors">{w.title}</h2>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-2">{w.body}</p>
              </div>
              <div className="md:col-span-3 md:text-right">
                <p className="text-sm">
                  {w.location.name}, {w.location.ward}
                </p>
                <p className="text-xs text-ink-faint mt-1">{w.location.country}</p>
                <p className="text-xs font-data uppercase tracking-wide text-ink-faint mt-2">
                  {STATUS_LABEL[w.status]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
