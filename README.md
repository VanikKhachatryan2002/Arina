Arina gift site.

Useful local maintenance commands:

- `node tools/sync-album-data.js`
- `node tools/validate-album-data.js`
- `node tools/maintain-album-data.js`

Notes:

- `album-data.json` is the source of truth for book/album content.
- `album-data.js` is generated for `file://` fallback and should not be edited manually.
- For local browser use without a server, `album.html` and `book.html` load `album-data.js` automatically through `album-shared.js`.
- For normal production use over `http/https`, pages load `album-data.json`.
