"use client";

import { useState } from "react";

export default function HistoryPanel({
  history,
  formatJuzProgress,
  formatSurahProgress,
  onClearHistory,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClearHistory = () => {
    setIsConfirmOpen(true);
  };

  const confirmClear = () => {
    onClearHistory?.();
    setIsConfirmOpen(false);
  };

  return (
    <section className="rounded-2xl border border-muted bg-surface p-4 sm:p-5">
      <h2 className="text-xl font-semibold">Recent History</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">No entries yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-muted bg-surface p-3"
            >
              <p className="text-sm text-text-primary">
                {entry.mode === "juz"
                  ? formatJuzProgress(entry.payload)
                  : formatSurahProgress(entry.payload)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {new Date(entry.savedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {history.length > 0 ? (
        <button
          type="button"
          onClick={handleClearHistory}
          className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear history
        </button>
      ) : null}

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-text-primary">
              Clear history?
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Clear all history entries? This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface/70 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClear}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
