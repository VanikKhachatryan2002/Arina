const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".toml": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".yml": "text/yaml; charset=utf-8"
};

function send(res, status, body, headers = {}){
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  try{
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const requested = urlPath === "/" ? "/index.html" : urlPath;
    const filePath = path.normalize(path.join(root, requested));

    if(!filePath.startsWith(root)){
      return send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
    }

    fs.stat(filePath, (statErr, stats) => {
      if(statErr){
        return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      }

      const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
      fs.readFile(finalPath, (readErr, data) => {
        if(readErr){
          return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
        }

        const ext = path.extname(finalPath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";
        send(res, 200, data, { "Content-Type": contentType, "Cache-Control": "no-store" });
      });
    });
  }catch(err){
    send(res, 500, `Server error: ${err.message}`, { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
