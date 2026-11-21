import { MongoClient, Db } from 'mongodb';
import dns from 'dns';

// Ensure resilient SRV record resolution across local Windows dev environments and edge networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoConnectionPromise: Promise<MongoConnection> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'skyra_production';

/**
 * Returns a cached MongoDB connection or creates a new one with connection pooling.
 * Returns null if MONGODB_URI is not set.
 */
export async function getMongoConnection(): Promise<MongoConnection | null> {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (global._mongoConnectionPromise) {
    return global._mongoConnectionPromise;
  }

  const connectPromise = (async () => {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    // Ensure essential and TTL indexes on first connection
    try {
      // 1. Registrations collection indexes
      await db.collection('registrations').createIndex({ reg_id: 1 }, { unique: true });
      await db.collection('registrations').createIndex({ phone_blind_index: 1 }, { unique: true, sparse: true });
      await db.collection('registrations').createIndex({ email_blind_index: 1 }, { unique: true, sparse: true });
      await db.collection('registrations').createIndex({ status: 1 });
      await db.collection('registrations').createIndex({ created_at: -1 });

      // 2. Payments collection indexes (Strict duplicate prevention)
      await db.collection('payments').createIndex({ transaction_id: 1 }, { unique: true });
      await db.collection('payments').createIndex({ payment_id: 1 }, { unique: true });
      await db.collection('payments').createIndex({ reg_id: 1 });
      await db.collection('payments').createIndex({ status: 1 });
      await db.collection('payments').createIndex({ created_at: -1 });

      // 3. Events collection
      await db.collection('events').createIndex({ event_id: 1 }, { unique: true });
      await db.collection('events').createIndex({ status: 1 });

      // 4. Admin Users collection
      await db.collection('admin_users').createIndex({ email: 1 }, { unique: true });

      // 5. Audit Logs: 90-day automatic retention TTL index to safeguard 512 MB quota
      await db.collection('audit_logs').createIndex({ timestamp: -1 });
      await db.collection('audit_logs').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

      // 6. Temporary records: Automatic TTL expiration
      await db.collection('temporary_records').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
      await db.collection('temporary_records').createIndex({ key: 1 }, { unique: true, sparse: true });
    } catch (indexErr) {
      console.warn('Non-fatal index creation warning:', indexErr);
    }

    return { client, db };
  })();

  global._mongoConnectionPromise = connectPromise;
  return connectPromise;
}

/**
 * Checks if MongoDB is reachable
 */
export async function isMongoHealthy(): Promise<boolean> {
  try {
    const conn = await getMongoConnection();
    if (!conn) return false;
    await conn.db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
