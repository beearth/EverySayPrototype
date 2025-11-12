// src/lib/videos.js
const BASE = "/videos";
export const videos = Array.from({ length: 21 }, (_, i) => {
  const n = i + 1;
  return {
    id: `v${String(n).padStart(2, "0")}`,
    title: `EVERYSAY Demo ${n}`,
    tag: "Demo",
    src: `${BASE}/${n}.mp4`,
  };
});
