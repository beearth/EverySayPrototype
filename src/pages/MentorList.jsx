// src/pages/MentorList.jsx
import { useMemo, useState, useEffect } from "react";
import { videos } from "../lib/videos";
import CheerModal from "../components/CheerModal";
import VideoGalleryModal from "../components/VideoGalleryModal";
import PositiveChoiceModal from "../components/PositiveChoiceModal";
import WordStudyModal from "../components/WordStudyModal";
import LanguageSelector from "../components/LanguageSelector";
import MyStackFeed, {
  addToStack,
  getTotalCount,
  getAllStackItems,
} from "../components/MyStackFeed";
import { supa } from "../lib/supa";
import MyStackPoints from "../components/MyStackPoints";

/* ───── 텍스트 한방 교체용 상수 ───── */
const TITLE = "SPACE STACK Cheer Hub"; // ← 여기서 바꾸면 헤더 제목 변경
const SEARCH_PH = "Search events";
const CATEGORIES = [
  "Fandom",
  "Health",
  "Education",
  "Local",
  "Sports",
  "Non-profit",
  "Children",
  "Emerging Creators",
];

const DEMO_MIN_WORLDSTACK = 100;
const DEMO_BASELINE_OFFSET = 97; // adds +97 when actual < 100 so 3 actual -> 100, 4 -> 101

