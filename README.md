# QR_Asset_Tracker

The phone-facing half of a QR-code asset tracking system: a single web
page that turns any phone into a scanner for logging construction-site
assets as **Delivered** or **Installed**.

**Live page:** https://jack-entire.github.io/QR_Asset_Tracker/index.html

Open that on a phone (Chrome or Safari), allow camera access, set a
device name, pick DELIVERY or INSTALL, and scan asset labels. When done,
tap **Export CSV** - that file is what the desktop tracking app imports.

- No app to install, no account, no server - plain HTML/JS hosted on
  GitHub Pages.
- Works offline after the first load (cached by `sw.js`).
- The asset register (`trial_items.csv`) loads automatically from next to
  `index.html`; a different register can be loaded from the page itself.
- Scans stay on the phone until exported - nothing is uploaded anywhere.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole scanner app (UI + logic) |
| `jsQR.js` | QR decoding library ([jsQR](https://github.com/cozmo/jsQR), Apache-2.0) |
| `sw.js` | Service worker for offline use - bump `CACHE_VERSION` when changing `index.html` |
| `trial_items.csv` | The example asset register the page auto-loads |
| `DEPLOY.md` | Hosting options (GitHub Pages, local testing, other hosts) |

## Related

The desktop side - QR label printing, the tracking workbook, merging
exported scans, and highlighting progress onto PDF drawings - lives in a
separate private repo (`QR-Tracking-Private`). Its
`docs/SCANNING_SETUP_GUIDE.md` has the full step-by-step for people
doing the scanning.
