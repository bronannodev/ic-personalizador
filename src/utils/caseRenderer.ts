import { DeviceConfig, CaseStyle, ImageTransform } from '../types/customizer';

/**
 * Renderizador vectorial canónico de la funda.
 *
 * Reproduce EXACTAMENTE la matemática del editor 2D (PhoneCase2D) para que la
 * vista previa del Paso 3 y la imagen exportada/enviada por WhatsApp coincidan
 * al 100% con lo que el usuario ve mientras diseña.
 *
 * Reglas clave heredadas del editor:
 *  - La imagen base se ajusta con "contain" dentro del cuerpo de la funda
 *    (caseW x caseH), centrada.
 *  - El desplazamiento es porcentual respecto al cuerpo completo de la funda:
 *      offsetX = (transform.x / 100) * caseW
 *      offsetY = (transform.y / 100) * caseH
 *    (El bug anterior usaba caseW/2, moviendo la imagen a la mitad de distancia).
 *  - scale, rotation, flipH y flipV se aplican alrededor del centro.
 *  - El recorte de cámara usa los mismos porcentajes que CameraCutoutHole.
 */

export interface RenderCaseOptions {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  image: HTMLImageElement | null;
  transform: ImageTransform;
  /** Relleno de fondo del lienzo (p. ej. para exportar). Por defecto transparente. */
  background?: string;
  /** Dibuja el recorte de cámara. Por defecto true. */
  showCamera?: boolean;
  /** Margen alrededor de la funda como fracción del lado menor del lienzo. */
  marginRatio?: number;
  /**
   * Mockup fotográfico ya analizado. Si tiene una ventana transparente válida,
   * el render usa la FOTO REAL de la funda con la imagen incrustada. Si es null
   * o no tiene ventana, cae automáticamente al render vectorial.
   */
  mockup?: MockupData | null;
}

/* ========================================================================== */
/* Composición fotográfica: usa los PNG reales de MockupsV2.                   */
/* ========================================================================== */

export interface MockupData {
  src: string;
  image: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  /** true si el PNG tiene una ventana transparente utilizable para el diseño. */
  hasWindow: boolean;
  /** Caja de la ventana transparente en píxeles del PNG. */
  window: { x: number; y: number; w: number; h: number } | null;
  /** Máscara (blanco = ventana del diseño, transparente = marco/cámara). */
  mask: HTMLCanvasElement | null;
}

const mockupCache = new Map<string, MockupData>();
const mockupPromises = new Map<string, Promise<MockupData>>();

/** Devuelve el mockup ya analizado (o null si aún no se cargó). Síncrono. */
export function getCachedMockup(src: string | undefined | null): MockupData | null {
  if (!src) return null;
  return mockupCache.get(src) ?? null;
}

/** Carga y analiza un mockup (idempotente y cacheado). */
export function preloadMockup(src: string): Promise<MockupData> {
  const cached = mockupCache.get(src);
  if (cached) return Promise.resolve(cached);
  const pending = mockupPromises.get(src);
  if (pending) return pending;

  const promise = new Promise<MockupData>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const data = analyzeMockup(src, img);
      mockupCache.set(src, data);
      mockupPromises.delete(src);
      resolve(data);
    };
    img.onerror = () => {
      const data: MockupData = {
        src,
        image: img,
        naturalWidth: 0,
        naturalHeight: 0,
        hasWindow: false,
        window: null,
        mask: null,
      };
      mockupCache.set(src, data);
      mockupPromises.delete(src);
      resolve(data);
    };
    img.src = src;
  });
  mockupPromises.set(src, promise);
  return promise;
}

/**
 * Analiza el canal alfa del PNG para detectar la ventana transparente (donde
 * va el diseño) y construir una máscara de recorte. Adaptativo por imagen, así
 * que no depende de que todos los mockups tengan la ventana en el mismo lugar.
 */
