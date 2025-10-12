# NES Checklist PWA – GitHub Bundle v37.2
Built: 2025-10-12T23:00:32.940051Z

This bundle adds:
- Medical Appointment modal (no alarm, opens device calendar via `.ics`)
- Save / Load (export/import all **localStorage** data)

## Quick Install
1. Upload **all files** in this folder to your GitHub Pages repo (root).
2. Edit your existing `index.html` and add this line **right before `</body>`**:
```html
<script src="plugin_nes_medical_save_load_v37_2.js"></script>
```
3. Commit & push. Hard refresh the app (Ctrl/Cmd + Shift + R). If installed as a PWA, close & re-open.

## What you’ll see
- New toolbar: **Save Data** / **Load Data** (top of the page).
- A **Medical Appt** button next to **“Client Medical Assesment Form”**.
  - Pick **Date/Time/Notes** → **Open in Calendar** (device default via `.ics`) or **Add to Calendar (.ics)** (download).
  - Appointments are saved per sheet in localStorage; you can delete them in the modal list.

## Example index (for testing)
If you want to test standalone, upload `index_example_with_plugin.html` and open it on GitHub Pages.
