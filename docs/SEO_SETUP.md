# GOOGLE SEARCH CONSOLE & TECHNICAL SEO ONBOARDING GUIDE

**Website:** `https://skyracreations.site`  
**Preferred Canonical Domain:** `https://www.skyracreations.site`  
**Official Sitemap:** `https://www.skyracreations.site/sitemap.xml`  
**Robots Directives:** `https://www.skyracreations.site/robots.txt`

---

## 1. Overview & Setup Prerequisites

Google Search Console (GSC) is Google's official webmaster platform. It enables you to monitor your site's presence in Google Search results, request indexing for new pages, troubleshoot crawl issues, and track keyword impressions and click-through rates.

---

## 2. Step 1: Add Property to Google Search Console

1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Sign in with your primary company Google account (e.g. `admin@skyracreations.com` or your Google Workspace / Gmail account).
3. On the **Select property type** screen, choose **Domain** (Recommended):
   - Enter: `skyracreations.site`
   *(Using the Domain property verifies all subdomains including `www.skyracreations.site` and `skyracreations.site` across both `http://` and `https://` in a single unified dashboard).*
4. Click **Continue**.

---

## 3. Step 2: Verify Domain Ownership via GoDaddy DNS TXT Record

1. Google will display a modal with a unique **TXT record verification string**:
   ```
   google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Click the **Copy** button.

2. Open your [GoDaddy Domain Portfolio](https://dcc.godaddy.com/domains) > **`skyracreations.site`** > **DNS Records**.
3. Click **Add New Record**:
   - **Type:** `TXT`
   - **Name:** `@`
   - **Value:** Paste the copied string (e.g., `google-site-verification=...`)
   - **TTL:** `1/2 Hour` (or 1 Hour)
4. Click **Save**.
5. Return to Google Search Console and click **Verify**.
   - Google will immediately query your GoDaddy DNS and confirm ownership with a green success badge: *"Ownership verified"*.
   - Click **Go to Property**.

---

## 4. Step 3: Submit the XML Sitemap

Submitting your XML sitemap directs Googlebot to index your canonical public pages immediately:

1. In the left navigation menu of Google Search Console, click on **Indexing** > **Sitemaps**.
2. Under **Add a new sitemap**, type:
   ```
   sitemap.xml
   ```
   *(The full URL will be `https://www.skyracreations.site/sitemap.xml`).*
3. Click **Submit**.
4. Within a few moments, the Status column will show **Success**, indicating Google has discovered your 4 canonical routes (`/`, `/register`, `/balance`, `/status`).

---

## 5. Step 4: URL Inspection & Immediate Indexing Request

To accelerate Google's indexing of your main runway registration portal:

1. In the top search bar of Google Search Console (*"Inspect any URL in..."*), paste:
   ```
   https://www.skyracreations.site/
   ```
   Press **Enter**.
2. Google will run a real-time fetch test.
3. Click the **Test Live URL** button in the top right to verify that:
   - Page is fetchable: **Yes**
   - Robots.txt allows crawl: **Yes**
   - Canonical selected by Google matches user canonical: **`https://www.skyracreations.site/`**
4. Click **Request Indexing**.
5. Repeat for:
   - `https://www.skyracreations.site/register`
   - `https://www.skyracreations.site/balance`
   - `https://www.skyracreations.site/status`

---

## 6. Step 5: Monitoring Performance & Core Web Vitals

Once indexed, use the following GSC tabs weekly:

### A. Performance (Search Results)
- **Total Clicks:** How many people visited your website directly from Google Search.
- **Total Impressions:** How many times your runway show appeared in search results.
- **Average CTR (Click-Through Rate):** The percentage of searchers who clicked your listing.
- **Queries Table:** See the exact search terms people used (e.g. *"runway model registration in India"*, *"Skyra Creations fashion show"*).

### B. Pages (Indexation Health)
- Review **Why pages aren’t indexed** to ensure no unexpected 404s or redirect chains exist.
- Confirm that `/admin` and `/api/*` remain unindexed as expected.

### C. Rich Results / Enhancements
- Google will automatically detect your **Event** and **Organization** structured data (JSON-LD).
- Inspect the **Events** enhancement tab to confirm your Runway Show 2026 snippet appears with venue and dates in Google Event Search.

---

## 7. Ongoing Maintenance Checklist

- [ ] Check Search Console monthly for any coverage or crawl anomalies.
- [ ] Ensure `sitemap.xml` is updated whenever a new public event page is published.
- [ ] Monitor search queries to refine title and meta descriptions naturally.
- [ ] Keep the official Instagram profile (@skyra_creations_) active with consistent hashtags: `#SkyraCreations #RunwayShow2026 #ModelAuditionsIndia`.
