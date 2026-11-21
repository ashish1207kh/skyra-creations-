import { MongoClient, Db } from 'mongodb';
import dns from 'dns';

// Ensure resilient SRV record resolution across local Windows dev environments without breaking Vercel cloud network
if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {}
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoConnectionPromise: Promise<MongoConnection> | undefined;
}

// Authoritative Production Atlas Cluster connection strings
export const DIRECT_MONGODB_URI = 'mongodb://skyracreationsmodelling_db_user:T5WNIs7foGJkhggr@ac-ns9wrmm-shard-00-00.cfd62zb.mongodb.net:27017,ac-ns9wrmm-shard-00-01.cfd62zb.mongodb.net:27017,ac-ns9wrmm-shard-00-02.cfd62zb.mongodb.net:27017/skyra_production?ssl=true&replicaSet=atlas-rb74y0-shard-0&authSource=admin&retryWrites=true&w=majority';
export const SRV_MONGODB_URI = 'mongodb+srv://skyracreationsmodelling_db_user:T5WNIs7foGJkhggr@cluster0.cfd62zb.mongodb.net/skyra_production?retryWrites=true&w=majority';
export const PRODUCTION_MONGODB_URI = DIRECT_MONGODB_URI;

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'skyra_production';

/**
 * Returns a cached MongoDB connection or creates a new one with connection pooling.
 * Falls back to authoritative direct production Atlas replica-set if environment variable or SRV resolution fails.
 */
export async function getMongoConnection(): Promise<MongoConnection | null> {
  if (global._mongoConnectionPromise) {
    try {
      const conn = await global._mongoConnectionPromise;
      return conn;
    } catch {
      global._mongoConnectionPromise = undefined;
    }
  }

  const primaryUri = process.env.MONGODB_URI || DIRECT_MONGODB_URI;

  const connectPromise = (async (): Promise<MongoConnection> => {
    let client: MongoClient | null = null;

    // Attempt 1: Try Primary URI (from env or direct)
    try {
      client = new MongoClient(primaryUri, {
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
    } catch (primaryErr) {
      console.warn('Primary MongoDB connection failed, trying DIRECT_MONGODB_URI fallback:', primaryErr);
      if (primaryUri !== DIRECT_MONGODB_URI) {
        try {
          client = new MongoClient(DIRECT_MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
          });
          await client.connect();
        } catch (directErr) {
          global._mongoConnectionPromise = undefined;
          throw directErr;
        }
      } else {
        global._mongoConnectionPromise = undefined;
        throw primaryErr;
      }
    }

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
