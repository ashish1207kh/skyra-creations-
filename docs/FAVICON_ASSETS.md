# SKYRA CREATIONS — Favicon & Browser Branding Suite Specification

## Overview

This document specifies the official browser icon and platform identity assets for **SKYRA CREATIONS**, generated and deployed under `public/`.

---

## 1. Brand Identity Specifications

- **Primary Colors**:
  - Charcoal Background: `#0b0d13` / `#181a20`
  - Metallic Silver Accent: `#ffffff` → `#c0c0c0` → `#808080`
  - Electric Red Accent: `#ff3b30` → `#d32f2f` (Signature lightning bolt)
- **Shape Language**: Concentric luxury circle with inner dashed technical bezel, stylized editorial 'S', and lightning mark.

---

## 2. Asset Manifest & Specifications

| Asset Path | Format | Dimensions | Purpose |
| :--- | :--- | :--- | :--- |
| `public/favicon.ico` | ICO (Binary) | 16x16, 32x32, 48x48 | Legacy browser tabs, Windows taskbar shortcuts, bookmarks |
| `public/favicon.svg` | SVG (Vector) | Scalable (100x100) | Modern desktop browsers (Chrome, Edge, Firefox, Safari) |
| `public/favicon-16x16.png` | PNG-32 | 16x16 px | Standard low-DPI browser tab icon |
| `public/favicon-32x32.png` | PNG-32 | 32x32 px | High-DPI (Retina) browser tab icon |
| `public/favicon-48x48.png` | PNG-32 | 48x48 px | Windows desktop and browser favorites |
| `public/apple-touch-icon.png` | PNG-32 | 180x180 px | iOS Home Screen, iPad Home Screen, Safari Reading List |
| `public/android-chrome-192x192.png`| PNG-32 | 192x192 px | Android home screen and PWA task switcher |
| `public/android-chrome-512x512.png`| PNG-32 | 512x512 px | PWA splash screens and app store installation preview |
| `public/site.webmanifest` | JSON | N/A | Progressive Web App manifest defining themes and icons |

---

## 3. HTML Integration

```html
<!-- Favicon & Touch Icon Suite -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

---

## 4. Web Manifest Structure (`site.webmanifest`)

```json
{
  "name": "SKYRA CREATIONS",
  "short_name": "SKYRA",
  "description": "Skyra Creations Runway Show & Model Registration Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0d13",
  "theme_color": "#0b0d13",
  "icons": [
    { "src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
    { "src": "/favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/favicon-48x48.png", "sizes": "48x48", "type": "image/png" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

---

## 5. Generator Script

The automated asset generation script is available at `scripts/generate-favicons.cjs` and uses the official high-resolution branding asset `public/logo.png`.
To regenerate:
```bash
node scripts/generate-favicons.cjs
```
