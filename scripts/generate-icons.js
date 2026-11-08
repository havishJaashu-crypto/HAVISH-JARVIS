import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height) {
  // Simple pure JS PNG generator creating an arc reactor graphic
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Background: Deep dark #030712
      let r = 3, g = 7, b = 18, a = 255;

      // Outer border circle
      if (Math.abs(dist - maxR * 0.9) < 2) {
        r = 6; g = 182; b = 212; a = 180;
      }
      // Outer ring
      else if (Math.abs(dist - maxR * 0.75) < 4 && Math.sin(angle * 12) > 0) {
        r = 56; g = 189; b = 248; a = 220;
      }
      // Arc segments
      else if (Math.abs(dist - maxR * 0.6) < 6 && (Math.floor((angle + Math.PI) / (Math.PI / 4)) % 2 === 0)) {
        r = 0; g = 242; b = 254; a = 240;
      }
      // Inner coil ring
      else if (Math.abs(dist - maxR * 0.45) < 3) {
        r = 14; g = 116; b = 144; a = 200;
      }
      // Core glow
      else if (dist < maxR * 0.35) {
        const factor = 1 - (dist / (maxR * 0.35));
        if (dist < maxR * 0.12) {
          // White center
          r = 255; g = 255; b = 255; a = 255;
        } else {
          // Intense cyan glow
          r = Math.min(255, Math.floor(0 + factor * 255));
          g = Math.min(255, Math.floor(200 + factor * 55));
          b = 255;
          a = 255;
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Build raw uncompressed PNG with filter type 0
  const lineSize = width * 4 + 1;
  const rawData = Buffer.alloc(lineSize * height);
  for (let y = 0; y < height; y++) {
    rawData[y * lineSize] = 0; // Filter None
    buffer.copy(rawData, y * lineSize + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA and Apple Touch PNG icons...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPng(64, 64));
console.log('Successfully generated all compliant PNG icons in /public.');
