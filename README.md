Arina gift site.

Useful local maintenance commands:

- `node tools/serve-local.js`
- `node tools/validate-album-data.js`
- `node tools/maintain-album-data.js`

Notes:

- `album-data.json` is the source of truth for book/album content.
- `album.html` and `book.html` now require `http/https` to load data, so use a local server for development.
- For normal production use over `http/https`, pages load `album-data.json`.
- For a local preview server with production-like loading, run `node tools/serve-local.js` and open `http://localhost:8000`.
node tools/serve-local.js