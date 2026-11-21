# SKYRA CREATIONS — Production Deployment Verification & SOP

## 1. Scope & Verification Status

- **Primary Custom Domain**: `https://skyracreations.site` (308 Redirect)
- **Canonical Website**: `https://www.skyracreations.site` (HTTP 200 OK — Active)
- **Vercel Direct URL**: `https://skyra-creations.vercel.app` (HTTP 200 OK — Active)
- **Instagram Handle**: `https://www.instagram.com/skyra_creations_/`

---

## 2. GoDaddy DNS Configuration

The GoDaddy DNS records must be configured exactly as follows:

| Record Type | Host / Name | Target / Data | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `216.198.79.1` | 1 Hour | Routes root domain to Vercel edge IP |
| **CNAME** | `www` | `8eaf91e5083b2b4f.vercel-dns-017.com` | 1 Hour | Routes www canonical domain to Vercel edge |
| **TXT** | `_vercel` | `vc-domain-verify=skyracreations.site,3b4c6a5e56beba6b4b0d` | 1 Hour | Verifies root domain ownership in Vercel |
| **TXT** | `_vercel` | `vc-domain-verify=www.skyracreations.site,83206a4ba1f1f6eb7e8a` | 1 Hour | Verifies www domain ownership in Vercel |

---

## 3. Resolving "Build Failed: > 12 Serverless Functions"

If Vercel previously showed an error:
> "No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan."

### Solution:
All serverless endpoints have been consolidated into dynamic routers:
- `api/admin/[action].ts` handles all 7 admin operations in 1 serverless function.
- `api/storage/[action].ts` handles storage upload and viewing operations in 1 serverless function.
- Total functions: 8 (compliant with the 12-function limit).

### How to Trigger in Vercel:
1. In Vercel Dashboard, open your project.
2. Click **Deployments**.
3. Click the three dots `...` next to the latest commit or open the deployment details and click the **Redeploy** button at the top right.

---

## 4. Resolving GoDaddy Airo Placeholder Cache

If opening `skyracreations.site` in a browser still shows the default GoDaddy "Powered by GoDaddy Airo" landing page:
1. This is caused by local browser DNS cache from before the Vercel DNS propagated.
2. Open Chrome in **Incognito Mode** (`Ctrl + Shift + N`) or press `Ctrl + F5` to perform a hard refresh.
3. The browser will immediately load the full live site: `https://www.skyracreations.site`.
