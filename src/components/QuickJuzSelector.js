"use client";

export default function QuickJuzSelector({
  latestProgress,
  onSelectJuz,
  selectedJuzNumber,
}) {
  const { latestJuzNumberInt } = latestProgress;
  if (
    !Number.isInteger(latestJuzNumberInt) ||
    latestJuzNumberInt < 1 ||
    latestJuzNumberInt > 30
  ) {
    return null;
  }

  const quickJuzOptions =
    latestJuzNumberInt >= 29
      ? [28, 29, 30]
      : [latestJuzNumberInt, latestJuzNumberInt + 1, latestJuzNumberInt + 2];

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
        {quickJuzOptions.map((juzNumber) => (
          <button
            key={juzNumber}
            type="button"
            onClick={() => onSelectJuz(juzNumber)}
            className={[
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              selectedJuzNumber === juzNumber
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
            ].join(" ")}
          >
            Juz {juzNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
