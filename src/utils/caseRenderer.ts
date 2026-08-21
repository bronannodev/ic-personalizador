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
  const rectRatioW =
    options.device.dimensions.realWidthMm || options.device.dimensions.width * 25.4;
  const rectRatioH =
    options.device.dimensions.realHeightMm || options.device.dimensions.height * 25.4;
  const widthRatio = rectRatioW / rectRatioH;

  const canvas = document.createElement('canvas');
  canvas.height = height;
  canvas.width = Math.round(height * widthRatio * 1.18) + 2; // margen lateral
  renderCaseToCanvas(canvas, {
    ...options,
    background: options.background ?? '#f1f2f4',
    marginRatio: options.marginRatio ?? 0.07,
  });
  return canvas.toDataURL('image/jpeg', 0.92);
}
