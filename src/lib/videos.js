// src/lib/videos.js
const baseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";

const cleanedBase = baseUrl.endsWith("/")
  ? baseUrl.slice(0, -1)
  : baseUrl || "";

const BASE = `${cleanedBase}/videos`;

export const videos = Array.from({ length: 21 }, (_, i) => {
  const n = i + 1;
  return {
    id: `v${String(n).padStart(2, "0")}`,
    title: `EVERYSAY Demo ${n}`,
    tag: "Demo",
    src: `${BASE}/${n}.mp4`,
  };
});
