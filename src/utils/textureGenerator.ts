import * as THREE from 'three';
import { DeviceConfig, ImageTransform, CaseStyle } from '../types/customizer';

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  public texture: THREE.CanvasTexture;

  constructor(width: number = 2048, height: number = 2048) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;
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
    if (!this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const isTransparent = caseStyle.transmission > 0.5;
    ctx.fillStyle = isTransparent ? 'rgba(255, 255, 255, 0.05)' : caseStyle.color;
    ctx.fillRect(0, 0, w, h);

    if (image) {
      ctx.save();

      const offsetX = (transform.x / 100) * (w / 2);
      const offsetY = (transform.y / 100) * (h / 2);

      ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      const imgRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = w / h;

      let baseDrawWidth = w;
      let baseDrawHeight = h;

      if (imgRatio > canvasRatio) {
        baseDrawWidth = w;
        baseDrawHeight = w / imgRatio;
      } else {
        baseDrawHeight = h;
        baseDrawWidth = h * imgRatio;
      }

      const drawW = baseDrawWidth * transform.scale;
      const drawH = baseDrawHeight * transform.scale;

      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();
    } else {
      this.drawPlaceholder(ctx, w, h, device);
    }

    this.texture.needsUpdate = true;
  }

  private drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    device: DeviceConfig
  ): void {
    ctx.save();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    const padding = 60;
    ctx.strokeRect(padding, padding, w - padding * 2, h - padding * 2);

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
