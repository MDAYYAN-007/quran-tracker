"use client";

export default function QuickJuzSelector({
  latestProgress,
  onSelectJuz,
  selectedJuzNumber,
}) {
  const { latestJuzNumberInt, prevJuz, nextJuz } = latestProgress;
  if (
    !Number.isInteger(latestJuzNumberInt) ||
    latestJuzNumberInt < 1 ||
    latestJuzNumberInt > 30
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-muted bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-text-secondary">Quick Juz</div>
          <div className="mt-1 text-sm font-semibold text-text-primary">
            Continue from your latest saved point
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => prevJuz && onSelectJuz(prevJuz)}
          disabled={prevJuz === null || prevJuz < 1}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            Number.isInteger(prevJuz) && selectedJuzNumber === prevJuz
              ? "border-primary bg-primary text-on-primary"
              : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          {prevJuz && prevJuz >= 1 ? `Juz ${prevJuz}` : "Prev"}
        </button>

        <button
          type="button"
          onClick={() => onSelectJuz(latestJuzNumberInt)}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            selectedJuzNumber === latestJuzNumberInt
              ? "border-primary bg-primary text-on-primary"
              : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
          ].join(" ")}
        >
          Juz {latestJuzNumberInt}
        </button>

        <button
          type="button"
          onClick={() => nextJuz && onSelectJuz(nextJuz)}
          disabled={nextJuz === null || nextJuz > 30}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            Number.isInteger(nextJuz) && selectedJuzNumber === nextJuz
              ? "border-primary bg-primary text-on-primary"
              : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          {nextJuz && nextJuz <= 30 ? `Juz ${nextJuz}` : "Next"}
        </button>
      </div>
    </div>
  );
}
