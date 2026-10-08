/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export const FILE_LIMITS = {
  IMAGE_MAX_BYTES: 10 * 1024 * 1024,   // 10MB
  AUDIO_MAX_BYTES: 30 * 1024 * 1024,   // 30MB
  VIDEO_MAX_BYTES: 100 * 1024 * 1024,  // 100MB
};

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  name: string;
}

export async function compressImageIfNeeded(file: File): Promise<File> {
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (isGif || isSvg || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const maxDimension = 2400;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function validateFileSize(file: File): { valid: boolean; error?: string; warning?: string } {
  const type = file.type;

  if (type.startsWith('image/')) {
    if (file.size > FILE_LIMITS.IMAGE_MAX_BYTES) {
      return { valid: false, error: 'Image exceeds maximum limit of 10MB.' };
    }
  } else if (type.startsWith('audio/')) {
    if (file.size > FILE_LIMITS.AUDIO_MAX_BYTES) {
      return { valid: false, error: 'Audio exceeds maximum limit of 30MB.' };
    }
  } else if (type.startsWith('video/')) {
    if (file.size > FILE_LIMITS.VIDEO_MAX_BYTES) {
      return {
        valid: false,
        error: 'Video exceeds maximum limit of 100MB. Consider hosting on YouTube or Vimeo instead.',
      };
    }
    if (file.size > 25 * 1024 * 1024) {
      return {
        valid: true,
        warning: 'Tip: For faster streaming and optimal load times, hosting this video on YouTube or Vimeo is recommended.',
      };
    }
  }

  return { valid: true };
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(
  rawFile: File,
  folder = 'uploads',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const validation = validateFileSize(rawFile);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const file = await compressImageIfNeeded(rawFile);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`;

  if (!storage) {
    if (onProgress) onProgress(50);
    const dataUrl = await fileToDataUrl(file);
    if (onProgress) onProgress(100);
    return {
      url: dataUrl,
      path: storagePath,
      size: file.size,
      contentType: file.type,
      name: file.name,
    };
  }

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(percent);
      },
      async (error) => {
        console.warn('Firebase Storage upload failed, falling back to persistent compressed Data URL:', error);
        try {
          const fallbackDataUrl = await fileToDataUrl(file);
          resolve({
            url: fallbackDataUrl,
            path: storagePath,
            size: file.size,
            contentType: file.type,
            name: file.name,
          });
        } catch {
          reject(error);
        }
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            path: storagePath,
            size: file.size,
            contentType: file.type,
            name: file.name,
          });
        } catch {
          const fallbackDataUrl = await fileToDataUrl(file);
          resolve({
            url: fallbackDataUrl,
            path: storagePath,
            size: file.size,
            contentType: file.type,
            name: file.name,
          });
        }
      }
    );
  });
}

export async function deleteFile(path: string): Promise<void> {
  if (!path) return;
  if (!storage) return;

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Could not delete storage file:', path, err);
  }
}

export async function replaceFile(
  oldPath: string | undefined,
  newFile: File,
  folder = 'uploads',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (oldPath) {
    try {
      await deleteFile(oldPath);
    } catch {
      // Continue even if old file not found
    }
  }
  return uploadFile(newFile, folder, onProgress);
}
