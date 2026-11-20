import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Construct a minimal valid RGBA PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // CRC calculation
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gradient / stylized purple gadget background
      const dist = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
      const factor = Math.max(0, 1 - dist / (width * 0.6));
      rawData[pxOffset] = Math.min(255, Math.floor(r * factor + 10)); // R
      rawData[pxOffset + 1] = Math.min(255, Math.floor(g * factor + 10)); // G
      rawData[pxOffset + 2] = Math.min(255, Math.floor(b * factor + 20)); // B
      rawData[pxOffset + 3] = 255; // Alpha
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 124, 58, 237));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 124, 58, 237));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 168, 85, 247));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 124, 58, 237));
console.log('PWA PNG assets successfully generated.');
