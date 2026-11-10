// Turns a video into the WebP frame sequence the hero scroll-animation plays.
//
//   npm run frames -- assets/video/hero.mp4 8.1         (desktop, keep the first 8.1 s)
//   npm run frames -- phone.mp4 8 mobile                (mobile folder, not used by the site yet)
//
// args: <video> [end-seconds] [desktop|mobile]
// Needs ffmpeg on PATH. Audio is dropped; frames are NOT upscaled.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [input, endArg, deviceArg] = process.argv.slice(2);
if (!input) {
  console.error('Usage: npm run frames -- <video> [end-seconds] [desktop|mobile]');
  process.exit(1);
}
const device = deviceArg === 'mobile' ? 'mobile' : 'desktop';
const cfg = { desktop: { fps: 12, width: 1280, quality: 70 }, mobile: { fps: 10, width: 720, quality: 68 } }[device];

const src = path.resolve(input);
if (!fs.existsSync(src)) {
  console.error(`Video not found: ${src}`);
  process.exit(1);
}

const outDir = path.join(root, 'client', 'public', 'frames', device);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const args = ['-loglevel', 'error', '-y', '-i', src];
if (endArg && Number(endArg) > 0) args.push('-t', String(Number(endArg)));
args.push('-an', '-vf', `fps=${cfg.fps},scale='min(${cfg.width},iw)':-2`, '-c:v', 'libwebp', '-quality', String(cfg.quality), path.join(outDir, 'f_%04d.webp'));

const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stderr || 'ffmpeg failed');
  process.exit(1);
}

const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.webp'));
const mb = files.reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0) / 1048576;

// keep the frame count in the client config in sync
const cfgPath = path.join(root, 'client', 'src', 'config', 'frames.json');
const json = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
json[device] = { ...(json[device] || { beats: [0, 0.42, 0.79, 1] }), dir: `/frames/${device}/`, count: files.length };
fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
fs.writeFileSync(cfgPath, JSON.stringify(json, null, 2) + '\n');

console.log(`${device}: ${files.length} frames, ${mb.toFixed(1)} MB → client/public/frames/${device}/`);
console.log('Updated client/src/config/frames.json (adjust "beats" if the story timing changes).');
