// src/lib/cheers.js
import { videos } from "./videos";

/**
 * Use the first 12 videos from public/videos
 * Each item becomes a "Who to Cheer" card with a short clip.
 */
export const cheers = videos.slice(0, 12).map((v, i) => ({
  id: `c-${v.id}`,
  title: v.title,             // e.g., EVERYSAY Demo 01
  subtitle: i % 2 === 0 ? "Community support" : "Global fandom support",
  video: v.src,               // <-- connect the actual video file
  // optional fallback image if you have: image: "/images/xxx.jpg",
  cheer: "Add your voice. One word can lift a million hearts."
}));
