import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface ResizedFile {
  name: string;
  blob: Blob;
  url: string;
}

/**
 * Resizes an image to a target width while maintaining aspect ratio
 */
export const resizeImage = (
  file: File,
  targetWidth = 2048,
  quality = 0.9
): Promise<ResizedFile> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Calculate height to maintain aspect ratio
      const aspectRatio = img.height / img.width;
      const newHeight = Math.round(targetWidth * aspectRatio);

      // Set canvas dimensions
      canvas.width = targetWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, targetWidth, newHeight);

      // Convert to blob and create URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ name: file.name, blob, url });
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Process multiple image files for resizing
 */
export const processImages = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<ResizedFile[]> => {
  if (files.length === 0) return [];

  const resizedImages: ResizedFile[] = [];
  const progressStep = 100 / files.length;
  let currentProgress = 0;

  for (const file of files) {
    try {
      const resizedImage = await resizeImage(file);
      resizedImages.push(resizedImage);

      currentProgress += progressStep;
      onProgress?.(currentProgress);
    } catch (error) {
      console.error("Error resizing image:", error);
    }
  }

  onProgress?.(100);
  return resizedImages;
};

/**
 * Create and download a zip file containing all resized images
 */
export const downloadImagesAsZip = async (
  files: ResizedFile[],
  zipName = "resized-images.zip"
): Promise<void> => {
  const zip = new JSZip();

  files.forEach(({ name, blob }) => {
    zip.file(name, blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
};

/**
 * Download a single resized image
 */
export const downloadSingleImage = (file: ResizedFile): void => {
  saveAs(file.blob, `resized-${file.name}`);
};
