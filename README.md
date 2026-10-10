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

Autumn gift:

- Open `/autumn.html` on the development server, or `/Arina/autumn.html` in production.
- The invitation starts `audio/song.mp3` with a user gesture; the navigation button pauses/resumes it.
- Touch the crystal heart to reveal the letter. Three memories come from `album-data.json`.
- The page respects reduced motion and pauses the heart animation when it leaves the viewport.

Particle love gift:

- Open `/sparks.html` in development or `/Arina/sparks.html` in production.
- The invitation starts `audio/solamente-tu.mp3`; the music button pauses/resumes it.
- Original kiss outlines in `src/animations/kissPaths.js` guide the gathering particles. Replay restarts the animation; the letter opens separately.
- Reduced motion shows the completed line drawing and promise immediately.
