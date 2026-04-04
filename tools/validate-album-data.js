const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const jsonPath = path.join(root, "album-data.json");

function fail(message){
  console.error(message);
  process.exitCode = 1;
}

function checkMedia(side, sideName, chapterId){
  if(!side) return;
  const hasSrc = typeof side.src === "string" && side.src.length > 0;
  const hasVideo = typeof side.video === "string" && side.video.length > 0;

  if(!hasSrc && !hasVideo){
    fail(`[${chapterId}] ${sideName}: missing both src and video`);
    return;
  }

  if(hasSrc){
    const filePath = path.join(root, side.src);
    if(!fs.existsSync(filePath)){
      fail(`[${chapterId}] ${sideName}: missing file ${side.src}`);
    }
  }

  if(hasVideo){
    const filePath = path.join(root, side.video);
    if(!fs.existsSync(filePath)){
      fail(`[${chapterId}] ${sideName}: missing file ${side.video}`);
    }
  }
}

let data;
try{
  data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}catch(err){
  fail(`Invalid JSON in ${path.basename(jsonPath)}: ${err.message}`);
  process.exit(process.exitCode || 1);
}

if(!Array.isArray(data.spreads)){
  fail("album-data.json: spreads must be an array");
  process.exit(process.exitCode || 1);
}

const ids = new Set();
for(const spread of data.spreads){
  const chapterId = spread?.id || "<missing-id>";

  if(typeof spread?.id !== "string" || !spread.id.trim()){
    fail("[unknown] missing id");
  }else if(ids.has(spread.id)){
    fail(`[${spread.id}] duplicate id`);
  }else{
    ids.add(spread.id);
  }

  if(typeof spread?.date !== "string" || !spread.date.trim()){
    fail(`[${chapterId}] missing date`);
  }

  if(typeof spread?.chapter !== "string" || !spread.chapter.trim()){
    fail(`[${chapterId}] missing chapter`);
  }

  if(typeof spread?.note !== "string" || !spread.note.trim()){
    fail(`[${chapterId}] missing note`);
  }

  checkMedia(spread.left, "left", chapterId);
  checkMedia(spread.right, "right", chapterId);
}

if(process.exitCode){
  process.exit(process.exitCode);
}

console.log(`Validated ${data.spreads.length} spreads in ${path.basename(jsonPath)}`);
