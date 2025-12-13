/* eslint-disable react-refresh/only-export-components */
// src/components/MyStackFeed.jsx
import { useEffect, useState } from "react";

const DB_NAME = "spacestack";
const STORE = "stack";
const STATS_STORE = "stats";

// IndexedDB helper
async function openDB() {
  return await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 3);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        db.createObjectStore(STATS_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("wordStudy")) {
        db.createObjectStore("wordStudy", { keyPath: "wordId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function getAll() {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function incrementTotalCount() {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STATS_STORE, "readwrite");
    const store = tx.objectStore(STATS_STORE);
    const req = store.get("totalCount");
    req.onsuccess = () => {
      const current = req.result?.value || 0;
      const updateReq = store.put({ key: "totalCount", value: current + 1 });
      updateReq.onsuccess = () => resolve(current + 1);
      updateReq.onerror = () => reject(updateReq.error);
    };
    req.onerror = () => reject(req.error);
  });
}

async function getTotalCount() {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STATS_STORE, "readonly");
    const req = tx.objectStore(STATS_STORE).get("totalCount");
    req.onsuccess = () => resolve(req.result?.value || 0);
    req.onerror = () => reject(req.error);
  });
}

async function add(file, metadata) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction([STORE, STATS_STORE], "readwrite");
    const blob = new Blob([file], { type: file.type });
    const item = {
      blob,
      createdAt: new Date().toISOString(),
      duration: metadata.duration || 0,
      tag: metadata.preset || "custom",
      title: metadata.script || "Recording",
      itemId: metadata.itemId || "",
      note: metadata.note || "",
      cloudPath: metadata.cloudPath || null,
      cloudUrl: metadata.cloudUrl || null,
    };
    const stackReq = tx.objectStore(STORE).add(item);

    // Increment total count ONLY if this is NOT a cloud-synced item
    // Cloud items are already counted in Supabase, so we don't double-count
    if (!metadata.cloudPath) {
      const statsStore = tx.objectStore(STATS_STORE);
      const countReq = statsStore.get("totalCount");
      countReq.onsuccess = () => {
        const current = countReq.result?.value || 0;
        statsStore.put({ key: "totalCount", value: current + 1 });
      };
    }

    stackReq.onsuccess = () => resolve(stackReq.result);
    stackReq.onerror = () => reject(stackReq.error);
  });
}

async function remove(id) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id).onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export { add as addToStack, getTotalCount, incrementTotalCount, getAll as getAllStackItems };

function fmt(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd} ${hh}:${mi}`;
}

export default function MyStackFeed({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const list = await getAll();
      // 최신 우선 + 최대 12개만
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(list.slice(0, 12));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshTrigger]);

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Stack (Local)</h2>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded-xl border hover:bg-muted text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No local items yet. Record → “Sent & Save” to see here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((it) => {
            const url = URL.createObjectURL(it.blob);
            return (
              <div
                key={it.id}
                className="rounded-xl border border-border p-3 bg-background"
              >
                <div className="text-xs text-neutral-500">
                  {fmt(it.createdAt)} • {it.duration ?? 0}s
                </div>
                <div className="mt-1 text-sm font-medium">
                  #{it.tag} — {it.title || it.itemId}
                </div>
                {it.note && (
                  <div className="text-sm text-neutral-400 mt-0.5">
                    {it.note}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <audio controls src={url} className="w-full" />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {it.cloudUrl ? (
                    <a
                      href={it.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Cloud
                    </a>
                  ) : (
                    <span className="text-[11px] px-2 py-1 rounded-lg border">
                      Local only
                    </span>
                  )}

                  <a
                    href={url}
                    download={`cheer-${it.id}.webm`}
                    className="text-xs px-2 py-1 rounded-lg border hover:bg-muted"
                  >
                    Download
                  </a>

                  <button
                    onClick={async () => {
                      await remove(it.id);
                      URL.revokeObjectURL(url);
                      load();
                    }}
                    className="ml-auto text-xs px-2 py-1 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
