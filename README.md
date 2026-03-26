# Quran Progress Tracker

Quran Progress Tracker is a clean, offline-friendly web app for recording and resuming Quran reading progress by **Juz** or **Surah**.

It is designed for quick daily use with minimal friction: pick your mode, save your current position, and continue from where you stopped.

## Highlights

- Track progress by **Juz** or **Surah/Ayah**
- Save and resume latest reading positions
- Quick Juz navigation based on last saved entry
- Recent history with clear controls
- Light and dark theme support
- Installable as a Progressive Web App (PWA)

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- `localStorage` for client-side persistence

## Project Structure

```text
src/
  app/
    layout.js
    page.js
    globals.css
    manifest.js
  components/
    ContinueReadingCard.js
    HistoryPanel.js
    ProgressForm.js
    QuickJuzSelector.js
    SegmentedControl.js
    StepCard.js
    ThemeToggle.js
    ThemedSelect.js
  data/
    juz-rukuh-map.json
    juz-surah-ayah-range-map.json
public/
  icon-192.png
  icon-512.png
  icon-512-maskable.png
  apple-touch-icon.png
  icon.svg
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3) Build for production

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint checks

## Data and Persistence

- Reading progress is stored locally in the browser using `localStorage`.
- Current app key: `quran-tracker`
- Theme preference key: `quran-tracker-theme`

## PWA Install Notes

This app includes a web manifest and app icons for install support on desktop and mobile.

If icon updates do not appear immediately after changes:

1. Hard refresh the browser (`Ctrl+Shift+R`)
2. Uninstall and reinstall the app shortcut/PWA
3. Clear browser app icon cache if needed

## License

This project is currently private/internal unless a license file is added.
