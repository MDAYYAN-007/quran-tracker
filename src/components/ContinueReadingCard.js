"use client";

export default function ContinueReadingCard({
  latestProgress,
  formatSurahProgress,
  formatJuzProgress,
}) {
  const { isReady, latestSurah, latestJuz } = latestProgress;
  if (!isReady || (!latestSurah && !latestJuz)) return null;

  return (
    <section className="continue-reading-card rounded-2xl border border-primary/40 bg-primary/5 p-4 shadow-sm dark:bg-primary/10 leading-tight">
      <h2 className="text-lg font-semibold">Continue Reading</h2>
      <div className="mt-3 space-y-2">
        {latestSurah ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Last Surah position</p>
            <p className="text-sm font-medium">
              {formatSurahProgress(latestSurah.payload)}
            </p>
          </div>
        ) : null}

        {latestJuz ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Last Juz position</p>
            <p className="text-sm font-medium">
              {formatJuzProgress(latestJuz.payload)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
