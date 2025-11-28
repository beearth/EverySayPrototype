// src/lib/cheers.js
import { videos } from "./videos";

/**
 * Use the full video library for the "Who to Cheer" cards.
 */
export const cheers = videos.map((v, i) => ({
  id: `c-${v.id}`,
  title: v.title,             // e.g., SPACE STACK Demo 01
  subtitle: i % 2 === 0 ? "Community support" : "Global fandom support",
  video: v.src,               // <-- connect the actual video file
  // optional fallback image if you have: image: "/images/xxx.jpg",
  cheer: "Add your voice. One word can lift a million hearts."
}));
