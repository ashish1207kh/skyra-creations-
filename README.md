# Skyra Creations — Vercel, Supabase & Cloudflare R2 Platform

Official event registration, balance payment, and participant management system for **Skyra Creations Runway Show 2026**.

## 1. Architecture Overview

- **Hosting & Compute**: [Vercel](https://vercel.com) (React 18 + TypeScript + Vite with Vercel Serverless Functions in `api/`).
- **Relational Database & Authentication**: [Supabase](https://supabase.com) PostgreSQL with Row Level Security (RLS) on all tables, automated financial triggers, and Supabase Auth for staff access.
- **Private Object Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) S3-compatible private object store. Server-generated short-lived signed URLs for authorized uploads (PUT, 5 min) and downloads (GET, 15 min). Zero public read permissions.
- **Security & Rate Limiting**: Strict MIME type validation (`image/jpeg`, `image/png`, `image/webp`), 10 MB file size limit, in-memory sliding window rate-limiting for public registration/upload endpoints, and audit logging table for administrative actions.

---

## 2. Free Tier & Commercial Compliance

- **Vercel**: Free Hobby tier for personal testing. Prior to commercial public launch, review Vercel Pro commercial plan requirements.
- **Supabase**: Free Tier provides 500 MB PostgreSQL database, 50,000 monthly active users, daily backups, and Row Level Security.
- **Cloudflare R2**: Free Tier provides 10 GB storage per month, 1,000,000 Class A operations/month, 10,000,000 Class B operations/month, and **zero egress fees**.
- **Quota Protections**: Quota exhaustion errors are trapped gracefully and presented with clear user notices rather than breaking the application.

---

## 3. Configuration & Credentials

Copy `.env.example` to `.env.local` for local development or enter these in your **Vercel Project Settings > Environment Variables**:

```env
# Supabase PostgreSQL & Auth (https://supabase.com/dashboard/project/_/settings/api)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudflare R2 Private Bucket (Cloudflare Dashboard > R2 > Manage R2 API Tokens)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=skyra-creations-private
```

> **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` is used exclusively in server-side functions (`api/_lib/supabaseAdmin.ts`) and is **never** bundled or exposed to frontend code.

---

## 4. Supabase Database Setup

1. Open your Supabase project's **SQL Editor**.
2. Run the migration script in [supabase/schema.sql](file:///o:/Skyra%20creations/supabase/schema.sql) to create all tables, indexes, triggers, and Row Level Security policies.
3. (Optional) Run the sample seed script in [supabase/seed.sql](file:///o:/Skyra%20creations/supabase/seed.sql) to populate test contestants.

---

## 5. Development & Deployment Commands

### Local Development
```powershell
# 1. Install dependencies
npm install

# 2. Start Vite local server
npm run dev
```

### Run Automated Test Suite
```powershell
npx tsx tests/serverless.test.ts
```

### Production Build (Vercel Build Command)
```powershell
npm run build
```

### Deploy to Vercel via GitHub
1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository.
3. Add the environment variables from Section 3.
4. Click **Deploy**. Vercel will build the frontend into `dist/` and automatically deploy the serverless functions in `api/`.
