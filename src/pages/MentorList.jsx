// src/pages/MentorList.jsx
import { useMemo, useState, useEffect } from "react";
import { videos } from "../lib/videos";
import CheerModal from "../components/CheerModal";
import VideoGalleryModal from "../components/VideoGalleryModal";
import PositiveChoiceModal from "../components/PositiveChoiceModal";
import WordStudyModal from "../components/WordStudyModal";
import DrawingModal from "../components/DrawingModal";
import LanguageSelector from "../components/LanguageSelector";
import MyStackFeed, {
  addToStack,
  getTotalCount,
  getAllStackItems,
} from "../components/MyStackFeed";
import { supa } from "../lib/supa";
import MyStackPoints from "../components/MyStackPoints";

/* ───── 텍스트 한방 교체용 상수 ───── */
const TITLE = "Eternal Stack Cheer Hub"; // ← 여기서 바꾸면 헤더 제목 변경
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
      title: "Eternal Stack Demo Recording",
      createdAt,
      preset: "demo",
      duration: 5,
      isDemo: true,
    });
  }

  // Sort Ascending (Oldest first)
  return filled.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}


/* ─────────────────────────────────────────
   Filter out non-existing files (404) for the video modal
   ───────────────────────────────────────── */

export default function MentorList({ guestId }) {
  /* Video modal */
  const [openVideo, setOpenVideo] = useState(false);
  const [videoItems] = useState([]);

  /* Cheer modal */
  const [cheerOpen, setCheerOpen] = useState(false);
  const [cheerItem, setCheerItem] = useState(null);
  const [positiveChoiceOpen, setPositiveChoiceOpen] = useState(false);
  const [wordStudyOpen, setWordStudyOpen] = useState(false);
  const [drawingOpen, setDrawingOpen] = useState(false);

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
      cheer: v.cheer || "Add your voice. One word can lift a million hearts.",
      cheerScript: v.cheerScript,
    }));
  }, []);



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
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
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
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
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
    <div className="w-full">
      {/* HERO */}
      <header className="mb-6">
        {/* WorldStack - Total Voice Count with Visual Tower */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-4 md:p-6 overflow-hidden relative shadow-2xl">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 z-10 relative">
            {/* Left: 3D Tower Visualization */}
            <div className="w-full md:flex-1 flex items-end justify-center gap-2 h-56 min-h-[224px] relative min-w-[220px] overflow-hidden">
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
                      // Pyramid shape logic:
                      // i is index in ascending array (0=Oldest, Last=Newest).
                      // We want Oldest at Bottom (Wide), Newest at Top (Narrow).
                      // So 'level' should increase with i.
                      const level = Math.floor(i / 5);
                      const height = 32 + level * 4;
                      const baseWidth = 200;
                      // Ensure width doesn't invert
                      const width = Math.max(40, baseWidth - level * 8);
                      const depth = Math.max(4, 18 - level * 0.5);
                      const delay = i * 0.015;

                      const colorSets = [
                        // Neon Cyberpunk
                        { from: "#ec4899", via: "#d946ef", to: "#8b5cf6", shadow: "#d946ef" },
                        // Electric Blue
                        { from: "#3b82f6", via: "#6366f1", to: "#8b5cf6", shadow: "#6366f1" },
                        // Sunset Glow
                        { from: "#f43f5e", via: "#e11d48", to: "#9f1239", shadow: "#e11d48" },
                        // Golden Luxury
                        { from: "#f59e0b", via: "#d97706", to: "#b45309", shadow: "#d97706" },
                        // Teal Vapor
                        { from: "#2dd4bf", via: "#0d9488", to: "#115e59", shadow: "#0d9488" },
                      ];
                      const colorSet = colorSets[i % colorSets.length];

                      // Newest item is at the end of the array
                      const isNew = i === stackItems.length - 1;

                      // Shadow intensity logic
                      const shadowIntensity = Math.max(0.3, 1 - i * 0.02);
                      const script = item.title || "Recording";
                      const fontSize = Math.max(12, 20 - level * 1.5);

                      return (
                        <div
                          key={`block-${item.id}`}
                          className="tower-block relative transition-all duration-500"
                          style={{
                            width: `${width}px`,
                            height: `${height}px`,
                            animation: isNew
                              ? "stackUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"
                              : "none",
                            zIndex: stackItems.length - i,
                            transform: "translateZ(0)",
                          }}
                        >
                          {/* Front Face */}
                          <div
                            className={`absolute inset-0 rounded-xl border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 ${isNew ? "ring-4 ring-white/50 ring-offset-2 ring-offset-transparent" : ""}`}
                            style={{
                              background: `linear-gradient(135deg, ${colorSet.from}, ${colorSet.via}, ${colorSet.to})`,
                              boxShadow: `0 0 20px ${colorSet.shadow}80, inset 0 0 10px rgba(255,255,255,0.3)`,
                            }}
                          >
                            {/* Sheen Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-[sheen_4s_infinite_linear]" style={{ backgroundSize: "200% 100%" }}></div>

                            {/* Glass Reflection Top */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                            {/* Script Text */}
                            <div
                              className="text-white font-bold text-center px-2 leading-tight relative z-10"
                              style={{
                                fontSize: `${fontSize}px`,
                                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                letterSpacing: "0.5px",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontFamily: "'Outfit', sans-serif",
                              }}
                              title={script}
                            >
                              {script.length > 30 ? script.substring(0, 30) + ".." : script}
                            </div>
                          </div>
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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{TITLE}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setWordStudyOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
            >
              📚 Word Study
            </button>
            <button
              onClick={() => setDrawingOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
            >
              🎨 Drawing
            </button>
            <button
              onClick={() => setPositiveChoiceOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-sm"
            >
              ✨ Positive Choice
            </button>
            {/* Watch Videos button removed */}
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
                    src={`${c.video}#t=0.001`}
                    muted
                    playsInline
                    controls
                    preload="auto"
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

      <DrawingModal
        open={drawingOpen}
        onClose={() => setDrawingOpen(false)}
        onStackComplete={() => {
          setStackRefresh((prev) => prev + 1);
        }}
      />
    </div>
  );
}
