"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const InstallContext = createContext(null);

const PWA_INSTALLED_KEY = "pwaInstalled";
const INSTALL_FALLBACK_MS = 20000;
const SUCCESS_TOAST_MS = 4000;
const INSTALL_GRACE_MS = 5000;
const APP_INSTALLED_POLL_MS = 1200;
const APP_INSTALLED_POLL_MAX_ATTEMPTS = 10;
const APP_INSTALLED_FALLBACK_NO_API_MS = 3000;

export function InstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installState, setInstallState] = useState("idle");
  const [showInstallSuccess, setShowInstallSuccess] = useState(false);

  const deferredPromptRef = useRef(null);
  const installFallbackTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const installStateRef = useRef(installState);
  const installJustCompletedGraceUntilRef = useRef(0);
  const installFinalizedRef = useRef(false);
  const appInstalledHandlingRef = useRef(false);
  const installCheckIntervalRef = useRef(null);

  useEffect(() => {
    deferredPromptRef.current = deferredPrompt;
  }, [deferredPrompt]);

  useEffect(() => {
    installStateRef.current = installState;
  }, [installState]);

  const clearInstallFallback = useCallback(() => {
    if (installFallbackTimeoutRef.current) {
      window.clearTimeout(installFallbackTimeoutRef.current);
      installFallbackTimeoutRef.current = null;
    }
  }, []);

  const clearInstallPoll = useCallback(() => {
    if (installCheckIntervalRef.current) {
      window.clearInterval(installCheckIntervalRef.current);
      installCheckIntervalRef.current = null;
    }
  }, []);

  const clearSuccessToast = useCallback(() => {
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const refreshEnvironment = useCallback(async () => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) {
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, "true");
      } catch {
        /* ignore */
      }
      setInstallState("installed");
      return;
    }

    if (installStateRef.current === "installing") {
      return;
    }

    if (!navigator.getInstalledRelatedApps) {
      return;
    }

    try {
      const apps = await navigator.getInstalledRelatedApps();
      const installed = Array.isArray(apps) && apps.length > 0;
      if (installed) {
        try {
          localStorage.setItem(PWA_INSTALLED_KEY, "true");
        } catch {
          /* ignore */
        }
        setInstallState("installed");
      } else {
        const now = Date.now();
        if (now < installJustCompletedGraceUntilRef.current) {
          return;
        }
        try {
          localStorage.removeItem(PWA_INSTALLED_KEY);
        } catch {
          /* ignore */
        }
        setInstallState((prev) => (prev === "installed" ? "idle" : prev));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    void refreshEnvironment();

    const onVisibilityOrFocus = () => {
      refreshEnvironment();
    };

    window.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("focus", onVisibilityOrFocus);

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      installFinalizedRef.current = false;
      appInstalledHandlingRef.current = false;
      try {
        localStorage.removeItem(PWA_INSTALLED_KEY);
      } catch {
        /* ignore */
      }
      setDeferredPrompt(event);
      void refreshEnvironment();
    };

    const onAppInstalled = () => {
      if (appInstalledHandlingRef.current || installFinalizedRef.current) {
        return;
      }
      appInstalledHandlingRef.current = true;
      clearInstallFallback();
      setDeferredPrompt(null);
      setInstallState("installing");
      installJustCompletedGraceUntilRef.current = Date.now() + INSTALL_GRACE_MS;

      const finalizeInstalled = () => {
        if (installFinalizedRef.current) return;
        installFinalizedRef.current = true;
        appInstalledHandlingRef.current = false;
        clearInstallPoll();
        setInstallState("installed");
        try {
          localStorage.setItem(PWA_INSTALLED_KEY, "true");
        } catch {
          /* ignore */
        }
        clearSuccessToast();
        setShowInstallSuccess(true);
        successTimeoutRef.current = window.setTimeout(() => {
          setShowInstallSuccess(false);
        }, SUCCESS_TOAST_MS);
        void refreshEnvironment();
      };

      if (navigator.getInstalledRelatedApps) {
        let attempts = 0;
        installCheckIntervalRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const apps = await navigator.getInstalledRelatedApps();
            if (Array.isArray(apps) && apps.length > 0) {
              finalizeInstalled();
            } else if (attempts >= APP_INSTALLED_POLL_MAX_ATTEMPTS) {
              finalizeInstalled();
            }
          } catch {
            if (attempts >= APP_INSTALLED_POLL_MAX_ATTEMPTS) {
              finalizeInstalled();
            }
          }
        }, APP_INSTALLED_POLL_MS);
      } else {
        window.setTimeout(finalizeInstalled, APP_INSTALLED_FALLBACK_NO_API_MS);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("focus", onVisibilityOrFocus);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      clearInstallFallback();
      clearInstallPoll();
      clearSuccessToast();
    };
  }, [refreshEnvironment, clearInstallFallback, clearSuccessToast, clearInstallPoll]);

  const runInstallPrompt = useCallback(async () => {
    const p = deferredPromptRef.current;
    if (!p) return;

    clearInstallFallback();

    await p.prompt();
    const choiceResult = await p.userChoice;
    setDeferredPrompt(null);

    if (choiceResult?.outcome === "accepted") {
      setInstallState("installing");
      installFallbackTimeoutRef.current = window.setTimeout(() => {
        if (installStateRef.current === "installing") {
          setInstallState("idle");
        }
        installFallbackTimeoutRef.current = null;
      }, INSTALL_FALLBACK_MS);
      return;
    }

    setInstallState("idle");
    return false;
  }, [clearInstallFallback]);

  const value = {
    deferredPrompt,
    isStandalone,
    installState,
    runInstallPrompt,
  };

  return (
    <>
      <InstallContext.Provider value={value}>{children}</InstallContext.Provider>
      {showInstallSuccess && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed bottom-5 left-1/2 z-50 max-w-sm w-[90%] -translate-x-1/2 rounded-2xl bg-primary px-5 py-4 text-white shadow-xl">
              <div>
                <p className="text-sm font-semibold">
                  ✅ Qur&apos;an Tracker installed successfully
                </p>
                <p className="text-sm text-white/90">
                  Open it from your home screen anytime 📖
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function useInstall() {
  const ctx = useContext(InstallContext);
  if (!ctx) {
    throw new Error("useInstall must be used within InstallProvider");
  }
  return ctx;
}
