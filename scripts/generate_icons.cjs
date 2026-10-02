const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const createSvg = (size, fontSize, yOffset = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#003893"/>
  <text 
    x="${size / 2}" 
    y="${size / 2 + yOffset}" 
    fill="#ffffff" 
    font-family="Arial, Helvetica, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    letter-spacing="-0.5" 
    text-anchor="middle"
    dominant-baseline="central"
  >e-Nirnaya</text>
</svg>
`;

async function generateAll() {
  console.log('Generating all app icons with Nepal flag blue #003893 and white e-Nirnaya text...');

  // 1. icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSvg(512, 80));

  // 2. pwa-512x512.png
  await sharp(Buffer.from(createSvg(512, 80)))
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. pwa-maskable-512x512.png (slightly smaller text for safe zone)
  await sharp(Buffer.from(createSvg(512, 68)))
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 4. pwa-192x192.png
  await sharp(Buffer.from(createSvg(192, 30)))
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(createSvg(180, 28)))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 6. favicon.ico (as 48x48 PNG format supported as favicon)
  await sharp(Buffer.from(createSvg(48, 8)))
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  console.log('All icons generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