function withDemoFill(items, fillerCount) {
  if (!Array.isArray(items) || fillerCount <= 0) return Array.isArray(items) ? items : [];
  const filled = [...items];
  const baseTime = filled.length
    ? new Date(filled[filled.length - 1]?.createdAt || Date.now()).getTime()
    : Date.now();

  for (let i = 0; i < fillerCount; i += 1) {
    const createdAt = new Date(baseTime - (i + 1) * 1000).toISOString();
    filled.push({
      id: `demo-filler-${createdAt}-${i}`,
      title: "SPACE STACK Demo Recording",
      createdAt,
      preset: "demo",
      duration: 5,
      isDemo: true,
    });
  }

  return filled.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/* ─────────────────────────────────────────
   Filter out non-existing files (404) for the video modal
   ───────────────────────────────────────── */
async function filterExisting(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const tested = await Promise.all(
    list.map(async (v) => {
      if (!v?.src) return null;
      try {
        const res = await fetch(v.src, { method: "HEAD" });

        if (res.status === 404) {
          return null;
        }

        // Some hosts (including Vercel static) can reply 405 for HEAD,
        // or other non-OK codes even though GET would succeed.
        // In that case, trust the file exists and keep the entry.
        return res.ok ? v : v;
      } catch {
        // Network errors (local dev offline) → keep the item so UX degrades gracefully.
        return v;
      }
    })
  );

  return tested.filter(Boolean);
}

export default function MentorList({ guestId }) {
  /* Video modal */
  const [openVideo, setOpenVideo] = useState(false);
  const [videoItems, setVideoItems] = useState([]);

  /* Cheer modal */
  const [cheerOpen, setCheerOpen] = useState(false);
  const [cheerItem, setCheerItem] = useState(null);
  const [positiveChoiceOpen, setPositiveChoiceOpen] = useState(false);
  const [wordStudyOpen, setWordStudyOpen] = useState(false);

  /* Stack refresh trigger */
  const [stackRefresh, setStackRefresh] = useState(0);

  /* Total voice count */
  const [totalCount, setTotalCount] = useState(0);
  const [stackItems, setStackItems] = useState([]);
  const [session, setSession] = useState(null);

  /* Who to Cheer – use first 12 videos directly */
  const cheerCards = useMemo(() => {
    return videos.map((v, i) => ({
      id: `c-${v.id}`,
      title: v.title, // e.g., EVERYSAY Demo 01
      subtitle: i % 2 === 0 ? "Community support" : "Global fandom support",
      video: v.src,
      image: v.image, // if you ever add thumbnails in videos.js
      cheer: "Add your voice. One word can lift a million hearts.",
    }));
  }, []);

  const handleOpenVideos = async () => {
    const ok = await filterExisting(videos);
    setVideoItems(ok);
    setOpenVideo(true);
  };

  // Load data function
  const loadData = async () => {
    let localItems = [];
    let localCount = 0;

    try {
      const items = await getAllStackItems();
      if (Array.isArray(items)) {
        localItems = items;
      }
    } catch (err) {
      console.warn("[Load] Local stack unavailable:", err);
    }

    // Count only local-only items (items without cloudPath)
    // Items with cloudPath are already counted in Supabase
    try {
      const localOnlyItems = localItems.filter(item => !item.cloudPath);
      localCount = localOnlyItems.length;
      console.log("[Load] Local-only items count:", localCount, "Total local items:", localItems.length);
    } catch (err) {
      console.warn("[Load] Local count calculation error:", err);
      // Fallback to getTotalCount if filtering fails
      try {
        const count = await getTotalCount();
        if (typeof count === "number" && !Number.isNaN(count)) {
          localCount = count;
        }
      } catch (err2) {
        console.warn("[Load] Local count unavailable:", err2);
      }
    }

    const sortedLocal = [...localItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    try {
      // Fetch from Supabase for realtime data
      const { data: cloudData, error } = await supa
        .from("recordings")
        .select("*")
        .order("created_at", { ascending: false });

      // Get total count from Supabase (all recordings, not just 35)
      const { count: totalCloudCount, error: countError } = await supa
        .from("recordings")
        .select("*", { count: "exact", head: true });

      if (!error && cloudData) {
        // Merge cloud data with local data
        const cloudItems = cloudData.map((item) => ({
          id: `cloud-${item.id}`,
          title: item.script || "Recording",
          createdAt: item.created_at,
          preset: item.preset,
          duration: item.duration || 0,
          cloudPath: item.storage_path,
          cloudUrl: item.public_url,
        }));

        // Combine and deduplicate (prefer cloud data)
        const combined = [...cloudItems, ...sortedLocal];
        const unique = combined.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                (item.cloudPath && t.cloudPath === item.cloudPath) ||
                item.id === t.id
            )
        );

        const finalSorted = unique.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        let actualTotal =
          !countError && typeof totalCloudCount === "number"
            ? totalCloudCount
            : cloudItems.length;

        if (!Number.isFinite(actualTotal) || actualTotal < 0) {
          actualTotal = cloudItems.length;
        }

        // Add local count to the total
        actualTotal = actualTotal + localCount;
        console.log("[Load] Local count:", localCount, "Cloud count:", totalCloudCount, "Total:", actualTotal);

        let targetCount;
        let fillerCount = 0;

        // Always apply the offset to avoid a sudden drop when crossing the threshold
        targetCount = Math.max(
          DEMO_MIN_WORLDSTACK,
          actualTotal + DEMO_BASELINE_OFFSET
        );
        fillerCount = Math.max(0, targetCount - finalSorted.length);

        const demoFilled =
          fillerCount > 0 ? withDemoFill(finalSorted, fillerCount) : finalSorted;

        setStackItems(demoFilled);
        setTotalCount(targetCount);
        return;
      }

      // If Supabase returned an error or empty data, fall back
      const actualFallback = localCount;
      let targetFallback;
      let fillerFallback = 0;

      targetFallback = Math.max(
        DEMO_MIN_WORLDSTACK,
        actualFallback + DEMO_BASELINE_OFFSET
      );
      fillerFallback = Math.max(0, targetFallback - sortedLocal.length);
      console.log("[Load] Fallback - Local count:", localCount, "Target:", targetFallback);

      const demoFilledFallback =
        fillerFallback > 0 ? withDemoFill(sortedLocal, fillerFallback) : sortedLocal;

      setStackItems(demoFilledFallback);
      setTotalCount(targetFallback);
    } catch (error) {
      console.error("[Load] Cloud fetch error:", error);
      const actualFallback = localCount;
      let targetFallback;
      let fillerFallback = 0;

      targetFallback = Math.max(
        DEMO_MIN_WORLDSTACK,
        actualFallback + DEMO_BASELINE_OFFSET
      );
      fillerFallback = Math.max(0, targetFallback - sortedLocal.length);
      console.log("[Load] Error fallback - Local count:", localCount, "Target:", targetFallback);

      const demoFilledFallback =
        fillerFallback > 0 ? withDemoFill(sortedLocal, fillerFallback) : sortedLocal;

      setStackItems(demoFilledFallback);
      setTotalCount(targetFallback);
    }
  };

  useEffect(() => {
    loadData();
  }, [stackRefresh, session]);

  // Initial load
  useEffect(() => {
    loadData();

    // Set up Realtime subscription
    const channel = supa
      .channel("recordings-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "recordings",
        },
        (payload) => {
          console.log("[Realtime] New recording:", payload.new);
          // Refresh data when new recording is added
          loadData();
        }
      )
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function ensureSession() {
      try {
        const { data, error } = await supa.auth.getSession();
        if (error) throw error;

        let currentSession = data.session ?? null;

        // Attempt lightweight anonymous sign-in only when explicitly enabled
        // via environment variable VITE_ENABLE_ANON_SIGNIN=true
        const enableAnon = String(import.meta.env.VITE_ENABLE_ANON_SIGNIN || "").toLowerCase() === "true";
        if (!currentSession && enableAnon && typeof supa.auth.signInAnonymously === "function") {
          const { data: anonData, error: anonError } = await supa.auth.signInAnonymously();
          if (anonError) {
            console.warn("[Auth] Anonymous sign-in failed:", anonError);
          } else {
            currentSession = anonData.session ?? null;
          }
        }

        if (isActive) {
          setSession(currentSession);
        }
      } catch (err) {
        console.warn("[Auth] Session init error:", err);
      }
    }

    ensureSession();

    const { data: authListener } = supa.auth.onAuthStateChange((_event, newSession) => {
      if (isActive) {
        setSession(newSession);
      }
    });

    return () => {
      isActive = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        {/* HERO */}
        <header className="mb-6">
          {/* WorldStack - Total Voice Count with Visual Tower */}
          <div className="mb-6 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6">
            <div className="flex items-center justify-between gap-6">
              {/* Left: 3D Tower Visualization */}
              <div className="flex-1 flex items-end justify-center gap-2 h-56 min-h-[224px] relative">
                {stackItems.length === 0 ? (
                  <div className="text-sm text-neutral-500 italic absolute bottom-0">
                    Start building the tower...
                  </div>
                ) : (
                  <>
                    {/* 3D Stacked Blocks with Scripts */}
                    <div
                      className="flex flex-col-reverse items-center gap-1"
                      style={{ perspective: "1000px" }}
                    >
                      {stackItems.map((item, i) => {
                        // Pyramid shape: bottom (i=0) is largest, top (i=max) is smallest
                        // i increases from bottom to top, so we use i directly for level
                        const level = Math.floor(i / 5);
                        const height = 32 + level * 4; // Keep height reasonable
                        // Pyramid: wider at bottom (i=0), narrower at top - make much wider for text
                        const baseWidth = 200; // Much wider for full text display
                        const width = baseWidth - level * 8; // Gradual narrowing
                        const depth = 18 - level * 0.5; // Slightly reduced depth
                        const delay = i * 0.015;
                        const colorSets = [
                          {
                            from: "rgb(236, 72, 153)",
                            via: "rgb(219, 39, 119)",
                            to: "rgb(190, 24, 93)",
                          },
                          {
                            from: "rgb(168, 85, 247)",
                            via: "rgb(147, 51, 234)",
                            to: "rgb(126, 34, 206)",
                          },
                          {
                            from: "rgb(59, 130, 246)",
                            via: "rgb(37, 99, 235)",
                            to: "rgb(29, 78, 216)",
                          },
                          {
                            from: "rgb(99, 102, 241)",
                            via: "rgb(79, 70, 229)",
                            to: "rgb(67, 56, 202)",
                          },
                          {
                            from: "rgb(244, 63, 94)",
                            via: "rgb(225, 29, 72)",
                            to: "rgb(190, 18, 60)",
                          },
                          {
                            from: "rgb(139, 92, 246)",
                            via: "rgb(124, 58, 237)",
                            to: "rgb(109, 40, 217)",
                          },
                          {
                            from: "rgb(217, 70, 239)",
                            via: "rgb(192, 38, 211)",
                            to: "rgb(162, 28, 175)",
                          },
                        ];
                        const colorSet = colorSets[i % colorSets.length];
                        const isNew = i === 0 && stackItems.length > 0;
                        const shadowIntensity = Math.max(0.3, 1 - i * 0.02);
                        const script = item.title || "Recording";
                        const fontSize = Math.max(14, 20 - level * 1.5); // 3x: 8*1.75, 12*1.67

                        return (
                          <div
                            key={`block-${item.id || i}-${totalCount}`}
                            className="tower-block relative"
                            style={{
                              width: `${width}px`,
                              height: `${height}px`,
                              animation: isNew
                                ? "stackUp 0.6s ease-out, float 2s ease-in-out infinite 0.6s"
                                : "stackUp 0.5s ease-out",
                              animationDelay: `${delay}s`,
                              animationFillMode: "both",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            {/* Front Face with Script Text */}
                            <div
                              className={`absolute inset-0 rounded-t-lg shadow-xl border border-white/10 flex items-center justify-center ${isNew
                                ? "ring-2 ring-pink-300 ring-offset-2"
                                : ""
                                }`}
                              style={{
                                background: `linear-gradient(to bottom, ${colorSet.from}, ${colorSet.via}, ${colorSet.to})`,
                                transform: `translateZ(${depth / 2}px)`,
                                boxShadow: `0 ${depth}px ${depth * 2
                                  }px rgba(0,0,0,${shadowIntensity})`,
                              }}
                            >
                              {/* Script Text */}
                              <div
                                className="text-white font-semibold text-center px-3 leading-tight"
                                style={{
                                  fontSize: `${fontSize}px`,
                                  textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={script}
                              >
                                {script.length > 40
                                  ? script.substring(0, 40) + "..."
                                  : script}
                              </div>
                            </div>

                            {/* Top Face - removed for cleaner look */}
                            {/* Side Faces - removed to eliminate ghosting effect */}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Count Display */}
              <div className="flex-1 text-center space-y-4">
                <div>
                  <div className="text-2xl text-neutral-400 mb-2 font-medium">
                    WorldStack
                  </div>
                  <div className="text-6xl font-bold text-pink-500 mb-1">
                    {totalCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Voices building together
                  </div>
                </div>

                <MyStackPoints session={session} refreshKey={stackRefresh} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{TITLE}</h1>
            <div className="flex gap-2 items-center">
              <LanguageSelector />
              <button
                onClick={() => setWordStudyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
              >
                📚 Word Study
              </button>
              <button
                onClick={() => setPositiveChoiceOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
              >
                ✨ Positive Choice
              </button>
              <button
                onClick={handleOpenVideos}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
              >
                🎬 Watch Videos
              </button>
            </div>
          </div>

          {/* search + quick categories (UI only) */}
          <div className="mt-4">
            <input
              placeholder={SEARCH_PH}
              className="w-full p-3 rounded-xl border border-border bg-background"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {CATEGORIES.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border border-border hover:bg-muted cursor-pointer"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Mentors placeholder grid (your existing cards here) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* <MentorCard .../> */}
        </section>

        {/* WHO TO CHEER – fixed 12 cards */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Who to Cheer</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {cheerCards.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border overflow-hidden bg-background"
              >
                {/* Media (video preferred, image fallback) */}
                <div className="aspect-[5/4] bg-neutral-900 overflow-hidden">
                  {c.video ? (
                    <video
                      key={c.video}
                      src={c.video}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : c.image ? (
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-neutral-500 text-xs">
                      No media
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                    {c.title}
                  </h3>
                  {c.subtitle && (
                    <p className="text-[11px] text-neutral-500">{c.subtitle}</p>
                  )}
                  {c.cheer && (
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                      {c.cheer}
                    </p>
                  )}

                  <div className="mt-2 flex items-center">
                    <button
                      onClick={() => {
                        setCheerItem(c);
                        setCheerOpen(true);
                      }}
                      className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-[12px] font-medium text-white"
                    >
                      💗 Cheer Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Local stack feed */}
      <MyStackFeed refreshTrigger={stackRefresh} />

      {/* Modals */}
      <CheerModal
        open={cheerOpen}
        onClose={() => setCheerOpen(false)}
        item={cheerItem}
        session={session}
        guestId={guestId}
        onStack={async (file, metadata) => {
          try {
            await addToStack(file, metadata);
            console.log("[Stack] Saved to IndexedDB:", metadata);
            setStackRefresh((prev) => prev + 1); // Trigger refresh
          } catch (e) {
            console.error("[Stack] Failed to save:", e);
          }
        }}
      />
      <VideoGalleryModal
        open={openVideo}
        onClose={() => setOpenVideo(false)}
        items={videoItems} // only existing files
      />

      <PositiveChoiceModal
        open={positiveChoiceOpen}
        onClose={() => setPositiveChoiceOpen(false)}
        onStackComplete={() => {
          setStackRefresh((prev) => prev + 1);
        }}
      />

      <WordStudyModal
        open={wordStudyOpen}
        onClose={() => setWordStudyOpen(false)}
        onStackComplete={() => {
          setStackRefresh((prev) => prev + 1);
        }}
      />
    </div>
  );
}
