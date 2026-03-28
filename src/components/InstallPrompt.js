"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useInstall } from "@/components/InstallContext";

const PROMPT_DISMISSED_KEY = "installPromptDismissed";
const PROMPT_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export default function InstallPrompt() {
  const { deferredPrompt, isStandalone, runInstallPrompt } = useInstall();
  const [isMobile, setIsMobile] = useState(false);
  const [isBlocked, setIsBlocked] = useState(() => {
    if (typeof window === "undefined") return true;
    const ts = Number(window.localStorage.getItem(PROMPT_DISMISSED_KEY) || "0");
    return Number.isFinite(ts) && Date.now() - ts < PROMPT_COOLDOWN_MS;
  });
  const autoHideTimeoutRef = useRef(null);

  const markDismissed = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now()));
    setIsBlocked(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => {
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isMobileWidth = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(coarsePointer && isMobileWidth);
    });
  }, []);

  const shouldShow =
    !isBlocked && !isStandalone && isMobile && Boolean(deferredPrompt);

  useEffect(() => {
    if (!shouldShow) return undefined;
    autoHideTimeoutRef.current = window.setTimeout(() => {
      markDismissed();
    }, 6000);
    return () => {
      if (autoHideTimeoutRef.current) {
        window.clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }
    };
  }, [shouldShow]);

  const install = async () => {
    await runInstallPrompt();
  };

  if (typeof document === "undefined" || !shouldShow) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-2xl shadow-xl bg-primary text-white px-5 py-4 flex items-center justify-between gap-4 max-w-sm w-[90%] z-50">
      <div>
        <p className="text-sm font-semibold">Install Qur&apos;an Tracker</p>
        <p className="text-sm text-white/90">Resume reading instantly 📖</p>
      </div>
      <button
        type="button"
        onClick={install}
        className="cursor-pointer rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
      >
        Install
      </button>
    </div>,
    document.body,
  );
}
