const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating PNG favicons from:', logoPath);

  // Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  const pngBuffers = {};
  for (const { name, size } of sizes) {
    const buf = await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 11, g: 13, b: 19, alpha: 1 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, name), buf);
    pngBuffers[size] = buf;
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico containing 16x16, 32x32, 48x48
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  const imageBuffers = [];

  for (const s of icoSizes) {
    const imgBuf = pngBuffers[s];
    imageBuffers.push(imgBuf);

    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // Width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(imgBuf.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // Offset in file
    entries.push(entry);

    currentOffset += imgBuf.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (multi-resolution 16, 32, 48)');

  // Generate favicon.svg (crisp vector branding with charcoal, silver, and red lightning bolt)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="charcoalGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#181a20" />
      <stop offset="100%" stop-color="#0b0d13" />
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#c0c0c0" />
      <stop offset="100%" stop-color="#808080" />
    </linearGradient>
    <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b30" />
      <stop offset="100%" stop-color="#d32f2f" />
    </linearGradient>
  </defs>
  
  <!-- Outer Charcoal Circle -->
  <circle cx="50" cy="50" r="48" fill="url(#charcoalGrad)" stroke="url(#silverGrad)" stroke-width="2.5" />
  
  <!-- Inner Ring -->
  <circle cx="50" cy="50" r="41" fill="none" stroke="#27272a" stroke-width="1" stroke-dasharray="2 3" />
  
  <!-- Stylized Metallic S -->
  <path d="M 62 33 C 58 26 42 26 38 33 C 35 38 38 43 45 46 L 55 50 C 63 53 66 59 62 66 C 58 74 40 74 36 67" 
        fill="none" stroke="url(#silverGrad)" stroke-width="6" stroke-linecap="round" />
  
  <!-- Signature Red Lightning Bolt Accent -->
  <polygon points="56,22 44,48 53,48 42,78 60,44 51,44" fill="url(#lightningGrad)" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  console.log('Generated favicon.svg');

  // Generate site.webmanifest
  const manifest = {
    name: 'SKYRA CREATIONS',
    short_name: 'SKYRA',
    description: 'Skyra Creations Runway Show & Model Registration Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d13',
    theme_color: '#0b0d13',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Generated site.webmanifest');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
