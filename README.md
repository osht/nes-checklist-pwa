# NES Manager Notes Checklist (PWA)

This is a ready-to-deploy bundle for GitHub Pages.

## Files
- `index.html` — optimized app (v5) with updated NES 40 Years logo (1000007845.jpg)
- `manifest.json` — PWA manifest
- `service-worker.js` — caches assets offline (includes 1000007845.jpg)
- `icons/icon-192.png`, `icons/icon-512.png` — PWA icons
- `1000007845.jpg` — header logo

## Deploy to GitHub Pages
1. Create a new repository (e.g., `nes-checklist`).
2. Upload **all files** in this folder to the repo root.
3. Commit and push.
4. In GitHub, go to **Settings → Pages**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (root) → **Save**
5. After it builds, visit the Pages URL shown (e.g., `https://<your-username>.github.io/nes-checklist/`).

## Android/iOS Install Tips
- Visit the site → Add to Home Screen for a full-screen app-like experience.

## Updating
- When you change any file, increment the `CACHE_NAME` in `service-worker.js` to bust old caches (e.g., `nes-checklist-v6`).
