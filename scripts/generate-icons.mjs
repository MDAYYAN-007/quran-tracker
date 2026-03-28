import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icon.svg");
const svg = readFileSync(svgPath);

const BG = { r: 31, g: 122, b: 99, alpha: 1 };

async function renderSquare(size, outName) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(join(root, "public", outName));
}

async function renderMaskable512() {
  const canvas = 512;
  const safe = 0.8;
  const inner = Math.round(canvas * safe);
  const offset = Math.round((canvas - inner) / 2);

  const scaled = await sharp(svg, { density: 300 })
    .resize(inner, inner)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: scaled, left: offset, top: offset }])
    .png()
    .toFile(join(root, "public", "icon-512-maskable.png"));
}

await renderSquare(180, "apple-touch-icon.png");
await renderSquare(192, "icon-192.png");
await renderSquare(512, "icon-512.png");
await renderMaskable512();

console.log("Wrote public/apple-touch-icon.png, icon-192.png, icon-512.png, icon-512-maskable.png");
