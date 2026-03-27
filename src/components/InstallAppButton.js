"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const APP_INSTALLED_KEY = "quranTrackerAppInstalled";
const INSTALLING_TIMEOUT_MS = 30000;
const INSTALL_CONFIRMATION_DELAY_MS = 10000;
const BUTTON_PLACEHOLDER_CLASS = "inline-block h-8 w-[108px]";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasInstalledRecord, setHasInstalledRecord] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const installTimeoutRef = useRef(null);
  const installCheckIntervalRef = useRef(null);
  const installFinalizedRef = useRef(false);
  const successTimeoutRef = useRef(null);

  const clearInstallTimers = () => {
    if (installTimeoutRef.current) {
      window.clearTimeout(installTimeoutRef.current);
      installTimeoutRef.current = null;
    }
    if (installCheckIntervalRef.current) {
      window.clearInterval(installCheckIntervalRef.current);
      installCheckIntervalRef.current = null;
    }
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const finalizeInstalled = () => {
    if (installFinalizedRef.current) return;
    installFinalizedRef.current = true;
    localStorage.setItem(APP_INSTALLED_KEY, "true");
    setHasInstalledRecord(true);
    setIsInstalling(false);
    setDeferredPrompt(null);
    clearInstallTimers();
    setShowSuccessCard(true);
    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccessCard(false);
    }, 4000);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshState = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);

      if (localStorage.getItem(APP_INSTALLED_KEY) === "true") {
        setHasInstalledRecord(true);
      }
    };

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      installFinalizedRef.current = false;
      // Keep prior install state stable until explicit install confirmation.
    };

    const onInstalled = () => {
      if (installFinalizedRef.current) return;
      // appinstalled can fire before launcher/icon visibility on some devices.
      // Keep "Installing..." state and verify/fallback before marking installed.
      setIsInstalling(true);
      setDeferredPrompt(null);

      if (navigator.getInstalledRelatedApps) {
        let attempts = 0;
        installCheckIntervalRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const apps = await navigator.getInstalledRelatedApps();
            if (Array.isArray(apps) && apps.length > 0) {
              finalizeInstalled();
              return;
            }
          } catch {
            // ignore and continue fallback checks
          }
          if (attempts >= 10) {
            finalizeInstalled();
          }
        }, 1200);
      } else {
        installTimeoutRef.current = window.setTimeout(() => {
          finalizeInstalled();
        }, INSTALL_CONFIRMATION_DELAY_MS);
      }

      refreshState();
    };

    refreshState();
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Best-effort: detect existing install from supported browsers.
    if (navigator.getInstalledRelatedApps) {
      navigator
        .getInstalledRelatedApps()
        .then((apps) => {
          if (Array.isArray(apps) && apps.length > 0) {
            localStorage.setItem(APP_INSTALLED_KEY, "true");
            setHasInstalledRecord(true);
          }
        })
        .catch(() => {
          // ignore
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearInstallTimers();
    };
  }, []);

  // Never show this button inside the installed app window.
  if (isStandalone) return null;

  const showInstalled = hasInstalledRecord;
  const showInstalling = !showInstalled && isInstalling;
  const showInstall = !showInstalled && !showInstalling && Boolean(deferredPrompt);

  return (
    <>
      {showInstalled ? (
        <span className="text-sm px-3 py-1.5 rounded-lg border border-primary/40 text-primary bg-primary/5">
          App Installed
        </span>
      ) : showInstalling ? (
        <span className="text-sm px-3 py-1.5 rounded-lg border border-primary/40 text-primary bg-primary/5">
          Installing...
        </span>
      ) : showInstall ? (
        <button
          type="button"
          onClick={async () => {
            if (!deferredPrompt) return;
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice?.outcome === "accepted") {
              installFinalizedRef.current = false;
              setIsInstalling(true);
              setDeferredPrompt(null);
              clearInstallTimers();
              installTimeoutRef.current = window.setTimeout(() => {
                setIsInstalling(false);
              }, INSTALLING_TIMEOUT_MS);
            }
          }}
          className="text-sm px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
        >
          Install App
        </button>
      ) : (
        <span className={`${BUTTON_PLACEHOLDER_CLASS} invisible`} aria-hidden="true" />
      )}

      {showSuccessCard && isMounted
        ? createPortal(
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-2xl shadow-xl bg-primary text-white px-5 py-4 max-w-sm w-[90%] z-50">
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
