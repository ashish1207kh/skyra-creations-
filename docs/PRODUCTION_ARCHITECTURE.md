# SKYRA CREATIONS — Production Architecture Specification

## 1. Executive Summary

SKYRA CREATIONS operates a luxury fashion event and model registration portal deployed on Vercel's global edge network, backed by a dual-driver database layer (MongoDB Atlas primary with Supabase failover/fallback), Cloudflare R2 object storage for payment proof telemetry, and client-side React 18 / Vite 6 rendering.

The system is designed with:
- **Zero frontend database connections**: All database interactions are strictly mediated through authenticated serverless functions.
- **Strict Vercel Hobby plan compliance**: Consolidated dynamic routers ensure $\le 8$ serverless functions (well below the 12-function hard limit).
- **Multi-Event Tenancy**: Complete logical isolation of event data with strict state machine validation.
- **Field-Level Encryption**: AES-256-GCM cipher with HMAC-SHA256 blind indexing for sensitive contestant PII.

---

## 2. System Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                CLIENTS / USERS                                  |
|         Desktop Browsers · iOS / Android Mobile · WhatsApp Share Cards          |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                          EDGE & DNS LAYER (GoDaddy & Vercel)                    |
|  - skyracreations.site (A: 216.198.79.1) -> 308 Permanent Redirect             |
|  - www.skyracreations.site (CNAME -> 8eaf91e5083b2b4f.vercel-dns-017.com)       |
|  - Automatic SSL / TLS 1.3 termination, HTTP/2, Brotli & Gzip compression       |
+---------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
+------------------------------------+   +------------------------------------+
|       STATIC ASSET CDN             |   |      SERVERLESS API LAYER          |
|  - React 18 SPA (Vite)             |   |  - api/health.ts                   |
|  - /assets/ (Immutable JS/CSS)     |   |  - api/register.ts                 |
|  - /public/ (Favicons, OG Image)   |   |  - api/lookup.ts                   |
|  - robots.txt & sitemap.xml        |   |  - api/balance-payment.ts          |
|                                    |   |  - api/verify-pass.ts              |
|                                    |   |  - api/payment-info.ts             |
|                                    |   |  - api/admin/[action].ts (Consol.) |
|                                    |   |  - api/storage/[action].ts(Consol.)|
+------------------------------------+   +------------------------------------+
                                                           |
                      +------------------------------------+------------------------------------+
                      |                                    |                                    |
                      v                                    v                                    v
+------------------------------------+   +------------------------------------+   +------------------------------------+
|       PRIMARY DATABASE             |   |       OBJECT STORAGE               |   |       FAILOVER / LEGACY DB         |
|         MongoDB Atlas              |   |       Cloudflare R2                |   |             Supabase               |
|  - AES-256-GCM encrypted PII       |   |  - Private S3-compatible bucket    |   |  - PostgreSQL fallback store       |
|  - HMAC-SHA256 blind indexing      |   |  - Pre-signed PUT uploads (5 min)  |   |  - Seamless zero-downtime switch   |
|  - Serverless connection pooling   |   |  - Short-lived GET viewing URLs    |   |  - Preserved existing data         |
+------------------------------------+   +------------------------------------+   +------------------------------------+
```

---

## 3. Serverless Function Topology (8 Functions — Hobby Compliant)

| Route | File Path | Operations Supported |
| :--- | :--- | :--- |
| `GET /api/health` | `api/health.ts` | Edge uptime, service status, database driver health |
| `POST /api/register` | `api/register.ts` | Participant registration with initial payment submission |
| `POST /api/lookup` | `api/lookup.ts` | Sanitized pass and status lookup (zero PII leakage) |
| `POST /api/balance-payment` | `api/balance-payment.ts` | Balance installment submission with overpayment guard |
| `POST /api/verify-pass` | `api/verify-pass.ts` | Backstage gatekeeper token verification |
| `GET /api/payment-info` | `api/payment-info.ts` | Dynamic UPI ID, payee name, and payment QR code |
| `ALL /api/admin/*` | `api/admin/[action].ts` | Consolidated router: `login`, `auth`, `stats`, `participants`, `verify-payment`, `export`, `upload-qr` |
| `ALL /api/storage/*` | `api/storage/[action].ts` | Consolidated router: `presigned-upload`, `view-proof` |

---

## 4. Multi-Event Tenancy Architecture

Every registration and payment record is strictly bound to an `event_id`.
The default production event is:
- **Event ID**: `EVT-CHX-2026`
- **Title**: `Runway Show 2026 — Chennai City Center`
- **Location**: `Chennai (City Center)`

### Lifecycle State Machine:
```
[DRAFT] --> [ACTIVE] --> [REGISTRATION_CLOSED] --> [COMPLETED] --> [ARCHIVED]
                             |
                             v
                        [TRASHED] (Soft delete, 30-day retention)
                             |
                             v
                    [DELETION_PENDING] (Requires Owner MFA)
                             |
                             v
                   [PERMANENTLY_DELETED]
```

---

## 5. Security & Isolation Controls

1. **Dual Driver Persistence**:
   - Primary: MongoDB Atlas with connection caching across serverless invocations.
   - Secondary: Supabase fallback activated automatically if `MONGODB_URI` is unconfigured.
2. **Zero Insecure Communications**: All connections enforce TLS 1.3 / HTTPS.
3. **Short-Lived Credentials**: Admin session tokens expire in 24 hours. Pre-signed upload URLs expire in 5 minutes. Proof preview links expire in 15 minutes.
