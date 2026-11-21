const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function crop() {
  const inputPath = 'C:/Users/Ashish/.gemini/antigravity/brain/f6da0ce6-f20b-4049-8987-f324733eb28c/.user_uploaded/media_1795254470954_ae2a40d2.jpg';
  const outPathPublic = path.join(__dirname, '..', 'public', 'qr_code.png');
  const outPathDist = path.join(__dirname, '..', 'dist', 'qr_code.png');

  // Exact QR code bounding box: x=111..441, y=124..455.
  // We'll extract with a 15px clean white margin around the QR code matrix.
  const left = 96;
  const top = 109;
  const size = 360;

  console.log('Extracting square QR code from:', { left, top, size });

  const cropped = await sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    // Resize to high-resolution 600x600 for sharp display on mobile & desktop
    .resize(600, 600, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync(outPathPublic, cropped);
  console.log('Written to:', outPathPublic);

  if (fs.existsSync(path.dirname(outPathDist))) {
    fs.writeFileSync(outPathDist, cropped);
    console.log('Written to:', outPathDist);
  }

  // Also verify backend uploads path if exists
  const backendQr = path.join(__dirname, '..', 'backend', 'uploads', 'qr_code.png');
  if (fs.existsSync(path.dirname(backendQr))) {
    fs.writeFileSync(backendQr, cropped);
  }
}

crop().catch(err => {
  console.error(err);
  process.exit(1);
});
