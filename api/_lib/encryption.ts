import crypto from 'crypto';

// AES-256-GCM configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

// Fallback development keys if environment variables are not set
// In production, ENCRYPTION_MASTER_KEY and BLIND_INDEX_KEY must be configured in Vercel environment variables.
const DEV_MASTER_KEY = 'skyra_production_encryption_key_32_bytes_len!';
const DEV_BLIND_INDEX_KEY = 'skyra_blind_index_salt_key_32_bytes_len!!';

function getMasterKey(): Buffer {
  const envKey = process.env.ENCRYPTION_MASTER_KEY;
  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    return crypto.scryptSync(envKey, 'skyra-salt-master', 32);
  }
  return crypto.scryptSync(DEV_MASTER_KEY, 'skyra-dev-salt', 32);
}

function getBlindIndexKey(): Buffer {
  const envKey = process.env.BLIND_INDEX_KEY;
  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    return crypto.scryptSync(envKey, 'skyra-salt-blind-index', 32);
  }
  return crypto.scryptSync(DEV_BLIND_INDEX_KEY, 'skyra-dev-blind-salt', 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: base64(iv + authTag + ciphertext)
 */
export function encryptField(plainText: string | null | undefined): string | null {
  if (plainText === null || plainText === undefined || plainText === '') {
    return null;
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine IV (12) + Tag (16) + Encrypted data
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts a base64 encoded ciphertext using AES-256-GCM.
 * Backward compatible: if input is not valid base64 encrypted payload, returns plaintext as fallback.
 */
export function decryptField(cipherText: string | null | undefined): string {
  if (!cipherText) return '';

  try {
    const combined = Buffer.from(cipherText, 'base64');
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      // Not encrypted with our scheme, return raw text
      return cipherText;
    }

    const key = getMasterKey();
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    // If decryption fails (e.g. legacy unencrypted data), return original string
    return cipherText;
  }
}

/**
 * Computes a deterministic HMAC-SHA256 blind index for exact search on encrypted fields (e.g. phone, email).
 */
export function computeBlindIndex(value: string | null | undefined): string {
  if (!value) return '';
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = getBlindIndexKey();
  return crypto.createHmac('sha256', key).update(normalized).digest('hex');
}
