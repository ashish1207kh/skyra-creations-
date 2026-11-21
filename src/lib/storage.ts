import { PresignedUploadResponse } from '../types/index';

export async function uploadFileToR2(
  file: File,
  folder: 'proofs' | 'portfolios' | 'photos' = 'proofs',
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. Client-side preliminary validation
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP images are accepted.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds the 10 MB maximum limit.');
  }

  // 2. Request short-lived presigned upload URL from Vercel Serverless API
  const presignRes = await fetch('/api/storage/presigned-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      folder,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to authorize file upload.');
  }

  const resData = await presignRes.json().catch(() => null);
  const upload_url = resData?.upload_url || resData?.uploadUrl;
  const object_key = resData?.object_key || resData?.objectKey;

  if (!upload_url || typeof upload_url !== 'string' || !object_key) {
    throw new Error('Server returned an invalid storage upload response.');
  }

  // 3. Upload binary directly to Cloudflare R2 via signed PUT URL
  // If in local mock mode without R2, bypass direct PUT
  if (upload_url.startsWith('/api/storage/local-upload-mock')) {
    if (onProgress) onProgress(100);
    return object_key;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', upload_url, true);
    xhr.setRequestHeader('Content-Type', file.type);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(object_key);
      } else {
        reject(new Error(`Cloudflare R2 upload failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during file upload to Cloudflare R2.'));
    };

    xhr.send(file);
  });
}
