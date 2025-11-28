// src/components/VideoGalleryModal.jsx
import { useEffect } from "react";

export default function VideoGalleryModal({ open, onClose, items = [] }) {
  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-background border border-border shadow-2xl flex flex-col max-h-[90vh]">
          {/* header (fixed) */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h2 className="text-lg font-semibold">영상 보러가기</h2>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm border hover:bg-muted"
            >
              닫기
            </button>
          </div>

          {/* scrollable content */}
          <div className="p-4 overflow-auto grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((v) => (
                <div key={v.id} className="rounded-xl border border-border p-3 bg-background">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      key={v.src} // src가 바뀔 때 강제 리로드
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    >
                      {/* 브라우저가 코덱을 정확히 인식하도록 type 명시 */}
                      {v.src?.toLowerCase().endsWith(".mp4")  && (
                        <source src={v.src} type="video/mp4" />
                      )}
                      {v.src?.toLowerCase().endsWith(".webm") && (
                        <source src={v.src} type="video/webm" />
                      )}
                      {/* 최후 fallback */}
                      <source src={v.src} />
                    </video>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{v.title}</div>
                      {v.tag && (
                        <span className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full border">
                          {v.tag}
                        </span>
                      )}
                    </div>

                    <a
                      href={v.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded border hover:bg-muted"
                    >
                      새 탭
                    </a>
                  </div>
                </div>
              ))}

              {!items.length && (
                <div className="col-span-full text-sm text-muted-foreground">
                  동영상이 없습니다. <code>/public/videos</code>에 파일을 넣고{" "}
                  <code>src/lib/videos.js</code>를 확인하세요.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
