/**
 * Herramienta de control de calidad para los mockups de fundas.
 * -----------------------------------------------------------------------------
 * Analiza el canal alfa de cada PNG de /public/MockupsV2 y reporta si tiene una
 * "ventana de diseño" transparente válida (el hueco donde se incrusta la imagen
 * del cliente). Es la MISMA lógica de detección que usa src/utils/caseRenderer.ts
 * (funcion analyzeMockup), por lo que este reporte predice exactamente qué
 * modelos usarán el modo FOTOGRÁFICO y cuáles caerán al modo VECTORIAL.
 *
 * Uso:
 *   node scripts/check-mockups.mjs                 # analiza toda la carpeta
 *   node scripts/check-mockups.mjs ruta/al.png     # analiza un archivo puntual
 *
 * Requisitos de un PNG válido (para que use modo foto):
 *   - Formato PNG-24 con transparencia real (RGBA de 8 bits, NO indexado/paleta).
 *   - Un hueco transparente (alfa < ~40) en la zona del diseño.
 *   - Ese hueco debe ocupar entre ~6% y ~85% de la imagen y NO abarcar casi todo.
 *   - El resto (marco, cámara, bordes) debe permanecer OPACO.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ALPHA_THRESHOLD = 40; // igual que caseRenderer.ts
const MIN_FRAC = 0.06;
const MAX_FRAC = 0.85;

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function analyze(file) {
  const buf = fs.readFileSync(file);
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      interlace = data.readUInt8(12);
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }

  // colorType 6 = RGBA. Cualquier otra cosa no tiene alfa utilizable aquí.
  if (colorType !== 6 || bitDepth !== 8 || interlace !== 0) {
    return {
      width,
      height,
      status: 'NO',
      reason:
        colorType === 3
          ? 'PNG indexado/paleta (sin alfa RGBA) — reexportar como PNG-24'
          : `formato no soportado (colorType=${colorType}, bitDepth=${bitDepth}, interlace=${interlace})`,
    };
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const rb = raw[pos++];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v;
      switch (filter) {
        case 1: v = rb + a; break;
        case 2: v = rb + b; break;
        case 3: v = rb + ((a + b) >> 1); break;
        case 4: v = rb + paeth(a, b, c); break;
        default: v = rb;
      }
      out[y * stride + x] = v & 0xff;
    }
  }

  const alphaAt = (x, y) => out[y * stride + x * bpp + 3];
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  let sampled = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      sampled++;
      if (alphaAt(x, y) < ALPHA_THRESHOLD) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const frac = count / sampled;
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const spans = boxW > width * 0.94 && boxH > height * 0.94;
  const ok = frac >= MIN_FRAC && frac < MAX_FRAC && boxW > 8 && boxH > 8 && !spans;

  let reason = 'ventana válida';
  if (!ok) {
    if (frac < MIN_FRAC) reason = `sin hueco transparente (solo ${(frac * 100).toFixed(1)}%) — funda opaca`;
    else if (frac >= MAX_FRAC) reason = 'demasiada transparencia (casi toda la imagen)';
    else if (spans) reason = 'transparencia dispersa por toda la imagen (fondo, no ventana)';
    else reason = 'hueco degenerado';
  }

  return {
    width,
    height,
    status: ok ? 'OK' : 'NO',
    frac: (frac * 100).toFixed(1) + '%',
    windowX: ok ? `${((minX / width) * 100).toFixed(0)}-${((maxX / width) * 100).toFixed(0)}%` : '-',
    windowY: ok ? `${((minY / height) * 100).toFixed(0)}-${((maxY / height) * 100).toFixed(0)}%` : '-',
    reason,
  };
}

function listPngs(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listPngs(full));
    else if (entry.name.toLowerCase().endsWith('.png')) result.push(full);
  }
  return result.sort();
}

const arg = process.argv[2];
const root = 'public/MockupsV2';
const files = arg ? [arg] : listPngs(root);

let ok = 0;
let bad = 0;
console.log('\n  ESTADO   MODELO                                   VENTANA        MOTIVO');
console.log('  ' + '-'.repeat(92));
for (const f of files) {
  let r;
  try {
    r = analyze(f);
  } catch (e) {
    r = { status: 'ERR', reason: e.message };
  }
  const rel = f.replace(root + '/', '').replace(/\.png$/i, '');
  const badge = r.status === 'OK' ? ' \x1b[32mFOTO\x1b[0m ' : r.status === 'NO' ? '\x1b[33mVECTOR\x1b[0m' : '\x1b[31m ERR \x1b[0m';
  const win = r.status === 'OK' ? `${r.windowX} ${r.windowY}` : '';
  console.log(`  ${badge}   ${rel.padEnd(40)} ${win.padEnd(14)} ${r.reason || ''}`);
  if (r.status === 'OK') ok++;
  else bad++;
}
console.log('  ' + '-'.repeat(92));
console.log(`  Total: ${files.length}   Foto (ventana OK): ${ok}   Vector (a corregir): ${bad}\n`);
