import { getMongoConnection } from './mongoClient.js';
import { Binary } from 'mongodb';

export interface StoredFile {
  key: string;
  data: Buffer;
  mimeType: string;
  size: number;
  createdAt: string;
}

/**
 * Save an uploaded file binary buffer directly into MongoDB Atlas
 */
export async function saveFileToMongo(
  key: string,
  buffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<{ success: boolean; key: string }> {
  const conn = await getMongoConnection();
  if (!conn) {
    throw new Error('Database connection unavailable for file storage.');
  }

  const collection = conn.db.collection('uploaded_files');
  
  // Upsert the file document
  await collection.updateOne(
    { key },
    {
      $set: {
        key,
        data: new Binary(buffer),
        mimeType,
        size: buffer.length,
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: {
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  return { success: true, key };
}

/**
 * Retrieve a stored file binary from MongoDB Atlas
 */
export async function getFileFromMongo(
  key: string
): Promise<{ buffer: Buffer; mimeType: string; size: number } | null> {
  const conn = await getMongoConnection();
  if (!conn) return null;

  const collection = conn.db.collection('uploaded_files');
  const doc = await collection.findOne({ key });

  if (!doc || !doc.data) return null;

  const buffer = doc.data.buffer ? Buffer.from(doc.data.buffer) : Buffer.from(doc.data);
  return {
    buffer,
    mimeType: doc.mimeType || 'image/jpeg',
    size: doc.size || buffer.length,
  };
}

/**
 * Delete a stored file from MongoDB Atlas
 */
export async function deleteFileFromMongo(key: string): Promise<boolean> {
  const conn = await getMongoConnection();
  if (!conn) return false;

  const collection = conn.db.collection('uploaded_files');
  const res = await collection.deleteOne({ key });
  return (res.deletedCount || 0) > 0;
}
