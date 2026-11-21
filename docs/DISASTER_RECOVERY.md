# SKYRA CREATIONS — Disaster Recovery & Business Continuity Plan

## 1. Objectives

- **Recovery Point Objective (RPO)**: $< 1$ hour.
- **Recovery Time Objective (RTO)**: $< 15$ minutes.

---

## 2. Failure Scenarios & Recovery Procedures

### Scenario A: MongoDB Atlas Outage
- **Detection**: `/api/health` reports `database.mongoHealthy: false`.
- **Mitigation**:
  1. Remove `MONGODB_URI` from Vercel environment variables.
  2. Redeploy or restart deployment.
  3. The system automatically switches to the secondary Supabase database or in-memory fallback.

### Scenario B: Cloudflare R2 Outage
- **Detection**: Uploading payment receipts returns 500 error.
- **Mitigation**:
  1. Fallback to Supabase Storage bucket `proofs`.
  2. Temporary direct upload fallback enabled via serverless proxy.

### Scenario C: Corrupted Deployment or Breaking Frontend Change
- **Detection**: Blank screen or runtime JavaScript exception.
- **Mitigation**:
  1. Go to Vercel Dashboard > **Deployments**.
  2. Find the previous stable deployment (e.g. `5ceb78d` or `dc5dc90`).
  3. Click **Instant Rollback**.
  4. Vercel routes 100% of global traffic back to the previous deployment in $< 10$ seconds without rebuilding.

---

## 3. Database Backup Schedule

1. **MongoDB Atlas**:
   - Automated continuous cloud backups with point-in-time recovery enabled.
   - Daily snapshots retained for 7 days.
2. **Supabase**:
   - Automated daily database backups retained for 7 days.
