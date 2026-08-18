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
  position: [number, number, number]; // [x, y, z] relative to phone back
  width: number;
  height: number;
  depth: number;
  radius: number;
  lensCount: number;
  hasFlash: boolean;
  hasLidar?: boolean;
  moduleX?: number; // mm from left edge
  moduleY?: number; // mm from top edge
  moduleWidth?: number; // mm
  moduleHeight?: number; // mm
  moduleRadius?: number; // mm
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
  x: number; // -100 to 100 (% offset)
  y: number; // -100 to 100 (% offset)
  scale: number; // 0.2 to 3.0
  rotation: number; // 0 to 360 deg
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
  transmission: number; // For clear/transparent cases
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