function analyzeMockup(src: string, img: HTMLImageElement): MockupData {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  const fail: MockupData = {
    src,
    image: img,
    naturalWidth: natW,
    naturalHeight: natH,
    hasWindow: false,
    window: null,
    mask: null,
  };
  if (!natW || !natH) return fail;

  const canvas = document.createElement('canvas');
  canvas.width = natW;
  canvas.height = natH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return fail;
  ctx.drawImage(img, 0, 0);

  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, natW, natH);
  } catch {
    return fail;
  }
  const px = data.data;
  const threshold = 40;

  const mask = document.createElement('canvas');
  mask.width = natW;
  mask.height = natH;
  const mctx = mask.getContext('2d');
  if (!mctx) return fail;
  const maskData = mctx.createImageData(natW, natH);
  const md = maskData.data;

  let minX = natW;
  let minY = natH;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  const totalPixels = natW * natH;

  for (let i = 0; i < totalPixels; i++) {
    const alpha = px[i * 4 + 3];
    if (alpha < threshold) {
      count++;
      const x = i % natW;
      const y = (i / natW) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      md[i * 4] = 255;
      md[i * 4 + 1] = 255;
      md[i * 4 + 2] = 255;
      md[i * 4 + 3] = 255;
    } else {
      md[i * 4 + 3] = 0;
    }
  }
  mctx.putImageData(maskData, 0, 0);

  const frac = count / totalPixels;
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  // Ventana válida: suficiente área transparente, con forma de recuadro central
  // (no toda la imagen), y no degenerada.
  const spansAlmostEverything = boxW > natW * 0.94 && boxH > natH * 0.94;
  const hasWindow = frac >= 0.06 && frac < 0.85 && boxW > 8 && boxH > 8 && !spansAlmostEverything;

  return {
    src,
    image: img,
    naturalWidth: natW,
    naturalHeight: natH,
    hasWindow,
    window: hasWindow ? { x: minX, y: minY, w: boxW, h: boxH } : null,
    mask: hasWindow ? mask : null,
  };
}

