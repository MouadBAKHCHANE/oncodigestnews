import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '..', 'public', 'onco-bg-icon.png');
const outputPath = path.join(__dirname, '..', 'public', 'onco-bg-icon-transparent.png');

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = Buffer.from(data);
let cleared = 0;
let softened = 0;

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;

  // Cream / off-white pixels → transparent
  if (brightness > 230 && sat < 0.12) {
    pixels[i + 3] = 0;
    cleared++;
  } else if (brightness > 215 && sat < 0.18) {
    // Soft edge transition
    const t = (brightness - 215) / 15; // 0 → 1
    pixels[i + 3] = Math.round(pixels[i + 3] * (1 - t * 0.95));
    softened++;
  }
}

await sharp(pixels, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`✓ Wrote ${outputPath}`);
console.log(`  cleared: ${cleared} pixels, softened: ${softened} pixels`);
console.log(`  size: ${info.width}×${info.height}`);
