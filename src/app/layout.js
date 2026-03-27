import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ThemeToggle from "../components/ThemeToggle";
import InstallPrompt from "@/components/InstallPrompt";
import InstallAppButton from "@/components/InstallAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quran Progress Tracker",
  description:
    "Simple one-page tracker for Quran reading progress by Juz or Surah/Aayah.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text-primary font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
          }}
        />
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b bg-background/70 backdrop-blur">
          <span className="font-semibold tracking-tight text-lg text-primary">
            Qur&apos;an Progress
          </span>
          <div className="flex items-center gap-2">
            <InstallAppButton />
            <ThemeToggle />
          </div>
        </header>

        <main className="w-full max-w-2xl mx-auto px-4 py-6 flex-1">
          {children}
        </main>

        <footer className="border-t text-center py-2 text-xs opacity-70">
          <p>Track. Continue. Complete.</p>
          <p>v1.0 • Offline friendly • Private</p>
        </footer>
        <InstallPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
