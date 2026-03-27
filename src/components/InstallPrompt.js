"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PROMPT_DISMISSED_KEY = "installPromptDismissed";
const PROMPT_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);
  const [mounted, setMounted] = useState(false);
  const autoHideTimeoutRef = useRef(null);

  const isBlockedByCooldown = () => {
    const ts = Number(localStorage.getItem(PROMPT_DISMISSED_KEY) || "0");
    return Number.isFinite(ts) && Date.now() - ts < PROMPT_COOLDOWN_MS;
  };

  const markDismissed = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now()));
    setIsBlocked(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    setIsBlocked(isBlockedByCooldown());

    const refreshState = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsInstalled(standalone);
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isMobileWidth = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(coarsePointer && isMobileWidth);
    };

    refreshState();

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setVisible(false);
      setIsInstalled(true);
      setIsBlocked(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (isBlocked || isInstalled || !isMobile || !deferredPrompt) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [deferredPrompt, isBlocked, isInstalled, isMobile]);

  useEffect(() => {
    if (!visible) return undefined;
    autoHideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      markDismissed();
    }, 6000);
    return () => {
      if (autoHideTimeoutRef.current) {
        window.clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }
    };
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    markDismissed();
  };

  const install = async () => {
    if (!deferredPrompt) return;
    setVisible(false);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!mounted || !visible || isInstalled || !isMobile || !deferredPrompt) {
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
        className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
      >
        Install
      </button>
    </div>,
    document.body,
  );
}
