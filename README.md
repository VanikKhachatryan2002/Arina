Arina gift site, built as a React multi-page application with Vite.

Development commands:

- `npm install`
- `npm run dev`
- `npm run check` validates album content and creates the production build.
- `npm run preview` serves the production build locally.

Architecture:

- `src/entries/` contains one React entry per public page.
- `src/templates/` preserves the existing DOM contract while animations are progressively migrated into React components and hooks.
- `src/app/PageRuntime.jsx` owns page lifecycle, styles, and compatibility initialization.
- Photos, audio, video, and album data are copied into `dist/` during builds.
- The Cloudflare Worker remains an independently deployed backend.
- GitHub Actions deploys only `dist/` to Pages, using the `/Arina/` base path.

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
