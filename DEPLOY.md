# Getting the scan page onto a phone

The scan page needs the camera, and phone browsers only grant camera access
over **HTTPS** (or `localhost`) - never over a plain `http://192.168.x.x`
LAN address or a `file://` path. Three ways to get there, easiest first.

## Option A - Chrome flag (fastest, works today, no accounts needed)

Good for testing on your own phone before anything is "properly" hosted.

1. On your PC, in this folder (`QR Tracking/scan_page/`), run:
   ```
   python -m http.server 8080
   ```
2. Find your PC's LAN IP (`ipconfig`, look for IPv4 Address, e.g. `192.168.1.42`).
3. On the phone's Chrome, go to:
   `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   Enter `http://192.168.1.42:8080` in the box, set the flag to **Enabled**,
   relaunch Chrome.
4. Visit `http://192.168.1.42:8080/index.html` on the phone. Camera should
   now be allowed.

This only affects that one phone's Chrome, and only for that address - it's
not a real security downgrade for anything else.

## Option B - GitHub Pages (a real HTTPS URL, free, takes ~2 minutes)

This folder (`scan_page/`) is a self-contained static site - `index.html`,
`jsQR.js`, `sw.js`, `trial_items.csv` - nothing else needed, no build step,
no server code.

**Read this before you create the repo:** on a free GitHub account, Pages
only works from a **public** repo - a private repo's Pages site needs
GitHub Pro (or a Team/Enterprise org account). Public means the code *and*
`trial_items.csv` (tag IDs + descriptions, which name the project) are
visible to anyone with the link, and could be indexed by search engines if
discovered - nothing secret in there, but it's your call whether that's fine
for a trial. If not: GitHub Pro removes the restriction, or fall back to
Option A (Chrome flag) for a small group, or ask IT about an internal host.

1. Create a new **public** GitHub repo (or use an existing one you control) -
   or a private one if you're on GitHub Pro.
2. From this `scan_page/` folder:
   ```
   git init
   git add index.html jsQR.js sw.js trial_items.csv DEPLOY.md
   git commit -m "QR scan page"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. On GitHub: repo Settings -> Pages -> Source: "Deploy from a branch" ->
   Branch: `main`, folder: `/ (root)` -> Save.
4. GitHub gives you a URL like `https://<you>.github.io/<repo>/index.html` -
   that's HTTPS by default, so the camera works with no flags on any phone.
5. Every time you `git push` an updated `index.html` (or `trial_items.csv`,
   if the register changes), the live page updates in a minute or two.

Nothing here has been pushed anywhere - this is all local, waiting for you.

### Once it's live: make sharing it trivial

Send coworkers the URL any normal way (Teams/email/Slack), or - fitting,
given the whole system is QR-based - generate one QR code that encodes that
URL and put it on a slide or a printed sheet at the demo: everyone scans it
with their phone's own camera app, taps the notification, and the page opens
straight up (with the register already loaded automatically - see below). No
typing a URL, no flags, nothing to install. Tell Claude the live URL once
you have it and it can generate that QR code in a couple of minutes.

## Option C - your own hosting

If you've already got somewhere with HTTPS (a company site, Netlify, etc.),
just copy `index.html`, `jsQR.js`, `sw.js`, and `trial_items.csv` there as
static files. No server-side code, no database, no build step - it's plain
HTML/JS/CSS.

## After first load: works offline

Once the page has loaded once on a phone (over HTTPS or via Option A), the
service worker (`sw.js`) caches everything, so it keeps working with no
signal after that - reload the tab and it'll load from cache. If you change
`index.html` later, bump `CACHE_NAME` in `sw.js` (e.g. `v1` -> `v2`) so
returning phones pick up the new version instead of a stale cached one.
