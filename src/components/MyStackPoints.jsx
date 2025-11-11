import { useCallback, useEffect, useState } from "react";
import { supa } from "../lib/supa";

export default function MyStackPoints({ session, refreshKey = 0 }) {
  const [points, setPoints] = useState(0);
  const userId = session?.user?.id ?? null;

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
    loadPoints(userId);
  }, [userId, refreshKey, loadPoints]);

  useEffect(() => {
    if (!userId) return;
    const channel = supa
      .channel(`recordings-meta-points-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "recordings_meta",
          filter: `user_id=eq.${userId}`,
        },
        () => loadPoints(userId)
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "recordings_meta",
          filter: `user_id=eq.${userId}`,
        },
        () => loadPoints(userId)
      )
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, [userId, loadPoints]);

  return (
    <div className="rounded-lg bg-pink-500/10 border border-pink-500/30 px-3 py-1.5 text-pink-200 text-sm">
      My Stack Points {points}
    </div>
  );
}
