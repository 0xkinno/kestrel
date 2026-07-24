"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WarningActions({
  warningId,
  status,
  initialTitle,
  initialBody,
}: {
  warningId: string;
  status: "DRAFT" | "APPROVED" | "DISPATCHED";
  initialTitle: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [editing, setEditing] = useState(false);

  async function approve() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/warnings/${warningId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: "Demo Officer", title, body }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not approve.");
      return;
    }
    router.refresh();
  }

  async function dispatch() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/warnings/${warningId}/dispatch`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not dispatch.");
      return;
    }
    router.refresh();
  }

  if (status === "DISPATCHED") return null;

  return (
    <div className="border border-hairline p-6">
      <p className="text-sm font-data uppercase tracking-wide text-ink-faint mb-4">
        Human-in-the-loop review
      </p>
      {status === "DRAFT" && (
        <>
          <p className="text-sm text-ink-muted mb-4">
            This warning has not been reviewed yet. An officer must approve it -
            editing the wording if needed - before it can be dispatched to anyone.
          </p>

          {editing ? (
            <div className="space-y-3 mb-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-hairline bg-paper px-3 py-2 text-lg"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full border border-hairline bg-paper px-3 py-2 text-sm leading-relaxed"
              />
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={approve}
              className="px-5 py-2.5 text-sm bg-accent text-paper hover:bg-accent-ink disabled:opacity-50"
            >
              {editing ? "Save edits & approve" : "Approve as Demo Officer"}
            </button>
            <button
              disabled={busy}
              onClick={() => setEditing((v) => !v)}
              className="px-5 py-2.5 text-sm border border-ink hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              {editing ? "Cancel edit" : "Edit wording"}
            </button>
          </div>
        </>
      )}
      {status === "APPROVED" && (
        <>
          <p className="text-sm text-ink-muted mb-4">
            Approved. Dispatching will send a real Telegram message to any
            recipient who has started the bot, and record a simulated
            SMS/USSD dispatch for everyone else at this location.
          </p>
          <button
            disabled={busy}
            onClick={dispatch}
            className="px-5 py-2.5 text-sm bg-accent text-paper hover:bg-accent-ink disabled:opacity-50"
          >
            Dispatch now
          </button>
        </>
      )}
      {error && <p className="mt-3 text-sm text-severity-emergency">{error}</p>}
    </div>
  );
}
