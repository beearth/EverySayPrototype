// scripts/genVideos.mjs
import fs from "fs";

const dir = "./public/videos";
const ex = /\.(mp4|webm)$/i;

// 실제 파일만 읽어서 정렬
const files = fs
  .readdirSync(dir)
  .filter((f) => ex.test(f))
  .sort();

// 항목 생성
const items = files.map((f, i) => ({
  id: `v${String(i + 1).padStart(2, "0")}`,
  title: `SPACE STACK Demo ${String(i + 1).padStart(2, "0")}`,
  tag: i < 6 ? "Prototype" : "Demo",
  src: `/videos/${f}`,
}));

// src/lib/videos.js 덮어쓰기
const out = `// auto-generated from public/videos\nexport const videos = ${JSON.stringify(
  items,
  null,
  2
)};\n`;
fs.writeFileSync("src/lib/videos.js", out, "utf8");

console.log(`✅ Wrote ${items.length} entries to src/lib/videos.js`);
