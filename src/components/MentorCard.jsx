import { useMemo, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { videos } from "@/lib/videos";

/**
 * MentorCard – 업그레이드 최종본
 * - 썸네일/영상 미리보기 자동 처리 (mentor.videoUrl || mentor.videoId || mentor.thumbnail)
 * - 접근성/반응형/호버 상태 강화
 * - 액션 버튼 두 개: 응원(필수), 미리보기(옵션)
 *
 * mentor 스키마 예시:
 * {
 *   id: number|string,
 *   name: string,
 *   role?: string,
 *   company?: string,
 *   tag?: string,
 *   color?: string,         // e.g. "bg-pink-500"
 *   thumbnail?: string,     // 선택: 이미지 URL
 *   videoId?: string,       // 선택: "v01" ~ "v21" (videos.js와 매칭)
 *   videoUrl?: string,      // 선택: supabase 등 절대경로
 *   poster?: string         // 선택: <video poster> 이미지
 * }
 */
export default function MentorCard({ mentor, onAsk }) {
  // 1) 프리뷰 소스 결정 (videoUrl > videoId > thumbnail)
  const preview = useMemo(() => {
    if (mentor?.videoUrl) return { type: "video", src: mentor.videoUrl };
    if (mentor?.videoId) {
      const v = videos.find((x) => x.id === mentor.videoId);
      if (v?.src) return { type: "video", src: v.src };
    }
    if (mentor?.thumbnail) return { type: "image", src: mentor.thumbnail };
    return { type: "empty", src: "" };
  }, [mentor]);

  const [isLoaded, setLoaded] = useState(false);

  return (
    <div className="group rounded-xl border bg-card text-card-foreground p-4 shadow-sm transition hover:shadow-md">
      {/* 상단: 이름 + 태그 */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="line-clamp-1 text-lg font-semibold">{mentor.name}</h2>
        {mentor.tag ? (
          <span
            className={`shrink-0 rounded px-2 py-1 text-xs text-white ${mentor.color || "bg-pink-500"}`}
            title={mentor.tag}
          >
            {mentor.tag}
          </span>
        ) : null}
      </div>

      {/* 프리뷰: 비디오 > 이미지 > 빈상태 */}
      <div className="relative mb-3 overflow-hidden rounded-lg bg-muted">
        <div className="aspect-[9/16] w-full">
          {preview.type === "video" ? (
            <video
              src={preview.src}
              muted
              playsInline
              preload="metadata"
              poster={mentor.poster}
              onLoadedData={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-opacity ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : preview.type === "image" ? (
            <img
              src={preview.src}
              alt={`${mentor.name} preview`}
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-opacity ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs opacity-60">
              No preview
            </div>
          )}

          {/* 로딩 스켈레톤 */}
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-foreground/5" />
          )}
        </div>
      </div>

      {/* 중간: 아바타 + 정보 */}
      <div className="mb-3 flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarImage
            src={`https://i.pravatar.cc/80?u=${encodeURIComponent(
              String(mentor.id)
            )}`}
            alt="avatar"
          />
          <AvatarFallback>
            {mentor.name?.slice(0, 2) || "EV"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 leading-tight">
          {mentor.role ? (
            <p className="truncate text-sm text-muted-foreground">
              {mentor.role}
            </p>
          ) : null}
          {mentor.company ? (
            <p className="truncate text-xs text-muted-foreground">
              {mentor.company}
            </p>
          ) : null}
        </div>
      </div>

      {/* 하단: 액션 버튼들 */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          className="col-span-2 md:col-span-1"
          onClick={() => onAsk?.(mentor)}
        >
          응원하기
        </Button>

        {preview.type === "video" ? (
          <Button
            variant="secondary"
            className="col-span-2 md:col-span-1"
            onClick={() => window.open(preview.src, "_blank", "noopener")}
          >
            미리보기
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="col-span-2 md:col-span-1"
            disabled
          >
            미리보기
          </Button>
        )}
      </div>
    </div>
  );
}
