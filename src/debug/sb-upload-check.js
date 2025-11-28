import { supa } from "../lib/supa";

export async function sbUploadCheck() {
  const b = new Blob(["test"], { type: "text/plain" });
  return await supa.storage.from("recordings").upload(
    `debug/${Date.now()}_${Math.random().toString(36).slice(2)}.txt`,
    b,
    { contentType: "text/plain", upsert: false }
  );
}

