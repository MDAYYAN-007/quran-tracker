"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "quran-tracker-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  // Keep first render deterministic for SSR/CSR hydration.
  const [theme, setTheme] = useState("light");

  const icon = useMemo(() => {
    // Show the "next" theme icon for clarity.
    return theme === "dark" ? <SunIcon /> : <MoonIcon />;
  }, [theme]);

  useEffect(() => {
    const applyTheme = (nextTheme) => {
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    };

    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    const nextTheme =
      stored === "light" || stored === "dark" ? stored : getSystemTheme();
    applyTheme(nextTheme);

    // If the user hasn't chosen manually, follow system changes.
    if (stored !== "light" && stored !== "dark" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme(mq.matches ? "dark" : "light");

      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    document.documentElement.dataset.theme = next;
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="h-10 w-10 cursor-pointer flex items-center justify-center rounded-full border border-border bg-surface/70 transition-all duration-200 ease-out hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {icon}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-text-primary"
      aria-hidden="true"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-text-primary"
      aria-hidden="true"
    >
      <path
        d="M20.74 13.05a8 8 0 1 1-9.79-9.79 1 1 0 0 1 1.24 1.24 6 6 0 0 0 7.31 7.31 1 1 0 0 1 1.24 1.24Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
