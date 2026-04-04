# Robot.md — assistant guide for this repo

## What this project is
A static “gift” website (mobile‑friendly) with 3 main pages:
- `index.html`: landing page with animations, music, and links into the album.
- `album.html` + `album.js`: “book”/album view (two-page spreads) with a soft password gate.
- `book.html` + `book.js`: flipbook view (PageFlip) built from the same album data.

Optional: a Cloudflare Worker (`_worker.js`) receives location telemetry from `geo-track.js` and appends JSONL records into `logs/.u7_loc.jsonl` in this GitHub repo.

## Key files (map)
- UI
  - `index.html`, `style.css`, `main.js`
  - `album.html`, `album.css`, `album.js`
  - `book.html`, `book.css`, `book.js`
- Content
  - `photos/` (images) and `audio/song.mp3`
  - `album-data.json` (source of truth; hosted HTTP(S) use)
  - `album-data.js` (generated file:// fallback: sets `window.__ALBUM_DATA__`)
- Location tracking
  - `geo-track.js` (browser collector)
  - `_worker.js` + `wrangler.toml` (Cloudflare Worker logger)
- Logs
  - `logs/.u7_loc.jsonl` (newline‑delimited JSON events)

## How to run locally
- Quick preview: open `index.html`.
  - Note: `album-data.json` is fetched only on `http(s)://`. If you open via `file://`, some pages may need `album-data.js`/inline data.
- Recommended: run a local static server so fetch() works:
  - Python: `python -m http.server 8000`
  - Node: `npx serve .`

## Updating content
- Music: put an MP3 at `audio/song.mp3`.
- Photos:
  - Add images under `photos/` / `photos/album/...`.
  - Update `album-data.json`.
  - Run `node tools/maintain-album-data.js` to regenerate `album-data.js` and validate paths.
- Album data shape (high level):
  - `cover`: `{ image, title, subtitle }`
  - `spreads[]`: `{ id, date, chapter, left, right, note }`
  - each side: `{ src | video, label, poster? }`

## Password / “soft gate”
`album.js` and `book.js` contain a “SOFT-GATE” section:
- It prompts up to 3 times.
- It validates by comparing `SHA-256(passphrase)` to a stored hex hash.
- Success is cached in `sessionStorage` under `book_ok_v2`.

To change the passphrase:
1. Compute SHA‑256 hex of the new passphrase.
2. Replace the `target = "..."` hash in `album.js` and `book.js`.

(Keep the rest of the gate logic intact unless you intentionally want to remove it.)

## Location tracking (optional)
### Browser side (`geo-track.js`)
- Tries `navigator.geolocation.getCurrentPosition()`.
- If it fails (or geolocation not supported), it still POSTs a `cf-geo` ping so the Worker can log approximate IP-based geo via Cloudflare `request.cf`.
- POSTs JSON to `window.__LOCATION_ENDPOINT`.
- Pages set the endpoint like:
  - `window.__LOCATION_ENDPOINT = "https://<your-worker>.workers.dev";`

To disable tracking:
- Remove the `geo-track.js` `<script>` tag from `index.html` / `album.html` / `book.html`, or
- Set `window.__LOCATION_ENDPOINT = ""` and don’t load the script.

### Server side (Cloudflare Worker: `_worker.js`)
Receives a POSTed JSON payload and appends a line to `logs/.u7_loc.jsonl` in GitHub.
It also records Cloudflare edge geo (approximate IP-based `request.cf` fields like city/region/country). VPN/proxy users may show the VPN/proxy location.

Worker environment variables:
- Required:
  - `GITHUB_TOKEN` (needs repo write permission to update `TARGET_PATH`)
- Optional:
  - `REPO` (default `VanikKhachatryan2002/Arina`)
  - `BRANCH` (default `main`)
  - `TARGET_PATH` (default `logs/.u7_loc.jsonl`)
  - `STORE_IP` (set to `true` to additionally log `CF-Connecting-IP`; default is off)
  - Email notifications (Brevo): `BREVO_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`

Deploy/update worker (typical Wrangler flow):
- `wrangler deploy`
- `wrangler secret put GITHUB_TOKEN`

Privacy note: if you keep telemetry enabled, ensure you have the user’s consent and you’re comfortable storing this data in the repo history.

## Editing rules for assistants
- Don't rename or move files referenced by HTML (`index.html`, `album.html`, `book.html`) unless you update all links.
- Keep `album-data.json` and `album-data.js` consistent.
- Avoid "auto-formatters" that may rewrite non-ASCII text/encoding unless you verify the rendered text still looks correct.
- Don't commit secrets (tokens, API keys) into the repo.
- When we introduce a new workflow/tooling option, propose new/updated rules for `Robot.md` and ask me to approve before writing them into the repo.
