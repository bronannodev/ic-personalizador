export type BrandId = 'apple' | 'samsung';

export type CameraType =
  | 'triple-pro-large'
  | 'triple-pro-classic'
  | 'diagonal-dual'
  | 'vertical-dual-square'
  | 'vertical-pill-modern'
  | 'vertical-pill-classic'
  | 'single-lens'
  | 'vertical-triple'
  | 'vertical-quad';

export interface CameraModuleConfig {
  type: CameraType;
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  radius: number;
  lensCount: number;
  hasFlash: boolean;
  hasLidar?: boolean;
  moduleX?: number;
  moduleY?: number;
  moduleWidth?: number;
  moduleHeight?: number;
  moduleRadius?: number;
}

export interface DeviceDimensions {
  width: number;
  height: number;
  depth: number;
  cornerRadius: number;
  realWidthMm?: number;
  realHeightMm?: number;
}

export interface DeviceConfig {
  id: string;
  brand: BrandId;
  name: string;
  generation?: string;
  badge?: string;
  modelPath?: string;
  mockupImagePath?: string;
  silhouetteImagePath?: string;
  dimensions: DeviceDimensions;
  camera: CameraModuleConfig;
  customizableMeshName: string;
  customizationArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaultCaseColor: string;
}

export interface BrandConfig {
  id: BrandId;
  name: string;
  devices: DeviceConfig[];
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  dpi: number;
  quality: 'Excelente' | 'Buena' | 'Aceptable' | 'Baja';
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipH?: boolean;
  flipV?: boolean;
  fitMode: 'cover' | 'contain' | 'custom';
}

export interface CaseStyle {
  id: string;
  name: string;
  color: string;
  opacity: number;
  roughness: number;
  metalness: number;
  transmission: number;
  clearcoat: number;
}

export interface CustomizerState {
  selectedBrand: BrandId;
  selectedDevice: DeviceConfig;
  uploadedImage: string | null;
  uploadedImageElement: HTMLImageElement | null;
  imageMetadata: ImageMetadata | null;
  imageTransform: ImageTransform;
  selectedCaseStyle: CaseStyle;
  is3dRotating: boolean;
  activeTab: 'device' | 'design' | 'style';
  isOrderModalOpen: boolean;
}