interface CaseRect {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/** Calcula el rectángulo del cuerpo de la funda centrado en el lienzo. */
export function computeCaseRect(
  W: number,
  H: number,
  device: DeviceConfig,
  marginRatio = 0.07
): CaseRect {
  const realWidth = device.dimensions.realWidthMm || device.dimensions.width * 25.4;
  const realHeight = device.dimensions.realHeightMm || device.dimensions.height * 25.4;
  const widthRatio = realWidth / realHeight;

  const margin = Math.min(W, H) * marginRatio;
  const availW = W - margin * 2;
  const availH = H - margin * 2;

  let caseH = availH;
  let caseW = caseH * widthRatio;
  if (caseW > availW) {
    caseW = availW;
    caseH = caseW / widthRatio;
  }

  const left = (W - caseW) / 2;
  const top = (H - caseH) / 2;

  // Reproduce el radio del editor (cornerRadius * 60 px a ~560px de alto de funda).
  const radius = caseW * device.dimensions.cornerRadius * 0.22;

  return { left, top, width: caseW, height: caseH, radius };
}

function drawImageInCase(
  ctx: CanvasRenderingContext2D,
  rect: CaseRect,
  image: HTMLImageElement,
  transform: ImageTransform
): void {
  const { left, top, width: caseW, height: caseH } = rect;

  // Base "contain" dentro del cuerpo de la funda.
  const imgAspect = image.naturalWidth / image.naturalHeight;
  const caseAspect = caseW / caseH;
  let baseW: number;
  let baseH: number;
  if (imgAspect > caseAspect) {
    baseW = caseW;
    baseH = caseW / imgAspect;
  } else {
    baseH = caseH;
    baseW = caseH * imgAspect;
  }

  // Desplazamiento porcentual respecto al cuerpo completo (igual que el editor).
  const offsetX = (transform.x / 100) * caseW;
  const offsetY = (transform.y / 100) * caseH;

  const centerX = left + caseW / 2 + offsetX;
  const centerY = top + caseH / 2 + offsetY;

  const drawW = baseW * transform.scale;
  const drawH = baseH * transform.scale;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawCameraCutout(
  ctx: CanvasRenderingContext2D,
  rect: CaseRect,
  device: DeviceConfig
): void {
  const camera = device.camera;
  const realWidth = device.dimensions.realWidthMm || 75;
  const realHeight = device.dimensions.realHeightMm || 150;

  // Porcentajes idénticos a CameraCutoutHole del editor.
  let leftPercent = 6.5;
  let topPercent = 4.5;
  let widthPercent = 40.0;
  let heightPercent = 25.0;
  let cutoutRadius: number;

  if (camera.moduleX && camera.moduleY && camera.moduleWidth && camera.moduleHeight) {
    leftPercent = (camera.moduleX / realWidth) * 100;
    topPercent = (camera.moduleY / realHeight) * 100;
    widthPercent = (camera.moduleWidth / realWidth) * 100;
    heightPercent = (camera.moduleHeight / realHeight) * 100;
  } else {
    const type = camera.type;
    if (type === 'triple-pro-large') {
      leftPercent = 6.5; topPercent = 4.5; widthPercent = 44; heightPercent = 27;
    } else if (type === 'diagonal-dual') {
      leftPercent = 7.5; topPercent = 4.8; widthPercent = 38; heightPercent = 22;
    } else if (type === 'vertical-pill-modern') {
      leftPercent = 8.5; topPercent = 4.8; widthPercent = 28; heightPercent = 24;
    }
  }

  const cx = rect.left + (leftPercent / 100) * rect.width;
  const cy = rect.top + (topPercent / 100) * rect.height;
  const cw = (widthPercent / 100) * rect.width;
  const ch = (heightPercent / 100) * rect.height;

  if (camera.moduleRadius && camera.moduleWidth) {
    cutoutRadius = (camera.moduleRadius / camera.moduleWidth) * cw;
  } else {
    cutoutRadius = Math.min(cw, ch) * 0.25;
  }

  ctx.save();
  roundRectPath(ctx, cx, cy, cw, ch, cutoutRadius);
  ctx.fillStyle = '#7d828f';
  ctx.fill();

  // Sombra interior sutil.
  const grad = ctx.createLinearGradient(cx, cy, cx, cy + ch);
  grad.addColorStop(0, 'rgba(0,0,0,0.12)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = Math.max(1, rect.width * 0.004);
  ctx.strokeStyle = '#616673';
  ctx.stroke();
  ctx.restore();
}

/**
 * Dibuja la funda completa en el lienzo indicado.
 * El lienzo debe tener ya sus dimensiones (canvas.width / canvas.height) fijadas.
 */
/** Rectángulo destino (contain) del mockup dentro del lienzo. */
export function computeMockupRect(
  W: number,
  H: number,
  mockup: MockupData,
  marginRatio = 0.02
): { dx: number; dy: number; dw: number; dh: number } {
  const margin = Math.min(W, H) * marginRatio;
  const availW = W - margin * 2;
  const availH = H - margin * 2;
  const s = Math.min(availW / mockup.naturalWidth, availH / mockup.naturalHeight);
  const dw = mockup.naturalWidth * s;
  const dh = mockup.naturalHeight * s;
  return { dx: (W - dw) / 2, dy: (H - dh) / 2, dw, dh };
}

/** Ventana del diseño (en coordenadas del lienzo) para un mockup ya colocado. */
export function computeWindowRectOnCanvas(
  W: number,
  H: number,
  mockup: MockupData,
  marginRatio = 0.02
): { x: number; y: number; w: number; h: number } | null {
  if (!mockup.hasWindow || !mockup.window) return null;
  const { dx, dy, dw, dh } = computeMockupRect(W, H, mockup, marginRatio);
  const win = mockup.window;
  return {
    x: dx + (win.x / mockup.naturalWidth) * dw,
    y: dy + (win.y / mockup.naturalHeight) * dh,
    w: (win.w / mockup.naturalWidth) * dw,
    h: (win.h / mockup.naturalHeight) * dh,
  };
}

/**
 * Composición fotográfica: dibuja la imagen del cliente detrás del PNG real de
 * la funda, recortada exactamente a la ventana transparente del mockup. El
 * resultado es la foto real del producto con el diseño incrustado.
 */
function renderPhotographic(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  mockup: MockupData,
  image: HTMLImageElement | null,
  transform: ImageTransform,
  background?: string,
  marginRatio = 0.02
): void {
  ctx.clearRect(0, 0, W, H);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
  }

  const { dx, dy, dw, dh } = computeMockupRect(W, H, mockup, marginRatio);
  const winRect = computeWindowRectOnCanvas(W, H, mockup, marginRatio)!;

  if (image && mockup.mask) {
    // Lienzo auxiliar para el diseño (permite recortarlo con la máscara).
    const design = document.createElement('canvas');
    design.width = W;
    design.height = H;
    const dctx = design.getContext('2d');
    if (dctx) {
      const imgAspect = image.naturalWidth / image.naturalHeight;
      const winAspect = winRect.w / winRect.h;
      let baseW: number;
      let baseH: number;
      if (imgAspect > winAspect) {
        baseW = winRect.w;
        baseH = winRect.w / imgAspect;
      } else {
        baseH = winRect.h;
        baseW = winRect.h * imgAspect;
      }

      // Desplazamiento porcentual RELATIVO A LA VENTANA (igual que el editor).
      const offsetX = (transform.x / 100) * winRect.w;
      const offsetY = (transform.y / 100) * winRect.h;
      const centerX = winRect.x + winRect.w / 2 + offsetX;
      const centerY = winRect.y + winRect.h / 2 + offsetY;
      const drawW = baseW * transform.scale;
      const drawH = baseH * transform.scale;

      dctx.save();
      dctx.translate(centerX, centerY);
      dctx.rotate((transform.rotation * Math.PI) / 180);
      dctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
      dctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
      dctx.restore();

      // Recorta el diseño a la forma exacta de la ventana transparente.
      dctx.globalCompositeOperation = 'destination-in';
      dctx.drawImage(mockup.mask, dx, dy, dw, dh);
      dctx.globalCompositeOperation = 'source-over';

      ctx.drawImage(design, 0, 0);
    }
  }

  // La foto real de la funda va ENCIMA: su marco/cámara cubren los bordes.
  ctx.drawImage(mockup.image, dx, dy, dw, dh);
}

export function renderCaseToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCaseOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const { device, caseStyle, image, transform } = options;
  const showCamera = options.showCamera !== false;

  // Modo fotográfico: si hay un mockup con ventana transparente válida.
  if (options.mockup && options.mockup.hasWindow) {
    renderPhotographic(
      ctx,
      W,
      H,
      options.mockup,
      image,
      transform,
      options.background,
      options.marginRatio ?? 0.02
    );
    return;
  }

  ctx.clearRect(0, 0, W, H);

  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, W, H);
  }

  const rect = computeCaseRect(W, H, device, options.marginRatio);

  // Sombra proyectada de la funda.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = rect.width * 0.14;
  ctx.shadowOffsetY = rect.height * 0.03;
  roundRectPath(ctx, rect.left, rect.top, rect.width, rect.height, rect.radius);
  const isTransparent = caseStyle.transmission > 0.5;
  ctx.fillStyle = isTransparent ? '#e9eaee' : caseStyle.color || '#1b1d24';
  ctx.fill();
  ctx.restore();

  // Cuerpo de la funda + imagen recortada dentro.
  ctx.save();
  roundRectPath(ctx, rect.left, rect.top, rect.width, rect.height, rect.radius);
  ctx.clip();

  ctx.fillStyle = isTransparent ? '#f2f3f5' : caseStyle.color || '#1b1d24';
  ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

  if (image) {
    drawImageInCase(ctx, rect, image, transform);
  }
  ctx.restore();

  if (showCamera) {
    drawCameraCutout(ctx, rect, device);
  }

  // Borde exterior reflectante.
  ctx.save();
  roundRectPath(ctx, rect.left, rect.top, rect.width, rect.height, rect.radius);
  ctx.lineWidth = Math.max(1.5, rect.width * 0.006);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.stroke();
  ctx.restore();
}

