import { DeviceConfig, ImageMetadata } from '../types/customizer';

/**
 * Calculates print DPI and quality indicator based on uploaded image dimensions and phone size
 */
export function calculatePrintQuality(
  img: HTMLImageElement,
  file: File,
  device: DeviceConfig,
  scale: number = 1.0
): ImageMetadata {
  const widthPx = img.naturalWidth || 1200;
  const heightPx = img.naturalHeight || 1800;

  // Approximate print width/height in inches (assuming ~70-80mm width => ~2.8-3.1 inches)
  const printWidthInches = (device.dimensions.realWidthMm || 75) / 25.4;
  const effectivePrintWidth = printWidthInches / Math.max(0.2, scale);

  const dpi = Math.round(widthPx / effectivePrintWidth);

  let quality: 'Excelente' | 'Buena' | 'Aceptable' | 'Baja' = 'Buena';
  if (dpi >= 300) {
    quality = 'Excelente';
  } else if (dpi >= 220) {
    quality = 'Buena';
  } else if (dpi >= 150) {
    quality = 'Aceptable';
  } else {
    quality = 'Baja';
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    width: widthPx,
    height: heightPx,
    dpi,
    quality,
  };
}
