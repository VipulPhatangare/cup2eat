// Converts the original photos in assets/photos to optimised WebP files
// Usage: npm run images   (needs ffmpeg on PATH)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'assets', 'photos');
const OUT = path.join(ROOT, 'server', 'uploads', 'site');
const PUBLIC = path.join(ROOT, 'client', 'public');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

// [source file, output name, max width]
const SITE = [
  ['igexport-DeI9QKwSEVw.jpg', 'cup-bite.webp', 1100],
  ['igexport-DdkvoiaEkdU-2.heic', 'cup-latte.webp', 900],
  ['igexport-DdkvoiaEkdU.heic', 'cup-hand.webp', 900],
  ['igexport-DbaZipGoODO.heic', 'event-birthday.webp', 900],
  ['igexport-Deep44nSD-o.jpg', 'pizza-cups.webp', 1000],
  ['igexport-DevNsNoy6Jf.jpg', 'cafe-cart.webp', 900],
  ['igexport-Dfc1gZTSqgi.jpg', 'diwali.webp', 900],
];

function ffmpeg(args) {
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'ffmpeg failed');
}

for (const [src, name, width] of SITE) {
  const input = path.join(SRC, src);
  if (!fs.existsSync(input)) {
    console.warn(`  skip (missing): ${src}`);
    continue;
  }
  // never upscale: scale only when wider than max
  const vf = `scale='min(${width},iw)':-2`;
  ffmpeg(['-i', input, '-vf', vf, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', path.join(OUT, name)]);
  const kb = Math.round(fs.statSync(path.join(OUT, name)).size / 1024);
  console.log(`  ok  ${name}  (${kb} KB)`);
}

// favicon / logo PNG for the browser tab and social share
const logo = path.join(SRC, '487214331_639080325575362_5737635668254151880_n.jpg');
if (fs.existsSync(logo)) {
  ffmpeg(['-i', logo, '-frames:v', '1', path.join(PUBLIC, 'logo.png')]);
  console.log('  ok  client/public/logo.png');
}
