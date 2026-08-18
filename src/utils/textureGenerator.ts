import * as THREE from 'three';
import { CaseStyle, DeviceConfig, ImageTransform } from '../types/customizer';

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private width: number = 1024;
  private height: number = 2048;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const context = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!context) {
      throw new Error('No se pudo inicializar el contexto 2D del Canvas');
    }
    this.ctx = context;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;
    this.texture.anisotropy = 16;
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public render(
    image: HTMLImageElement | null,
    transform: ImageTransform,
    caseStyle: CaseStyle,
    device: DeviceConfig
  ): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Limpiar canvas
    ctx.clearRect(0, 0, w, h);

    // 2. Fondo del color base de la funda
    if (caseStyle.transmission > 0.5) {
      // Transparente con tono sutil
      ctx.fillStyle = 'rgba(240, 245, 255, 0.15)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = caseStyle.color;
      ctx.fillRect(0, 0, w, h);
    }

    // 3. Dibujar la imagen del usuario con transformaciones
    if (image && image.complete && image.naturalWidth > 0) {
      ctx.save();

      // Centro del canvas
      const centerX = w / 2;
      const centerY = h / 2;

      // Desplazamiento en píxeles basado en porcentaje (-100 a 100)
      const offsetX = (transform.x / 100) * (w / 2);
      const offsetY = (transform.y / 100) * (h / 2);

      // Mover origen al centro + offset
      ctx.translate(centerX + offsetX, centerY + offsetY);

      // Rotación
      const rad = (transform.rotation * Math.PI) / 180;
      ctx.rotate(rad);

      // Volteo (Flip)
      const scaleX = transform.flipH ? -1 : 1;
      const scaleY = transform.flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Escala / Zoom
      const imgRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = w / h;

      let baseDrawWidth = w;
      let baseDrawHeight = h;

      if (imgRatio > canvasRatio) {
        // La imagen es más ancha que la funda
        baseDrawHeight = h;
        baseDrawWidth = h * imgRatio;
      } else {
        // La imagen es más alta o proporcional
        baseDrawWidth = w;
        baseDrawHeight = w / imgRatio;
      }

      const drawW = baseDrawWidth * transform.scale;
      const drawH = baseDrawHeight * transform.scale;

      // Dibujar imagen centrada en el origen transformado
      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();
    } else {
      // Indicador o textura sutil por defecto cuando no hay imagen
      this.drawPlaceholder(ctx, w, h, device);
    }

    // Notificar a Three.js que la textura ha cambiado
    this.texture.needsUpdate = true;
  }

  private drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    device: DeviceConfig
  ): void {
    ctx.save();
    
    // Marco punteado suave para la zona de personalización
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    const padding = 60;
    ctx.strokeRect(padding, padding, w - padding * 2, h - padding * 2);

    // Texto de ayuda suave centrado
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ZONA PERSONALIZABLE', w / 2, h / 2 - 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(device.name, w / 2, h / 2 + 10);
    ctx.fillText('Subí tu foto para ver el diseño', w / 2, h / 2 + 60);

    ctx.restore();
  }

  public exportPreviewDataUrl(): string {
    return this.canvas.toDataURL('image/jpeg', 0.92);
  }

  public dispose(): void {
    this.texture.dispose();
  }
}
