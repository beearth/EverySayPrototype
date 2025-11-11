// src/pages/MentorList.jsx
import { useMemo, useState, useEffect } from "react";
import { videos } from "../lib/videos";
import CheerModal from "../components/CheerModal";
import VideoGalleryModal from "../components/VideoGalleryModal";
import MyStackFeed, { addToStack, getTotalCount } from "../components/MyStackFeed";

/* ───── 텍스트 한방 교체용 상수 ───── */
const TITLE = "EVERYSAY Cheer Hub"; // ← 여기서 바꾸면 헤더 제목 변경
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

/* ─────────────────────────────────────────
   Filter out non-existing files (404) for the video modal
   ───────────────────────────────────────── */
async function filterExisting(list) {
  const tested = await Promise.all(
    list.map(async (v) => {
      try {
        const r = await fetch(v.src, { method: "HEAD" });
        return r.ok ? v : null;
      } catch {
        return null;
      }
    })
  );
  return tested.filter(Boolean);
}

export default function MentorList() {
  /* Video modal */
  const [openVideo, setOpenVideo] = useState(false);
  const [videoItems, setVideoItems] = useState([]);

  /* Cheer modal */
  const [cheerOpen, setCheerOpen] = useState(false);
  const [cheerItem, setCheerItem] = useState(null);
  
  /* Stack refresh trigger */
  const [stackRefresh, setStackRefresh] = useState(0);
  
  /* Total voice count */
  const [totalCount, setTotalCount] = useState(0);

  /* Who to Cheer – use first 12 videos directly */
  const cheerCards = useMemo(() => {
    const list = videos.slice(0, 12);
    return list.map((v, i) => ({
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

  useEffect(() => {
    getTotalCount().then(setTotalCount).catch(console.error);
  }, [stackRefresh]);

  // Initial load
  useEffect(() => {
    getTotalCount().then(setTotalCount).catch(console.error);
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
              <div className="flex-1 flex items-end justify-center gap-2 h-48 min-h-[192px] relative">
                {totalCount === 0 ? (
                  <div className="text-sm text-neutral-500 italic absolute bottom-0">Start building the tower...</div>
                ) : (
                  <>
                    {/* 3D Tower Base */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-3 bg-gradient-to-r from-pink-600/60 via-purple-600/60 to-pink-600/60 rounded-lg shadow-lg" 
                         style={{
                           transform: 'perspective(500px) rotateX(60deg)',
                           transformStyle: 'preserve-3d'
                         }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-700/40 to-transparent rounded-lg" 
                           style={{ transform: 'translateZ(-3px)' }}></div>
                    </div>
                    
                    {/* 3D Stacked Blocks */}
                    <div className="flex flex-col-reverse items-center gap-1" style={{ perspective: '1000px' }}>
                      {Array.from({ length: Math.min(totalCount, 35) }).map((_, i) => {
                        const level = Math.floor(i / 7);
                        const height = 22 + level * 4;
                        const width = 28 - level * 0.8;
                        const depth = 8;
                        const delay = i * 0.015;
                        const colorSets = [
                          { from: "rgb(236, 72, 153)", via: "rgb(219, 39, 119)", to: "rgb(190, 24, 93)" },
                          { from: "rgb(168, 85, 247)", via: "rgb(147, 51, 234)", to: "rgb(126, 34, 206)" },
                          { from: "rgb(59, 130, 246)", via: "rgb(37, 99, 235)", to: "rgb(29, 78, 216)" },
                          { from: "rgb(99, 102, 241)", via: "rgb(79, 70, 229)", to: "rgb(67, 56, 202)" },
                          { from: "rgb(244, 63, 94)", via: "rgb(225, 29, 72)", to: "rgb(190, 18, 60)" },
                          { from: "rgb(139, 92, 246)", via: "rgb(124, 58, 237)", to: "rgb(109, 40, 217)" },
                          { from: "rgb(217, 70, 239)", via: "rgb(192, 38, 211)", to: "rgb(162, 28, 175)" },
                        ];
                        const colorSet = colorSets[i % colorSets.length];
                        const isNew = i === totalCount - 1 && totalCount > 0;
                        const shadowIntensity = Math.max(0.3, 1 - (i * 0.02));
                        
                        return (
                          <div
                            key={`block-${i}-${totalCount}`}
                            className="tower-block relative"
                            style={{
                              width: `${width}px`,
                              height: `${height}px`,
                              animation: isNew ? "stackUp 0.6s ease-out, float 2s ease-in-out infinite 0.6s" : "stackUp 0.5s ease-out",
                              animationDelay: `${delay}s`,
                              animationFillMode: "both",
                              transformStyle: 'preserve-3d',
                            }}
                          >
                            {/* Front Face */}
                            <div 
                              className={`absolute inset-0 rounded-t-lg shadow-xl border border-white/10 ${
                                isNew ? "ring-2 ring-pink-300 ring-offset-2" : ""
                              }`}
                              style={{
                                background: `linear-gradient(to bottom, ${colorSet.from}, ${colorSet.via}, ${colorSet.to})`,
                                transform: `translateZ(${depth/2}px)`,
                                boxShadow: `0 ${depth}px ${depth*2}px rgba(0,0,0,${shadowIntensity})`,
                              }}
                            />
                            
                            {/* Top Face */}
                            <div 
                              className="absolute inset-x-0 top-0 rounded-t-lg opacity-80"
                              style={{
                                height: `${depth}px`,
                                background: `linear-gradient(to bottom, ${colorSet.from}, ${colorSet.via})`,
                                transform: `rotateX(-90deg) translateZ(${depth/2}px)`,
                                transformOrigin: 'top',
                              }}
                            />
                            
                            {/* Side Faces */}
                            <div 
                              className="absolute inset-y-0 right-0 opacity-70"
                              style={{
                                width: `${depth}px`,
                                background: `linear-gradient(to left, ${colorSet.via}, ${colorSet.to})`,
                                transform: `rotateY(90deg) translateZ(${width/2}px)`,
                                transformOrigin: 'right',
                              }}
                            />
                            <div 
                              className="absolute inset-y-0 left-0 opacity-70"
                              style={{
                                width: `${depth}px`,
                                background: `linear-gradient(to right, ${colorSet.via}, ${colorSet.to})`,
                                transform: `rotateY(-90deg) translateZ(${width/2}px)`,
                                transformOrigin: 'left',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    {totalCount > 35 && (
                      <div className="absolute top-0 right-0 text-xl font-bold text-pink-400 bg-pink-500/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-pink-500/30">
                        +{totalCount - 35}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Right: Count Display */}
              <div className="flex-1 text-center">
                <div className="text-2xl text-neutral-400 mb-2 font-medium">WorldStack</div>
                <div className="text-6xl font-bold text-pink-500 mb-1">
                  {totalCount.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500">
                  Voices building together
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{TITLE}</h1>
            <button
              onClick={handleOpenVideos}
              className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-sm"
            >
              🎬 Watch Videos
            </button>
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
                      className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-[12px] font-medium text-white"
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
    </div>
  );
}
