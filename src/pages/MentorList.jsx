// src/pages/MentorList.jsx
import { useMemo, useState } from "react";
import { videos } from "../lib/videos";
import CheerModal from "../components/CheerModal";
import VideoGalleryModal from "../components/VideoGalleryModal";
import MyStackFeed from "../components/MyStackFeed";

/* ──────────────────────────────────────────────────────────
   Filter out non-existing files (404) for the video modal
   ────────────────────────────────────────────────────────── */
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

  /* Who to Cheer – use first 12 videos directly */
  const cheerCards = useMemo(() => {
    const list = videos.slice(0, 12);
    return list.map((v, i) => ({
      id: `c-${v.id}`,
      title: v.title, // e.g., EVERYSAY Demo 01
      subtitle: i % 2 === 0 ? "Community support" : "Global fandom support",
      video: v.src,
      image: v.image, // if you ever add thumbnails in videos.js
      cheer:
        "Add your voice. One word can lift a million hearts."
    }));
  }, []);

  const handleOpenVideos = async () => {
    const ok = await filterExisting(videos);
    setVideoItems(ok);
    setOpenVideo(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        {/* HERO */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mentor List</h1>
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
              placeholder="Search mentors, causes, or events"
              className="w-full p-3 rounded-xl border border-border bg-background"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[
                "Fandom",
                "Health",
                "Education",
                "Local",
                "Sports",
                "Non-profit",
                "Children",
                "Emerging Creators",
              ].map((t) => (
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
      <MyStackFeed />

      {/* Modals */}
      <CheerModal
        open={cheerOpen}
        onClose={() => setCheerOpen(false)}
        item={cheerItem}
      />
      <VideoGalleryModal
        open={openVideo}
        onClose={() => setOpenVideo(false)}
        items={videoItems} // only existing files
      />
    </div>
  );
}
