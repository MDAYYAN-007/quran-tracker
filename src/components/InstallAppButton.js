"use client";

import { useInstall } from "@/components/InstallContext";

export default function InstallAppButton() {
  const { isStandalone, deferredPrompt, installState, runInstallPrompt } =
    useInstall();

  if (isStandalone) return null;

  const label =
    installState === "installed"
      ? "App Installed"
      : installState === "installing"
        ? "Installing..."
        : "Install App";

  const disabled =
    installState === "installing" || installState === "installed";

  const showInstallControl =
    installState === "installing" ||
    installState === "installed" ||
    deferredPrompt != null;

  if (!showInstallControl) return null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => runInstallPrompt()}
      className={[
        "text-sm px-3 py-1.5 rounded-lg border border-primary/40 text-primary bg-primary/5 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-80"
          : "cursor-pointer hover:bg-primary/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
