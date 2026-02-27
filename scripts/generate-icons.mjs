/**
 * Generate PWA icons from the favicon SVG using sharp.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'static/favicon.svg');
const outDir = resolve(root, 'static/icons');

mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
    await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
}
