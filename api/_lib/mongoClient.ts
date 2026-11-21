import { MongoClient, Db } from 'mongodb';

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
  if (!MONGODB_URI) {
    return null;
  }

  if (global._mongoConnectionPromise) {
    return global._mongoConnectionPromise;
  }

  const connectPromise = (async () => {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    // Ensure essential indexes on first connection
    try {
      await db.collection('registrations').createIndex({ reg_id: 1 }, { unique: true });
      await db.collection('registrations').createIndex({ phone_blind_index: 1 });
      await db.collection('registrations').createIndex({ email_blind_index: 1 });
      await db.collection('registrations').createIndex({ status: 1 });
      await db.collection('registrations').createIndex({ event_id: 1 });
      await db.collection('registrations').createIndex({ created_at: -1 });

      await db.collection('events').createIndex({ event_id: 1 }, { unique: true });
      await db.collection('events').createIndex({ status: 1 });

      await db.collection('admin_users').createIndex({ email: 1 }, { unique: true });
      await db.collection('audit_logs').createIndex({ timestamp: -1 });
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
