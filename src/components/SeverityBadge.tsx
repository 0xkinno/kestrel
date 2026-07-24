type Severity = "WATCH" | "WARNING" | "EMERGENCY";

const CONFIG: Record<Severity, { label: string; bg: string; fg: string }> = {
  WATCH: { label: "Watch", bg: "bg-severity-watch", fg: "text-ink" },
  WARNING: { label: "Warning", bg: "bg-severity-warning", fg: "text-paper" },
  EMERGENCY: { label: "Emergency", bg: "bg-severity-emergency", fg: "text-paper" },
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const c = CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-data uppercase tracking-[0.12em] ${c.bg} ${c.fg}`}
    >
      {c.label}
    </span>
  );
}
