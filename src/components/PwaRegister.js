"use client";

/**
 * next-pwa injects register.js into the legacy `main.js` webpack entry.
 * Next.js App Router uses `main` / `main-app` entries, so that injection often
 * never runs — the service worker is built but never registered.
 * Importing `next-pwa/register` here runs the same registration in the client bundle
 * (with the same DefinePlugin globals from next-pwa).
 */
import "next-pwa/register";

export default function PwaRegister() {
  return null;
}
