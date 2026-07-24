type Channel = "TELEGRAM" | "SIMULATED_SMS" | "SIMULATED_USSD" | "IN_APP";

const LABEL: Record<Channel, string> = {
  TELEGRAM: "Telegram - live",
  SIMULATED_SMS: "SMS - delivery simulation",
  SIMULATED_USSD: "USSD - delivery simulation",
  IN_APP: "In-app",
};

export default function ChannelBadge({ channel }: { channel: Channel }) {
  const isSimulated = channel !== "TELEGRAM";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-data uppercase tracking-[0.1em] ${
        isSimulated ? "text-ink-faint" : "text-accent-ink"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isSimulated ? "bg-ink-faint" : "bg-accent"}`}
      />
      {LABEL[channel]}
    </span>
  );
}
