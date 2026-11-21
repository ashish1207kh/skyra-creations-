# SKYRA CREATIONS — Environment Setup & Configuration Guide

## 1. Overview

This document specifies all environment variables required for local development, continuous integration, and Vercel production hosting.

---

## 2. Environment Variables Matrix

| Variable Name | Required | Target Environment | Purpose / Example Value |
| :--- | :---: | :---: | :--- |
| `MONGODB_URI` | Yes (for Mongo) | Production / Staging | `mongodb+srv://skyra_admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB_NAME` | Optional | Production / Staging | `skyra_production` (defaults to `skyra_production`) |
| `ENCRYPTION_MASTER_KEY` | Recommended | Production | 64-char hex string (32 bytes) for AES-256-GCM |
| `BLIND_INDEX_KEY` | Recommended | Production | 64-char hex string (32 bytes) for HMAC-SHA256 |
| `ADMIN_SECRET_KEY` | Recommended | Production | Strong rotating secret for automated and emergency API access |
| `ADMIN_EMAIL` | Optional | Production / Dev | `admin@skyracreations.com` |
| `ADMIN_PASSWORD` | Optional | Production / Dev | Strong initial dashboard password |
| `SUPABASE_URL` | Fallback | Production / Dev | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Fallback | Production | Supabase secret service role key (Never expose in frontend) |
| `R2_ACCOUNT_ID` | Optional | Production | Cloudflare R2 Account Identifier |
| `R2_ACCESS_KEY_ID` | Optional | Production | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Optional | Production | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | Optional | Production | `skyra-proofs` |
| `R2_PUBLIC_DOMAIN` | Optional | Production | `https://media.skyracreations.site` |

---

## 3. How to Configure in Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Open your project: `skyra-creations` (or `shyra-creations-`).
3. Navigate to **Settings** > **Environment Variables**.
4. Add the variables above for the **Production**, **Preview**, and **Development** scopes.
5. Trigger a new deployment or click **Redeploy** to apply the updated environment variables.
