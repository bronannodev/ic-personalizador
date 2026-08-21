import fs from 'fs';
import zlib from 'zlib';

function readPNG(path) {
  const buf = fs.readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');
  let off = 8;
  let width, height, bitDepth, colorType;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      const interlace = data.readUInt8(12);
      console.log('IHDR bitDepth', bitDepth, 'colorType', colorType, 'interlace', interlace);
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const bpp = channels * (bitDepth / 8);
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const ft = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[pos++];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v;
      if (ft === 0) v = rawByte;
      else if (ft === 1) v = rawByte + a;
      else if (ft === 2) v = rawByte + b;
      else if (ft === 3) v = rawByte + ((a + b) >> 1);
      else if (ft === 4) v = rawByte + paeth(a, b, c);
      out[y * stride + x] = v & 0xff;
    }
  }
  return { width, height, channels, bpp, stride, out };
}

const path = process.argv[2];
const img = readPNG(path);
const { width, height, channels, bpp, stride, out } = img;
console.log('size', width, height, 'channels', channels);

if (channels < 4) {
  console.log('NO ALPHA CHANNEL - image is fully opaque');
} else {
  const cx = Math.floor(width / 2);
  const alphaAt = (x, y) => out[y * stride + x * bpp + 3];
  console.log('sample alpha: corner(0,0)=', alphaAt(0, 0),
    'center=', alphaAt(cx, Math.floor(height / 2)),
    'q(0.5,0.25)=', alphaAt(cx, Math.floor(height * 0.25)),
    'q(0.5,0.75)=', alphaAt(cx, Math.floor(height * 0.75)));
  // full bounding box of transparent pixels (sampled every 3px)
  let bx0 = width, by0 = height, bx1 = 0, by1 = 0, tcount = 0;
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      if (alphaAt(x, y) < 20) {
        tcount++;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
        if (y < by0) by0 = y; if (y > by1) by1 = y;
      }
    }
  }
  console.log('transparent bbox: x', (bx0 / width * 100).toFixed(1), '-', (bx1 / width * 100).toFixed(1),
    'y', (by0 / height * 100).toFixed(1), '-', (by1 / height * 100).toFixed(1),
    'count', tcount);
  let top = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    if (alphaAt(cx, y) < 20) { top = y; break; }
  }
  for (let y = height - 1; y >= 0; y--) {
    if (alphaAt(cx, y) < 20) { bottom = y; break; }
  }
  const cy = Math.floor((top + bottom) / 2);
  let left = -1, right = -1;
  for (let x = 0; x < width; x++) {
    if (alphaAt(x, cy) < 20) { left = x; break; }
  }
  for (let x = width - 1; x >= 0; x--) {
    if (alphaAt(x, cy) < 20) { right = x; break; }
  }
  console.log('transparent hole (center scan):');
  console.log('  top%', (top / height * 100).toFixed(2), 'bottom%', (bottom / height * 100).toFixed(2));
  console.log('  left%', (left / width * 100).toFixed(2), 'right%', (right / width * 100).toFixed(2));
  console.log('  holeCenterY%', (cy / height * 100).toFixed(2), 'holeCenterX%', ((left + right) / 2 / width * 100).toFixed(2));
  console.log('  holeW%', ((right - left) / width * 100).toFixed(2), 'holeH%', ((bottom - top) / height * 100).toFixed(2));
}
