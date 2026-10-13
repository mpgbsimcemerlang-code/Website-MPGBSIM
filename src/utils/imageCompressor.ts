/**
 * Utility to compress image files to optimized WebP/JPEG data URLs.
 * Keeps uploaded posters, photos, and logos below ~120KB while preserving visual clarity.
 * Prevents browser localStorage QuotaExceededError and provides instant mobile upload.
 */
export async function compressImageFile(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 1000,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // Safety timeout: if compression hangs for more than 5s, fallback to basic read
    const timeout = setTimeout(() => {
      fallbackFileReader(file, resolve);
    }, 5000);

    // If SVG, no compression needed, read as text/dataURL
    if (file.type === 'image/svg+xml') {
      clearTimeout(timeout);
      fallbackFileReader(file, resolve);
      return;
    }

    // Try using URL.createObjectURL for faster, memory-efficient loading on mobile
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // If createObjectURL fails, use FileReader
      clearTimeout(timeout);
      fallbackFileReader(file, resolve);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;

        // Scale dimensions proportionally
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          fallbackFileReader(file, resolve);
          return;
        }

        // Crisp rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(objectUrl);

        // Try WebP first, fallback to JPEG
        let compressedDataUrl = '';
        try {
          compressedDataUrl = canvas.toDataURL('image/webp', quality);
        } catch {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (!compressedDataUrl || !compressedDataUrl.startsWith('data:image')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedDataUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        fallbackFileReader(file, resolve);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      fallbackFileReader(file, resolve);
    };

    img.src = objectUrl;
  });
}

function fallbackFileReader(file: File, resolve: (val: string) => void) {
  try {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  } catch {
    resolve('');
  }
}

/**
 * Re-compresses an existing base64 data URL to keep it under Firestore 1MB and localStorage limits.
 */
export async function compressDataUrl(
  dataUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.72
): Promise<string> {
  if (
    !dataUrl ||
    typeof dataUrl !== 'string' ||
    !dataUrl.startsWith('data:image') ||
    dataUrl.startsWith('data:image/svg+xml')
  ) {
    return dataUrl;
  }

  // If already under 120KB (~122,880 chars), it is lightweight and safe
  if (dataUrl.length < 120 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(dataUrl), 4000);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        let result = '';
        try {
          result = canvas.toDataURL('image/webp', quality);
        } catch {
          result = canvas.toDataURL('image/jpeg', quality);
        }
        if (!result || !result.startsWith('data:image')) {
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result && result.length < dataUrl.length ? result : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}


