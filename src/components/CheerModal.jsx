// src/components/CheerModal.jsx
import { useEffect, useRef, useState } from "react";
import { supa } from "../lib/supa";

export default function CheerModal({ open, onClose, item }) {
  if (!open || !item) return null;

  const safeClose = () => { try { onClose?.(); } catch {} };
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") safeClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ─ Video preview state ─ */
  const [videoDur, setVideoDur] = useState(null);
  const videoRef = useRef(null);

  /* 🔊 Autoplay when modal opens (muted + playsInline + play()) */
  useEffect(() => {
    const v = videoRef.current;
    if (!open || !item?.video || !v) return;

    v.muted = true;        // required by autoplay policy
    v.playsInline = true;  // iOS Safari
    const tryPlay = () => v.play().catch(() => { /* ignore */ });

    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });

    return () => {
      // pause when modal closes / item changes
      try { v.pause(); } catch {}
    };
  }, [open, item?.video]);

  /* ─ Recorder state ─ */
  const [isRec, setIsRec] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [blob, setBlob] = useState(null);
  const [dur, setDur] = useState(0);
  const [tag, setTag] = useState("Support");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const rec = useRef(null);
  const chunks = useRef([]);
  const streamRef = useRef(null);
  const tim = useRef(null);

  /* ─ Timer for recorder ─ */
  const startTimer = () => {
    stopTimer();
    const t0 = Date.now();
    tim.current = setInterval(() => setDur(Math.floor((Date.now() - t0) / 1000)), 250);
  };
  const stopTimer = () => { if (tim.current) clearInterval(tim.current); tim.current = null; };

  /* ─ Recording control ─ */
  async function handleStart() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunks.current = [];
      const mr = new MediaRecorder(stream);
      rec.current = mr;

      mr.ondataavailable = (e) => { if (e?.data) chunks.current.push(e.data); };
      mr.onstop = () => {
        try {
          const b = new Blob(chunks.current, { type: "audio/webm" });
          setBlob(b);
          setAudioURL((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(b); });
        } catch (err) { console.error("Create blob failed:", err); }
        finally { chunks.current = []; }
      };

      mr.start();
      setIsRec(true);
      setDur(0);
      startTimer();
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone permission required or not supported.");
    }
  }

  function handleStop() {
    try {
      if (rec.current && rec.current.state !== "inactive") rec.current.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch (err) { console.error("Stop error:", err); }
    finally { setIsRec(false); stopTimer(); }
  }

  function handleClear() {
    try { if (audioURL) URL.revokeObjectURL(audioURL); } catch {}
    setAudioURL(""); setBlob(null); setDur(0); setNote("");
  }

  function handleDownload() {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cheer-${item?.id || "item"}-${Date.now()}.webm`;
    a.click();
  }

  /* ─ IndexedDB local save ─ */
  async function idbSave(entry) {
    const DB = "everysay";
    const STORE = "stack";
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE))
          d.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add(entry).onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ─ Supabase upload ─ */
  async function supaUpload({ blob, item, tag, note, dur }) {
    try {
      if (!supa?.storage?.from) throw new Error("Supabase client not configured.");
      const path = `users/demo/${item.id}/${Date.now()}.webm`;
      const res = await supa.storage.from("recordings").upload(path, blob, {
        contentType: "audio/webm",
        upsert: false,
        metadata: { tag, note, item: item.id, duration: dur },
      });
      if (res.error) throw res.error;
      const pub = supa.storage.from("recordings").getPublicUrl(path);
      return pub?.data?.publicUrl || null;
    } catch (err) {
      console.error("Cloud upload error:", err);
      throw new Error(`[Cloud error] ${err?.message || err}`);
    }
  }

  /* ─ Sent & Save ─ */
  async function handleSentAndSave() {
    if (!blob) { alert("Record first, then save."); return; }
    setSaving(true);
    let cloudUrl = null;
    try {
      try { cloudUrl = await supaUpload({ blob, item, tag, note, dur }); }
      catch (e) { alert(`${e.message}\n\nFalling back to local stack.`); }

      const createdAt = new Date().toISOString();
      await idbSave({ createdAt, tag, note, duration: dur, itemId: item.id, title: item.title, cloudUrl, blob });

      alert(cloudUrl ? "Stacked & Sent! (Cloud + Local)" : "Stacked locally. (Cloud unavailable)");
      safeClose();
    } catch (e) {
      alert(`Save failed: ${e.message || e}`); console.error("Save error:", e);
    } finally { setSaving(false); }
  }

  /* ─ helpers ─ */
  const mm = String(Math.floor(dur / 60)).padStart(2, "0");
  const ss = String(dur % 60).padStart(2, "0");
  const vmm = videoDur != null ? String(Math.floor(videoDur / 60)).padStart(2, "0") : null;
  const vss = videoDur != null ? String(Math.round(videoDur % 60)).padStart(2, "0") : null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/70" onClick={safeClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Send a Cheer</h2>
            <button onClick={safeClose} className="rounded-lg px-3 py-1.5 text-sm border hover:bg-muted">
              Close
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Media (video preferred, image fallback) */}
            <div className="relative aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden">
              {item?.video ? (
                <video
                  ref={videoRef}
                  key={item.video}
                  src={item.video}
                  autoPlay     // ← autoplay
                  muted        // ← policy
                  playsInline  // ← iOS
                  controls     // keep controls visible
                  preload="metadata"
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => setVideoDur(e.currentTarget.duration || 0)}
                />
              ) : item?.image ? (
                <img src={item.image} alt={item?.title || "cheer"} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full grid place-items-center text-neutral-500 text-sm">No media</div>
              )}

              {videoDur != null && item?.video && (
                <span className="absolute right-2 top-2 text-[11px] px-2 py-0.5 rounded-md bg-black/70 text-white">
                  {vmm}:{vss}
                </span>
              )}
            </div>

            {/* Copy */}
            <div>
              <div className="text-base font-semibold">{item?.title || "Cheer"}</div>
              {!!item?.subtitle && <div className="text-xs text-neutral-400">{item.subtitle}</div>}
              {!!item?.cheer && <div className="mt-2 text-sm text-neutral-300">{item.cheer}</div>}
            </div>

            {/* Recorder */}
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-400">Recorder</div>
                <div className="text-sm font-mono">{mm}:{ss}</div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!isRec ? (
                  <button onClick={handleStart} className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm">
                    🎙 Start
                  </button>
                ) : (
                  <button onClick={handleStop} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">
                    ⏹ Stop
                  </button>
                )}

                <button onClick={handleClear} disabled={!audioURL} className="px-3 py-1.5 rounded-xl border hover:bg-muted text-sm disabled:opacity-40">
                  Clear
                </button>
                <button onClick={handleDownload} disabled={!blob} className="px-3 py-1.5 rounded-xl border hover:bg-muted text-sm disabled:opacity-40">
                  Download
                </button>

                {audioURL && <audio controls src={audioURL} className="ml-auto w-full sm:w-auto" />}
              </div>

              {/* Options */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="text-sm">
                  <span className="block text-neutral-400 mb-1">Emotion Tag</span>
                  <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full rounded-xl border border-border bg-background p-2">
                    <option>Support</option><option>Love</option><option>Hope</option><option>Prayer</option><option>Encourage</option>
                  </select>
                </label>
                <label className="sm:col-span-2 text-sm">
                  <span className="block text-neutral-400 mb-1">Note (optional)</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-border bg-background p-2" placeholder="One line for your cheer…" />
                </label>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSentAndSave}
                disabled={!blob || saving}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-sm font-medium text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : "💗 Sent & Save"}
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              Prototype: “Sent & Save” tries cloud first, then stacks locally if cloud is unavailable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
