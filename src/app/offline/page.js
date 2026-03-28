"use client";

export default function OfflinePage() {
  return (
    <div className="w-full py-10 sm:py-14">
      <section className="rounded-2xl border border-muted bg-surface p-6 sm:p-7 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          You are offline
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Quran Tracker usually opens the main page offline. This screen appears
          only when the app shell is unavailable.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-all duration-200 ease-out hover:bg-primary/90"
        >
          Retry
        </button>
      </section>
    </div>
  );
}