/**
 * Genera un data URL de la funda terminada en alta resolución.
 * Usa el mismo renderizador canónico, garantizando coincidencia con el editor.
 */
export function exportCaseDataUrl(options: RenderCaseOptions, height = 1600): string {
  const canvas = document.createElement('canvas');

  if (options.mockup && options.mockup.hasWindow) {
    // Usa la relación de aspecto real de la foto del mockup.
    const ratio = options.mockup.naturalWidth / options.mockup.naturalHeight;
    canvas.height = height;
    canvas.width = Math.round(height * ratio) + 2;
    renderCaseToCanvas(canvas, {
      ...options,
      background: options.background ?? '#ffffff',
      marginRatio: options.marginRatio ?? 0.02,
    });
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  const rectRatioW =
    options.device.dimensions.realWidthMm || options.device.dimensions.width * 25.4;
  const rectRatioH =
    options.device.dimensions.realHeightMm || options.device.dimensions.height * 25.4;
  const widthRatio = rectRatioW / rectRatioH;

  canvas.height = height;
  canvas.width = Math.round(height * widthRatio * 1.18) + 2; // margen lateral
  renderCaseToCanvas(canvas, {
    ...options,
    background: options.background ?? '#f1f2f4',
    marginRatio: options.marginRatio ?? 0.07,
  });
  return canvas.toDataURL('image/jpeg', 0.92);
}
