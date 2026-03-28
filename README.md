# Qur’an Progress Tracker

A focused web app for recording and resuming Qur’an reading progress by **Juz** or **Surah / Ayah**, with offline support and optional install as a Progressive Web App.

---

## Live demo

**Live site:** [https://quran-tracker-v1.vercel.app](https://quran-tracker-v1.vercel.app)

---

## Overview

**What it solves**  
Readers often pause mid-Juz or mid-Surah. This app gives you one place to note *where you stopped* so you can continue without re-figuring your place.

**Who it is for**  
Anyone who reads the Qur’an regularly (or on a schedule) and wants a simple, private log—not a full learning platform or social feed.

**Why offline-first matters**  
Many people read on phones or in places with weak or no connectivity. Caching the app shell and assets means the tracker can still open and your saved progress remains available in the browser.

**Why PWA installability is useful**  
Installing adds a home-screen shortcut, often a standalone window, and makes the experience feel closer to a native app—without an app store.

**Juz vs Surah tracking (conceptually)**  

- **By Juz:** You record position within one of the thirty Ajzāʾ—either as a **portion** (e.g. start, quarter, half) or by **Rukūʿ** where data allows.  
- **By Surah:** You record **Surah + Ayah**, or **Surah + Rukūʿ**, depending on the mode you choose. Static maps in the project tie ranges together so the UI stays consistent with common divisions.

---

## Features

**Tracking**

- Toggle between **By Juz** and **By Surah** modes.  
- Juz: portion steps or rukūʿ selection; optional note.  
- Surah: ayah or surah-level rukūʿ, with validation against bundled range data.

**Persistence**

- Progress and a short history are saved in the browser (`localStorage`).  
- Versioned storage shape so the app can evolve safely.  
- Theme preference (light / dark) stored separately.

**Offline capability**

- Production builds use **next-pwa** and a **service worker** to cache the app shell and static assets after the first successful load.  
- The main tracker route is intended to work when offline once cached.

**Installability**

- Web App Manifest and icons for install prompts on supported browsers.  
- Header **Install** control and an optional mobile-friendly install prompt where the browser supports it.

**UI experience**

- Clear step-by-step form layout, quick Juz shortcuts, and a **Continue reading** summary.  
- Accessible patterns (e.g. single document `main` landmark, dialog attributes where used).  
- Light and dark themes with system preference support.

---

## App workflow

1. **Choose tracking mode** — Use the segmented control: **By Juz** or **By Surah**.  
2. **Set your position** — Pick Juz (and portion or rukūʿ), or Surah (and ayah or rukūʿ), following the on-screen steps.  
3. **Save progress** — Confirm; validation prevents obviously invalid combinations.  
4. **Resume later** — The **Continue reading** area shows your latest saved Juz and Surah positions when data exists.  
5. **Review history** — Open **Recent history** to see the last few saves; clear history if you want a fresh list.  
6. **Install for offline use** (optional) — Use **Install app** when the browser offers it; after install, open from the home screen or app list for a standalone-style experience.

---

## Screens / usage description

| Area | Purpose |
|------|--------|
| **Continue reading** | Surfaces the most recent saved Juz and Surah snapshots so you can see “where I left off” at a glance. |
| **Quick Juz selector** | Jumps to a Juz and, when possible, reapplies your last saved style of progress for that Juz (portion vs rukūʿ). |
| **Progress form** | Main flow: numbered steps, mode-specific fields, save and reset for the current tab. |
| **History panel** | Lists recent saves with timestamps; includes a guarded **Clear history** action. |
| **Install button** | Triggers the browser install flow when a `beforeinstallprompt` event is available; reflects installing / installed states. |

No screenshots are embedded in this repository; the live demo reflects the current UI.

---

## Tech stack

- **Next.js** (App Router)  
- **React**  
- **Tailwind CSS** (v4)  
- **next-pwa** (Workbox-powered service worker in production)  
- **localStorage** for reading progress and theme  
- **react-hot-toast** for lightweight notifications  
- **Vercel Analytics**  
- **Vercel Speed Insights**  

---

## Project structure

```text
src/
  app/                 # App Router: layout, home page, offline page, global styles, manifest route, app icon
  components/          # UI pieces (forms, install flow, theme, history, etc.)
  data/                # Static JSON maps (Juz ↔ rukūʿ / surah–ayah ranges)
public/                # Static assets, PWA icons, generated sw.js / workbox (from build)
scripts/               # Optional tooling (e.g. icon rasterization from canonical SVG)
```

- **`src/app/page.js`** — Client-side state, validation, persistence, and composition of the main tracker UI.  
- **`src/data/*.json`** — Bundled reference data; not fetched at runtime.  
- **`public/`** — Icons, favicon-style assets; service worker output lands here in production builds.

---

## Getting started

**Clone the repository**

```bash
git clone <your-repo-url>
cd quran-tracker
```

**Install dependencies**

```bash
npm install
```

**Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Service worker / full PWA behavior is **disabled** in development (see PWA section).

**Build and run production locally**

```bash
npm run build
npm run start
```

**Other scripts**

- `npm run lint` — ESLint  
- `npm run icons` — Regenerate PNG icons from `public/icon.svg` (requires dev dependency `sharp`)

---

## PWA behavior

- **Build:** `next-pwa` wraps the Next.js config for **production** only (`next build --webpack`). It generates `public/sw.js` and Workbox runtime scripts.  
- **Registration:** The app loads `next-pwa/register` from a small client component in production so the service worker registers under the App Router.  
- **Caching:** Precache plus runtime strategies (e.g. `NetworkFirst` for the start URL, `StaleWhileRevalidate` for many static assets). The `"others"` route is scoped to same-origin requests and excludes `/api/` and `/_next/data/`, with an extended network timeout for slow mobile networks.  
- **Manifest:** Served at `/manifest.webmanifest` via `src/app/manifest.js`.  
- **Offline route:** `/offline` exists as a fallback page; document-level Workbox fallbacks are intentionally **not** used, to avoid mis-serving the offline HTML on flaky connections.  
- **Front-end navigation:** `cacheOnFrontEndNav` is enabled to align with client navigations.

After changing icons, run `npm run icons` and commit updated PNGs if you rely on generated assets.

---

## Data persistence

| Key | Use |
|-----|-----|
| `quran-tracker` | Versioned object: `version`, `latest` (per-mode snapshots), `history` (recent entries, capped). |
| `quran-tracker-theme` | `light` or `dark` when the user overrides system preference. |
| `pwaInstalled` | Hint for install UI state (best-effort; reconciled with platform signals where available). |
| `installPromptDismissed` | Timestamp for cooling off the optional mobile install banner. |

**Privacy**

- **No backend** and **no accounts** for reading progress—data stays in the user’s browser.  
- **Vercel Analytics** and **Speed Insights** may collect anonymized usage metrics in production when deployed on Vercel; they do not store your Juz/Surah entries.

---

## Deployment

This project is set up for **[Vercel](https://vercel.com/)**:

- Connect the Git repository and set the **production branch** (e.g. `main` or `prod`).  
- Vercel runs `npm run build` and serves the output; environment variables are optional unless you add features that need them.  
- PWA assets and the service worker are part of the production build output under `public/`.

The live demo above reflects deployment from the maintained production configuration.

---

## Versioning strategy

Releases follow **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- **v1.0.0** — Initial stable public release.  
- **v1.x.x** — Minor features and fixes (backward compatible).  
- **v2.0.0** — Major changes that may alter behavior, storage format, or UX in breaking ways.

`package.json` may show `0.x` during early development; align published tags with the policy above when cutting releases.

---

## Contributing

Contributions are welcome once the project accepts external collaborators.

1. Open an issue to describe a bug or proposal before large changes.  
2. Fork the repository and create a focused branch.  
3. Keep pull requests small and scoped to one concern.  
4. Run `npm run lint` and `npm run build` before submitting.  
5. Match existing code style and avoid unrelated refactors.

If the repository remains private, treat this section as the default process when it goes public.

---

## License

This project is currently **private / internal** unless a `LICENSE` file is added. Do not redistribute or reuse beyond your agreement with the maintainers until a license is published.
