# SKYRA CREATIONS — MongoDB Atlas Migration Guide

## 1. Overview

This document outlines the step-by-step procedure for executing an idempotent, zero-downtime migration of contestant and financial data from Supabase to MongoDB Atlas.

---

## 2. Prerequisites

1. **MongoDB Atlas Cluster**:
   - M0 (Free Tier) or M10+ dedicated cluster.
   - Network Access: Allow access from `0.0.0.0/0` (standard for Vercel dynamic IP serverless functions) with strict username/password authentication.
2. **Environment Variables**:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - `MONGODB_DB_NAME`: `skyra_production`
   - `ENCRYPTION_MASTER_KEY`: 64-character hex string (32 bytes)
   - `BLIND_INDEX_KEY`: 64-character hex string (32 bytes)

---

## 3. Migration Execution

The automated migration script is located at `scripts/migrate-supabase-to-mongodb.ts`.

### Step 1: Run Migration in Dry-Run / Test Mode
```bash
npx tsx scripts/migrate-supabase-to-mongodb.ts
```

### Step 2: Validation of Migrated Records
The script outputs:
```
=====================================================
MIGRATION SUMMARY:
- Participants Migrated & Encrypted: <count>
- Payments Migrated:                 <count>
- Status:                            100% COMPLETE
=====================================================
```

### Step 3: Verify Indexes in MongoDB Compass / Atlas UI
Ensure the following indexes exist:
- `registrations`: `reg_id_1` (unique), `phone_blind_index_1`, `email_blind_index_1`
- `payments`: `payment_id_1` (unique), `reg_id_1`
- `events`: `event_id_1` (unique)

---

## 4. Rollback Plan

If MongoDB Atlas becomes unavailable or fails health checks:
1. Simply remove or comment out `MONGODB_URI` in Vercel Environment Variables.
2. The application will instantly fall back to the existing Supabase database with zero downtime and zero data loss.
3. Neither Supabase tables nor existing data are altered during migration.
