const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function run(script){
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: root,
    stdio: "inherit"
  });

  if(result.status !== 0){
    process.exit(result.status || 1);
  }
}

run("sync-album-data.js");
run("validate-album-data.js");
