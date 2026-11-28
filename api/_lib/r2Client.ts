import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'skyra-creations-private';

export const isR2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME
);

let s3Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3Client) {
    if (!isR2Configured) {
      throw new Error('Cloudflare R2 is not configured. Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY.');
    }
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface PresignUploadOptions {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  folder?: 'proofs' | 'portfolios' | 'photos';
}

export async function generatePresignedUploadUrl(opts: PresignUploadOptions): Promise<{
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}> {
  const { fileName, mimeType, fileSizeBytes, folder = 'proofs' } = opts;

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported MIME type "${mimeType}". Allowed types: JPG, PNG, WebP.`);
  }

  if (fileSizeBytes > MAX_FILE_SIZE) {
    throw new Error(`File size ${Math.round(fileSizeBytes / (1024 * 1024))}MB exceeds maximum limit of 10MB.`);
  }

  // Derive safe extension
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : (mimeType === 'image/jpeg' ? 'jpg' : 'png');

  // Generate random, non-guessable object key
  const randomKey = `${folder}/${crypto.randomUUID()}-${Date.now()}.${ext}`;
  const expiresInSeconds = 300; // 5 minutes

  if (!isR2Configured) {
    // Database-backed storage endpoint (MongoDB Atlas)
    return {
      uploadUrl: `/api/storage/upload?key=${encodeURIComponent(randomKey)}`,
      objectKey: randomKey,
      expiresInSeconds,
    };
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: randomKey,
    ContentType: mimeType,
    ContentLength: fileSizeBytes,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    objectKey: randomKey,
    expiresInSeconds,
  };
}

export async function generatePresignedViewUrl(objectKey: string): Promise<string> {
  if (!objectKey) return '/logo.png';
  if (!isR2Configured) {
    // Serve directly from database-backed storage
    return `/api/storage/file?key=${encodeURIComponent(objectKey)}`;
  }

  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  });

  // Short-lived signed GET URL (15 minutes)
  return await getSignedUrl(client, command, { expiresIn: 900 });
}

export async function getObjectStream(objectKey: string) {
  if (!isR2Configured) {
    throw new Error('Cloudflare R2 is not configured.');
  }
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  });
  const response = await client.send(command);
  return response.Body;
}
