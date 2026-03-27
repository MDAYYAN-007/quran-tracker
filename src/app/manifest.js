export default function manifest() {
  return {
    name: "Quran Progress Tracker",
    short_name: "Quran Tracker",
    description:
      "Simple one-page tracker for Quran reading progress by Juz or Surah/Aayah.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F1412",
    theme_color: "#1F7A63",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
