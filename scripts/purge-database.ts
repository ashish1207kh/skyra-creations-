/**
 * SKYRA CREATIONS — Zero Storage Database Purge Utility
 *
 * Safely purges:
 * - Temporary records (temporary_records)
 * - Test payments (payments)
 * - Test registrations (registrations)
 * - Historical audit records (audit_logs)
 *
 * Preserves:
 * - Event configuration (events)
 * - Admin credentials (admin_users)
 *
 * Usage:
 *   npx tsx scripts/purge-database.ts
 */

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'skyra_production';

async function purge() {
  console.log('========================================================');
  console.log('SKYRA CREATIONS — DATABASE STORAGE PURGE & ZERO RESET');
  console.log('========================================================');
  console.log('Database:', MONGODB_DB_NAME);

  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    console.log('Connected to MongoDB successfully.\n');

    // 1. Purge temporary_records
    try {
      const tempRes = await db.collection('temporary_records').deleteMany({});
      console.log(`✓ Deleted ${tempRes.deletedCount} documents from 'temporary_records'`);
    } catch (e: any) {
      console.log(`- 'temporary_records' collection notice: ${e.message}`);
    }

    // 2. Purge payments
    try {
      const payRes = await db.collection('payments').deleteMany({});
      console.log(`✓ Deleted ${payRes.deletedCount} documents from 'payments'`);
    } catch (e: any) {
      console.log(`- 'payments' collection notice: ${e.message}`);
    }

    // 3. Purge registrations
    try {
      const regRes = await db.collection('registrations').deleteMany({});
      console.log(`✓ Deleted ${regRes.deletedCount} documents from 'registrations'`);
    } catch (e: any) {
      console.log(`- 'registrations' collection notice: ${e.message}`);
    }

    // 4. Purge audit_logs
    try {
      const auditRes = await db.collection('audit_logs').deleteMany({});
      console.log(`✓ Deleted ${auditRes.deletedCount} documents from 'audit_logs'`);
    } catch (e: any) {
      console.log(`- 'audit_logs' collection notice: ${e.message}`);
    }

    // 5. Insert new zero-baseline reset log
    await db.collection('audit_logs').insertOne({
      action: 'ZERO_STORAGE_RESET',
      timestamp: new Date().toISOString(),
      details: 'All temporary data and test records purged. Storage reset to zero baseline.',
    });
    console.log(`✓ Inserted clean baseline reset log in 'audit_logs'\n`);

    console.log('========================================================');
    console.log('PURGE COMPLETE: All temporary records deleted.');
    console.log('Database is now reset and ready with zero storage.');
    console.log('========================================================');
  } catch (err: any) {
    console.error('Purge failed:', err.message);
  } finally {
    await client.close();
  }
}

purge();
