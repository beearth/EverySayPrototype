import { useCallback, useEffect, useState } from "react";
import { supa } from "../lib/supa";

export default function MyStackPoints({ guestId, refreshKey = 0 }) {
  const [points, setPoints] = useState(0);

  const loadPoints = useCallback(
    async (targetUserId) => {
      if (!targetUserId) {
        setPoints(0);
        return;
      }
      const { count, error } = await supa
        .from("recordings_meta")
        .select("id", { count: "exact" })
        .eq("user_id", targetUserId);
      if (!error) {
        setPoints(count ?? 0);
      }
    },
    []
  );

  useEffect(() => {
    loadPoints(guestId);
  }, [guestId, refreshKey, loadPoints]);

  useEffect(() => {
    if (!guestId) return;
    const channel = supa
      .channel(`recordings-meta-points-${guestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "recordings_meta",
          filter: `user_id=eq.${guestId}`,
        },
        () => loadPoints(guestId)
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "recordings_meta",
          filter: `user_id=eq.${guestId}`,
        },
        () => loadPoints(guestId)
      )
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, [guestId, loadPoints]);

  return (
    <div className="rounded-lg bg-pink-500/10 border border-pink-500/30 px-3 py-1.5 text-pink-200 text-sm">
      My Stack Points {points}
    </div>
  );
}
