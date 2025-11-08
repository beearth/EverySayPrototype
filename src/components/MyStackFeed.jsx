// src/components/MyStackFeed.jsx
import { useEffect, useState } from "react";

const DB_NAME = "everysay";
const STORE = "stack";

// IndexedDB helper
async function openDB() {
  return await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
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
async function remove(id) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id).onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function fmt(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd} ${hh}:${mi}`;
}

export default function MyStackFeed() {
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
  }, []);

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
