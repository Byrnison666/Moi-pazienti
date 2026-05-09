import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, 'icon-src');
const OUT = resolve(__dirname, '..', 'assets');

async function rasterize(svgFile, outFile, size, opts = {}) {
  const svg = readFileSync(resolve(SRC, svgFile));
  let img = sharp(svg, { density: 384 });
  if (Array.isArray(size)) {
    img = img.resize({ width: size[0], height: size[1], fit: opts.fit ?? 'contain', background: opts.background ?? { r: 0, g: 0, b: 0, alpha: 0 } });
  } else {
    img = img.resize({ width: size, height: size, fit: opts.fit ?? 'contain', background: opts.background ?? { r: 0, g: 0, b: 0, alpha: 0 } });
  }
  await img.png().toFile(resolve(OUT, outFile));
  console.log('  →', outFile);
}

console.log('Generating icons...');
await rasterize('icon.svg', 'icon.png', 1024);
await rasterize('adaptive-foreground.svg', 'adaptive-icon.png', 1024);
await rasterize('splash.svg', 'splash.png', [1242, 2436], { fit: 'contain', background: { r: 245, g: 251, b: 253, alpha: 1 } });
await rasterize('icon.svg', 'favicon.png', 48);
console.log('Done.');
