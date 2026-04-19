import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSize: number; // bytes
  compressedSize: number; // bytes
  reductionPercent: number;
}

/**
 * Smart compression: resize max width 700px, convert to WebP,
 * visually-lossless quality. Targets 50KB–150KB.
 */
export async function compressStudentImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  const options = {
    maxSizeMB: 0.15, // ~150KB target
    maxWidthOrHeight: 700,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.92, // visually lossless
  };

  const compressedBlob = await imageCompression(file, options);

  // Ensure it's a File with .webp extension
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const compressedFile = new File([compressedBlob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  const compressedSize = compressedFile.size;
  const reductionPercent = originalSize > 0
    ? ((originalSize - compressedSize) / originalSize) * 100
    : 0;

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    reductionPercent,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
