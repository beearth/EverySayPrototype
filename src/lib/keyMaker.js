// src/lib/keyMaker.js
export function makeRecordingKey({ uid = "demo", room = "demo1", d = new Date() }) {
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const HH   = String(d.getHours()).padStart(2, "0");
  const MI   = String(d.getMinutes()).padStart(2, "0");
  const SS   = String(d.getSeconds()).padStart(2, "0");

  const dateFolder = `${yyyy}-${mm}-${dd}`;
  const filename   = `${yyyy}${mm}${dd}_${HH}${MI}${SS}_${uid}_${room}.webm`;

  return `users/${uid}/${room}/${dateFolder}/${filename}`;
}
