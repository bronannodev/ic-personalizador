import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  BrandId,
  CaseStyle,
  CustomizerState,
  DeviceConfig,
  ImageMetadata,
  ImageTransform,
} from '../types/customizer';
import { BRANDS_DATA, CASE_STYLES, DEFAULT_DEVICE } from '../config/devices';
import { TextureGenerator } from '../utils/textureGenerator';
import { calculatePrintQuality } from '../utils/printQualityUtils';

const DEFAULT_TRANSFORM: ImageTransform = {
  x: 0,
  y: 0,
  scale: 1.0,
  rotation: 0,
  flipH: false,
  flipV: false,
  fitMode: 'cover',
};

export function useCustomizerState() {
  const [selectedBrand, setSelectedBrand] = useState<BrandId>('apple');
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(DEFAULT_DEVICE);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageElement, setUploadedImageElement] =
    useState<HTMLImageElement | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [imageTransform, setImageTransform] =
    useState<ImageTransform>(DEFAULT_TRANSFORM);
  const [selectedCaseStyle, setSelectedCaseStyle] = useState<CaseStyle>(
    CASE_STYLES[0]
  );
  const [is3dRotating, setIs3dRotating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'device' | 'design' | 'style'>('design');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Instancia única del generador de textura
  const textureGeneratorRef = useRef<TextureGenerator | null>(null);
  const [customTexture, setCustomTexture] = useState<THREE.CanvasTexture | null>(null);

  // Inicializar textura en cliente
  useEffect(() => {
    const generator = new TextureGenerator();
    textureGeneratorRef.current = generator;
    setCustomTexture(generator.getTexture());

    // Render inicial
    generator.render(null, DEFAULT_TRANSFORM, CASE_STYLES[0], DEFAULT_DEVICE);

    return () => {
      generator.dispose();
    };
  }, []);

  // Actualizar textura cuando cambie cualquier parámetro
  useEffect(() => {
    if (textureGeneratorRef.current) {
      textureGeneratorRef.current.render(
        uploadedImageElement,
        imageTransform,
        selectedCaseStyle,
        selectedDevice
      );
    }
  }, [uploadedImageElement, imageTransform, selectedCaseStyle, selectedDevice]);

  // Manejar cambio de marca
  const handleSelectBrand = useCallback((brandId: BrandId) => {
    setSelectedBrand(brandId);
    const brand = BRANDS_DATA.find((b) => b.id === brandId);
    if (brand && brand.devices.length > 0) {
      setSelectedDevice(brand.devices[0]);
    }
  }, []);

  // Manejar cambio de dispositivo
  const handleSelectDevice = useCallback(
    (device: DeviceConfig) => {
      setSelectedDevice(device);
      if (uploadedImageElement && imageMetadata) {
        // Recalcular calidad para el nuevo dispositivo
        const updatedMeta = calculatePrintQuality(
          uploadedImageElement,
          { name: imageMetadata.fileName, size: imageMetadata.fileSize } as File,
          device,
          imageTransform.scale
        );
        setImageMetadata(updatedMeta);
      }
    },
    [uploadedImageElement, imageMetadata, imageTransform.scale]
  );

  // Carga de archivo de imagen
  const handleImageUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            setUploadedImage(result);
            setUploadedImageElement(img);
            setImageTransform(DEFAULT_TRANSFORM);

            const meta = calculatePrintQuality(img, file, selectedDevice, 1.0);
            setImageMetadata(meta);

            setActiveTab('design');
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    },
    [selectedDevice]
  );

  // Remover imagen
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedImageElement(null);
    setImageMetadata(null);
    setImageTransform(DEFAULT_TRANSFORM);
  }, []);

  // Modificar transformaciones
  const updateTransform = useCallback(
    (updates: Partial<ImageTransform>) => {
      setImageTransform((prev) => {
        const updated = { ...prev, ...updates };
        if (
          updates.scale !== undefined &&
          uploadedImageElement &&
          imageMetadata
        ) {
          const updatedMeta = calculatePrintQuality(
            uploadedImageElement,
            { name: imageMetadata.fileName, size: imageMetadata.fileSize } as File,
            selectedDevice,
            updated.scale
          );
          setImageMetadata(updatedMeta);
        }
        return updated;
      });
    },
    [uploadedImageElement, imageMetadata, selectedDevice]
  );

  // Rotar 90 grados
  const rotate90 = useCallback(() => {
    setImageTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  }, []);

  // Voltear horizontalmente
  const toggleFlipH = useCallback(() => {
    setImageTransform((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  }, []);

  // Voltear verticalmente
  const toggleFlipV = useCallback(() => {
    setImageTransform((prev) => ({
      ...prev,
      flipV: !prev.flipV,
    }));
  }, []);

  // Centrar imagen
  const centerPosition = useCallback(() => {
    setImageTransform((prev) => ({
      ...prev,
      x: 0,
      y: 0,
    }));
  }, []);

  // Ajustar a cobertura total
  const fitToFullCoverage = useCallback(() => {
    setImageTransform((prev) => ({
      ...prev,
      x: 0,
      y: 0,
      scale: Math.max(1.15, prev.scale),
      fitMode: 'cover',
    }));
  }, []);

  // Resetear ajustes de posición y escala
  const resetTransform = useCallback(() => {
    setImageTransform(DEFAULT_TRANSFORM);
  }, []);

  // Exportar preview para WhatsApp
  const exportPreviewImage = useCallback((): string => {
    if (textureGeneratorRef.current) {
      return textureGeneratorRef.current.exportPreviewDataUrl();
    }
    return '';
  }, []);

  const state: CustomizerState = {
    selectedBrand,
    selectedDevice,
    uploadedImage,
    uploadedImageElement,
    imageMetadata,
    imageTransform,
    selectedCaseStyle,
    is3dRotating,
    activeTab,
    isOrderModalOpen,
  };

  return {
    state,
    customTexture,
    handleSelectBrand,
    handleSelectDevice,
    handleImageUpload,
    handleRemoveImage,
    updateTransform,
    rotate90,
    toggleFlipH,
    toggleFlipV,
    centerPosition,
    fitToFullCoverage,
    resetTransform,
    setSelectedCaseStyle,
    setIs3dRotating,
    setActiveTab,
    setIsOrderModalOpen,
    exportPreviewImage,
  };
}
