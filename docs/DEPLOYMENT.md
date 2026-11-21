# SKYRA CREATIONS — PRODUCTION DEPLOYMENT & DEVOPS HANDBOOK

**Platform:** SKYRA CREATIONS — RUNWAY SHOW 2026 Portal  
**Domain:** `https://skyracreations.site` | `https://www.skyracreations.site`  
**Hosting & Serverless:** Vercel  
**Database & Auth:** Supabase  
**Storage:** Cloudflare R2 (Private S3 Bucket)  
**Registrar & DNS:** GoDaddy  
**Repository:** `ashish1207kh/shyra-creations-` (GitHub)

---

## Table of Contents
1. [Difference Between CI and CD](#1-difference-between-ci-and-cd)
2. [Project Deployment Architecture](#2-project-deployment-architecture)
3. [GitHub Branch Strategy](#3-github-branch-strategy)
4. [CI/CD Workflow Explanation](#4-cicd-workflow-explanation)
5. [Vercel Project Configuration](#5-vercel-project-configuration)
6. [GoDaddy DNS Configuration (Step-by-Step)](#6-godaddy-dns-configuration-step-by-step)
7. [Custom Domain Setup & Routing](#7-custom-domain-setup--routing)
8. [HTTPS and SSL Verification](#8-https-and-ssl-verification)
9. [Supabase Production Configuration](#9-supabase-production-configuration)
10. [Environment Variable Reference](#10-environment-variable-reference)
11. [Deployment Procedure (Step-by-Step)](#11-deployment-procedure-step-by-step)
12. [Rollback Procedure](#12-rollback-procedure)
13. [Troubleshooting Guide](#13-troubleshooting-guide)
14. [Production Release Checklist](#14-production-release-checklist)

---

## 1. Difference Between CI and CD

### Continuous Integration (CI)
- **Definition:** The practice of automating the integration of code changes from multiple contributors into a single repository branch multiple times a day.
- **Role in Skyra Creations:** When a developer pushes code or opens a Pull Request to `main`, GitHub Actions automatically:
  - Installs exact dependencies via `npm ci`.
  - Runs type checking (`tsc --noEmit`).
  - Verifies production bundles (`npm run build`).
  - Executes unit and integration test suites (`tests/serverless.test.ts`).
  - Scans for exposed secrets or tracked `.env` files.
  - Prevents merging if any check fails.
- **Key Benefit:** Bugs, type mismatches, and security leaks are caught immediately before they ever touch production.

### Continuous Deployment (CD)
- **Definition:** The automated process of releasing validated code changes to a live staging or production environment without manual intervention.
- **Role in Skyra Creations:** Handled directly by **Vercel's Native Git Integration**:
  - Once code is merged into `main` (and passes GitHub Actions CI), Vercel receives an authorized webhook from GitHub.
  - Vercel builds the frontend assets and serverless functions in an isolated container.
  - Vercel deploys the outputs to its global Anycast CDN edge network and automatically promotes it to production.
  - If a build fails, Vercel keeps the previous working deployment live without any downtime.

---

## 2. Project Deployment Architecture

```
                                  [ User Browser ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
      https://www.skyracreations.site           https://skyracreations.site
             (308 Permanent Redirect)                   (Canonical Apex)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                               [ GoDaddy DNS ]
                      A Record: 76.76.21.21 (@)
                 CNAME Record: cname.vercel-dns.com (www)
                                         │
                                         ▼
                              [ Vercel Edge Network ]
                                         │
            ┌────────────────────────────┴────────────────────────────┐
            ▼                                                         ▼
     [ Static CDN Assets ]                                 [ Serverless Node Runtime ]
     React 18 SPA (Vite)                                   8 Consolidated Functions
     /dist/assets/*.js & *.css                             /api/*
            │                                                         │
            │                                 ┌───────────────────────┴───────────────────────┐
            │                                 ▼                                               ▼
            │                        [ Supabase Cloud ]                             [ Cloudflare R2 ]
            │                     PostgreSQL 15 + PostgREST                       Private S3 Object Bucket
            │                     Row Level Security (RLS)                        Signed PUT/GET Proofs
            │                     Contestants, Payments, Audit
            └─────────────────────────────────┬───────────────────────────────────────────────┘
```

### Monorepo Structure Clarification
- **Root Directory (`/`)**: Hosts the active full-stack production application.
- **`/backend` & `/frontend` Directories**: Legacy prototype directories from initial local development. Both are explicitly ignored in `.vercelignore` and are **not** deployed to Vercel.

---

## 3. GitHub Branch Strategy

We follow the standard **GitHub Flow** trunk-based branching strategy:

1. **`main` Branch:**
   - Protected production branch.
   - Represents the live, production-tested state of `https://skyracreations.site`.
   - Never commit experimental or broken code directly to `main`.
2. **Feature Branches (`feat/`, `fix/`, `chore/`):**
   - Branch off `main` (e.g. `feat/event-schedule-modal`).
   - Push to GitHub and open a Pull Request against `main`.
   - Generates an ephemeral **Vercel Preview Deployment** for visual testing.
   - GitHub Actions executes `pr-validation.yml`.
3. **Merging to `main`:**
   - Allowed only after all automated CI checks pass.
   - Fast-forward or squash merge into `main` automatically triggers Vercel Production Deployment.

---

## 4. CI/CD Workflow Explanation

The repository uses two purpose-built GitHub Actions workflows under `.github/workflows/`:

### A. Pull Request Validation (`.github/workflows/pr-validation.yml`)
- **Trigger:** Any pull request targeting `main`.
- **Tasks Executed:**
  1. `actions/checkout@v4`: Clones repository.
  2. `actions/setup-node@v4`: Installs Node.js 20 LTS with NPM caching.
  3. `npm ci`: Clean, reproducible dependency installation from `package-lock.json`.
  4. **Secret Leak Guard:** Scans git tree for tracked `.env` files.
  5. **Security Audit:** Runs `npm audit --audit-level=critical`.
  6. **TypeScript Linting:** Runs `npm run lint` (`tsc --noEmit`).
  7. **Vite Production Build:** Runs `npm run build` to ensure no bundling regressions.
  8. **Serverless Test Suite:** Runs `npx tsx tests/serverless.test.ts` (11 comprehensive test suites).

### B. Production Branch CI (`.github/workflows/production-ci.yml`)
- **Trigger:** Direct push or merge to `main`.
- **Tasks Executed:**
  1. Verifies code integrity, types, and builds.
  2. Validates serverless function count against Vercel Hobby plan limit (8 / 12 functions used).
  3. Emits deployment readiness status.
  4. Hands off deployment to Vercel's native Git App.

---

## 5. Vercel Project Configuration

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Root Directory:** `./`
- **Node.js Version:** 20.x

### `vercel.json` Specification:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/|.*\\..*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

---

## 6. GoDaddy DNS Configuration (Step-by-Step)

To route your GoDaddy domain (`skyracreations.site`) to Vercel, update the DNS records in your GoDaddy DNS Management console:

### Step 1: Sign in to GoDaddy
1. Log into [GoDaddy Domain Portfolio](https://dcc.godaddy.com/domains).
2. Select **`skyracreations.site`** and click **Manage DNS** (or **DNS Records**).

### Step 2: Update DNS Records
Make the following changes carefully:

| Record Type | Name / Host | Current Value | NEW Correct Value | TTL | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `216.198.79.1` | **`76.76.21.21`** | `600 seconds` (or 1/2 Hour) | **EDIT** |
| **CNAME** | `www` | `skyracreations.site` | **`cname.vercel-dns.com.`** | `600 seconds` (or 1/2 Hour) | **EDIT** |
| **CNAME** | `ns1.vercel-dns.com` | `f5883eb41615417e.vercel-dns-017.com` | `f5883eb41615417e.vercel-dns-017.com` | Default | **LEAVE AS IS** |
| **CNAME** | `_domainconnect` | `_domainconnect.gd.domaincontrol.com` | `_domainconnect.gd.domaincontrol.com` | Default | **LEAVE AS IS** |
| **NS** | `@` | `ns25.domaincontrol.com` / `ns26...` | (Do not change) | Default | **NEVER MODIFY** |
| **SOA** | `@` | Primary nameserver | (Do not change) | Default | **NEVER MODIFY** |
| **TXT** | `_dmarc` | Existing DMARC | (Do not change) | Default | **NEVER MODIFY** |

> [!CAUTION]
> **CRITICAL DNS SAFETY:**
> - NEVER delete or change the Nameservers (`ns25`, `ns26`).
> - NEVER delete or modify the DMARC TXT record.
> - Only change the **A Record (`@`)** and **CNAME (`www`)**.

---

## 7. Custom Domain Setup & Routing

In your **Vercel Project Dashboard** (`https://vercel.com/` > Project `shyra-creations` > **Settings** > **Domains**):

1. **Root Domain (`skyracreations.site`):**
   - Click **Edit**.
   - Ensure it is assigned to **Production**.
   - This makes `https://skyracreations.site` the primary canonical URL.
2. **Subdomain (`www.skyracreations.site`):**
   - Click **Edit**.
   - Select **Redirect to `skyracreations.site`**.
   - Set Redirect Status Code to **`308 Permanent Redirect`**.
3. **Verify Status:**
   - Both domains will show a green checkmark: **Valid Configuration**.

---

## 8. HTTPS and SSL Verification

- **Automatic SSL Provisioning:** Vercel automatically requests and provisions a Let's Encrypt SSL/TLS certificate for both `skyracreations.site` and `www.skyracreations.site` as soon as the GoDaddy DNS records resolve to Vercel's Anycast IP (`76.76.21.21`).
- **HTTP to HTTPS Redirection:** Handled automatically by Vercel edge routers with HSTS (HTTP Strict Transport Security) enabled.
- **Verification Command:**
  ```bash
  curl -I https://skyracreations.site
  ```
  Expected header: `HTTP/2 200` or `HTTP/1.1 200 OK` with valid TLS certificate.

---

## 9. Supabase Production Configuration

In your [Supabase Dashboard](https://supabase.com/dashboard) under **Authentication** > **URL Configuration**:

1. **Site URL:**
   Set to:
   ```
   https://skyracreations.site
   ```
2. **Redirect URLs (Allowlist):**
   Add the following entries:
   ```
   https://skyracreations.site/**
   https://www.skyracreations.site/**
   https://shyra-creations-sigma.vercel.app/**
   http://localhost:5173/**
   ```
3. Save changes. This guarantees all password reset links, magic links, and OAuth callbacks redirect safely to your production custom domain.

---

## 10. Environment Variable Reference

Configure these in **Vercel Dashboard** > **Project Settings** > **Environment Variables**:

| Variable Name | Required Scope | Client/Server | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Production, Preview, Dev | Client (Public) | Supabase project API gateway |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Dev | Client (Public) | RLS-restricted public API access |
| `VITE_SITE_URL` | Production | Client (Public) | Canonical base URL (`https://skyracreations.site`) |
| `SUPABASE_URL` | Production, Preview, Dev | Server (Private) | Serverless DB client endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | Server (Private) | Admin DB operations & bypass key |
| `R2_ACCOUNT_ID` | Production, Preview, Dev | Server (Private) | Cloudflare account identifier |
| `R2_ACCESS_KEY_ID` | Production, Preview, Dev | Server (Private) | S3 API access key for private proofs |
| `R2_SECRET_ACCESS_KEY` | Production, Preview, Dev | Server (Private) | S3 API secret access key |
| `R2_BUCKET_NAME` | Production, Preview, Dev | Server (Private) | Bucket name (`skyra-creations-private`) |
| `ADMIN_EMAIL` | Production, Preview, Dev | Server (Private) | Fallback operations admin email |
| `ADMIN_PASSWORD` | Production, Preview, Dev | Server (Private) | Fallback operations admin password |
| `ADMIN_JWT_SECRET` | Production, Preview, Dev | Server (Private) | HMAC signing secret for admin sessions |

---

## 11. Deployment Procedure (Step-by-Step)

1. **Local Development & Testing:**
   ```bash
   npm run dev            # Start Vite dev server at http://localhost:5173
   npm run lint           # Verify TypeScript types
   npm run build          # Test production bundle
   npx tsx tests/serverless.test.ts # Execute integration tests
   ```
2. **Stage & Commit Changes:**
   ```bash
   git checkout -b feat/your-feature-name
   git add -A
   git commit -m "feat: description of changes"
   git push origin feat/your-feature-name
   ```
3. **Pull Request & CI Quality Gate:**
   - Open PR on GitHub.
   - GitHub Actions runs `pr-validation.yml`.
   - Vercel generates an ephemeral Preview Deployment URL for visual QA.
4. **Merge to Main:**
   - Merge PR into `main`.
   - GitHub Actions runs `production-ci.yml`.
   - Vercel Native Git integration automatically builds and deploys to `https://skyracreations.site`.

---

## 12. Rollback Procedure

If a bug or regression is detected in production:

### Instant 1-Click Rollback via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/) > Select project `shyra-creations`.
2. Click the **Deployments** tab.
3. Locate the previous working production deployment.
4. Click the three dots `...` on the right > Select **Instant Rollback**.
5. The previous working deployment becomes live globally within seconds with zero downtime.

### Git Revert:
```bash
git checkout main
git pull origin main
git revert HEAD --no-edit
git push origin main
```
Vercel will immediately deploy the reverted commit.

---

## 13. Troubleshooting Guide

### Issue 1: "No more than 12 Serverless Functions can be added"
- **Cause:** Vercel Hobby plan limit exceeded.
- **Solution:** We consolidated all admin routes into `api/admin/[action].ts` and storage into `api/storage/[action].ts`, reducing total function count from 14 to 8. Never create standalone `.ts` files inside `/api` unless staying within the 12-function limit.

### Issue 2: Domain shows GoDaddy parking page ("Robo Logistics")
- **Cause:** The `@` A record is still pointing to GoDaddy's parking IP (`216.198.79.1`).
- **Solution:** Edit GoDaddy DNS: Change `@` A record to `76.76.21.21`.

### Issue 3: SSL Certificate Error on `www.skyracreations.site`
- **Cause:** `www` CNAME points to `skyracreations.site` instead of Vercel DNS.
- **Solution:** Change `www` CNAME in GoDaddy to `cname.vercel-dns.com.` and configure Vercel domain setting to 308 redirect `www` to root.

### Issue 4: API requests fail with 401 Unauthorized in Admin Portal
- **Cause:** Missing `ADMIN_JWT_SECRET` or expired session.
- **Solution:** Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel environment variables, and log in fresh from the Admin Portal.

---

## 14. Production Release Checklist

Before releasing any major update:

- [ ] All TypeScript types pass (`npm run lint`).
- [ ] Production build succeeds without warnings (`npm run build`).
- [ ] All 11 automated serverless test suites pass (`npx tsx tests/serverless.test.ts`).
- [ ] No `.env` or secrets committed in git history.
- [ ] Total serverless function count in `api/` is <= 12 (currently 8).
- [ ] Vercel domains report green checkmarks (`Valid Configuration`).
- [ ] GoDaddy A record `@` points to `76.76.21.21`.
- [ ] GoDaddy CNAME `www` points to `cname.vercel-dns.com.`.
- [ ] Health check endpoint (`https://skyracreations.site/api/health`) returns `{"status":"healthy"}`.
- [ ] Model registration and UPI payment flow tested on mobile viewport.
- [ ] Digital Runway Entry Pass QR code renders cleanly.
