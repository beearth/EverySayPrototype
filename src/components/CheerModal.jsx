import { useEffect, useMemo, useRef, useState } from "react";
import { supaMain } from "../lib/supa";

const GUIDE_TEXT = "When the light turns on, speak your cheer slowly.";
const PRESET_SCRIPTS = [
  { id: "cheer_up", text: "힘내요" },
  { id: "nice_sonny", text: "Nice one Sonny" },
  { id: "thanks_appreciate", text: "고마워 어프리쉬에이트" },
  { id: "brave", text: "브레이브" },
  { id: "okay", text: "괜찮아" },
  { id: "love_earth", text: "I love Earth" },
  { id: "love_you", text: "I love you" },
  { id: "hbd_000", text: "000 생일 축하 합니다" },
  { id: "safe", text: "Plz be safe" },
  { id: "donate", text: "기부할게요" },
  { id: "support_healing", text: "투병을 응원합니다" },
  { id: "hope", text: "Hope" },
  { id: "love_000", text: "I love 000" },
  { id: "hbd_en", text: "Happy Birthday 000" },
  { id: "kpop_stars", text: "I love BTS 블랙핑크 에스파 장원" },
  { id: "peace", text: "Peace" },
  { id: "amen", text: "000 아멘" },
  { id: "freedom_love_peace_hope", text: "Freedom, Love, Peace, Hope" },
  { id: "hamo_love_peace_with", text: "Hamo, Love, Peace, With" }, // "위스" -> "With" assumed context
  { id: "can_do_too", text: "I can do too" },
  { id: "love_baby", text: "I love you baby" },
];
const MAX_DURATION_SEC = 10;

export default function CheerModal({
  open,
  onClose,
  item,
  onSend,
  onStack,
  session,
  guestId,
}) {
  const [err, setErr] = useState("");
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [counting, setCounting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [dontShowConsent, setDontShowConsent] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const tickerRef = useRef(null);
  const countdownRef = useRef(null);

  const script = (selectedPreset?.text || item?.cheerScript || "").trim();
  const words = useMemo(() => script.split(/\s+/).filter(Boolean), [script]);
  const SPEED_MS = 420;

  function makeRecordingKey({ uid = "demo", room = "demo1", d = new Date() }) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MI = String(d.getMinutes()).padStart(2, "0");
    const SS = String(d.getSeconds()).padStart(2, "0");
    const MS = String(d.getMilliseconds()).padStart(3, "0");
    const rand = (crypto.randomUUID?.() || Math.random().toString(36).slice(2, 8));
    const dateFolder = `${yyyy}-${mm}-${dd}`;
    const filename = `${yyyy}${mm}${dd}_${HH}${MI}${SS}${MS}_${uid}_${room}_${rand}.webm`;
    return `${room}/${dateFolder}/${filename}`;
  }

  useEffect(() => {
    if (!open) return;
    resetAll();
    return () => cleanupMedia();
  }, [open]);

  function resetAll() {
    setErr("");
    setRecording(false);
    setBlobUrl("");
    setDuration(0);
    setWordIdx(0);
    // Auto-select script from item if available
    if (item?.cheerScript) {
      setSelectedPreset({ id: "auto", text: item.cheerScript });
    } else {
      setSelectedPreset(null);
    }
    setCountdown(0);
    setCounting(false);
    setDontShowConsent(false); // Reset checkbox when modal opens
    clearInterval(tickerRef.current);
    clearInterval(countdownRef.current);
  }

  function cleanupMedia() {
    try {
      clearInterval(tickerRef.current);
      clearInterval(countdownRef.current);
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch { }
    recorderRef.current = null;
    mediaStreamRef.current = null;
  }

  function startCountdown() {
    if (counting || recording || !selectedPreset) return;

    setCountdown(2);
    setCounting(true);

    let count = 2;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setCounting(false);
        setCountdown(0);
        startRecording();
      } else {
        setCountdown(count);
      }
    }, 500);
  }

  async function startRecording() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const rec = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = rec;
      chunksRef.current = [];
      setRecording(true);
      setWordIdx(0);
      startedAtRef.current = performance.now();

      rec.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setRecording(false);
      };

      tickerRef.current = setInterval(() => {
        const elapsed = performance.now() - startedAtRef.current;
        const elapsedSec = elapsed / 1000;

        setDuration(Math.floor(Math.min(elapsedSec, MAX_DURATION_SEC)));
        setWordIdx((i) => Math.min(words.length - 1, i + 1));

        if (elapsedSec >= MAX_DURATION_SEC) {
          clearInterval(tickerRef.current);
          setErr((prev) => prev || "Recording is limited to 10 seconds.");
          if (recorderRef.current?.state === "recording") {
            try {
              recorderRef.current.stop();
            } catch (err) {
              console.warn("[Recorder] stop failed:", err);
            }
          }
        }
      }, SPEED_MS);

      rec.start();
    } catch (e) {
      console.error(e);
      setErr("Microphone permission was denied or is unavailable.");
      cleanupMedia();
    }
  }

  function stopRecording() {
    try {
      clearInterval(tickerRef.current);
      recorderRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
  }

  function hasConsent() {
    try {
      const until = window.localStorage.getItem("spacestack_consent_until");
      if (!until) return false;
      const untilNum = Number(until);
      const hasIt = Number.isFinite(untilNum) && untilNum > Date.now();
      console.log("[Consent] hasConsent check:", { until, untilNum, now: Date.now(), hasIt });
      return hasIt;
    } catch (e) {
      console.error("[Consent] hasConsent error:", e);
      return false;
    }
  }

  function requestConsentOr(fn) {
    if (hasConsent()) {
      fn();
      return;
    }
    setConsentOpen(true);
  }

  async function handleSendAndStack(bypassConsent = false) {
    console.log("[Consent] handleSendAndStack called", {
      bypassConsent: bypassConsent,
      bypassConsentType: typeof bypassConsent,
      hasBlobUrl: !!blobUrl
    });

    // Show consent modal if not bypassed AND user hasn't consented yet
    if (bypassConsent !== true) {
      const hasConsentNow = hasConsent();
      console.log("[Consent] Checking consent - hasConsentNow:", hasConsentNow);
      if (!hasConsentNow) {
        console.log("[Consent] Opening consent modal (no consent found)");
        setDontShowConsent(false); // Reset checkbox when opening consent modal
        setConsentOpen(true);
        return;
      }
      console.log("[Consent] User has consent, proceeding with upload...");
    }

    // If we get here, consent was bypassed (user clicked "I Agree & Send")
    console.log("[Consent] Bypassed (bypassConsent === true), proceeding with upload...");

    if (!blobUrl) {
      setErr("Please record first.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(blobUrl);
      let blob = await res.blob();
      if (!blob || !blob.size) throw new Error("Empty audio (0 bytes).");
      if (!blob.type) blob = new Blob([blob], { type: "audio/webm" });

      const key = makeRecordingKey({ uid: guestId || "guest", room: "demo1" });
      console.log("[Upload] Starting upload to:", key);
      console.log("[Upload] File size:", blob.size, "bytes, Type:", blob.type);
      console.log("[Upload] Guest ID:", guestId || "guest");
      console.log("[Upload] Date folder will be:", new Date().toISOString().split('T')[0]);

      const { data, error } = await supaMain.storage
        .from("recordings")
        .upload(key, blob, { contentType: blob.type || "audio/webm", upsert: false });

      if (error) {
        console.error("[Upload] Supabase storage error:", error);
        console.error("[Upload] Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data || !data.path) {
        console.error("[Upload] No data returned from upload");
        throw new Error("Upload failed: No data returned");
      }

      console.log("[Upload] Success! Path:", data.path);
      console.log("[Upload] Full key:", key);

      const pub = supaMain.storage.from("recordings").getPublicUrl(data.path).data.publicUrl;

      // Save metadata to Supabase table for realtime sync
      // Auth user id (if logged in). Keep null for guests.
      const currentUserId = session?.user?.id ?? null;

      const { error: dbError } = await supaMain
        .from("recordings")
        .insert({
          storage_path: data.path,
          public_url: pub,
          script: script,
          preset: selectedPreset || null,
          duration: duration,
          created_at: new Date().toISOString(),
          user_id: currentUserId,
          guest_id: guestId || null,
        });

      if (dbError) {
        console.error("[DB] Failed to save metadata:", dbError);
        // Continue anyway - local storage still works
      }

      // Insert into recordings_meta (optional, continue even if fails)
      try {
        await supaMain.from("recordings_meta").insert({
          file_path: data.path,
          mime_type: blob.type || "audio/webm",
          size_bytes: blob.size ?? 0,
          preset: selectedPreset || null,
          duration_ms: (duration ?? 0) * 1000,
          user_id: currentUserId,
          guest_id: guestId || null,
        });
        console.log("[DB] recordings_meta saved successfully");
      } catch (metaError) {
        console.warn("[DB] Failed to save recordings_meta:", metaError);
        // Continue anyway - main recording is saved
      }

      // keep existing onStack, but include cloud info:
      await onStack?.(
        new File([blob], key.split("/").pop(), { type: blob.type }),
        {
          preset: selectedPreset?.id,
          script,
          duration,
          timestamp: Date.now(),
          type: "local-recording",
          cloudPath: data.path,
          cloudUrl: pub,
          userId: currentUserId,
        }
      );

      // 성공 메시지 표시
      console.log("[Upload] Complete! File saved to:", data.path);
      setErr(`✅ Recording saved! Path: ${data.path}`);

      // 2초 후 모달 닫기
      setTimeout(() => {
        cleanupMedia();
        onClose?.();
      }, 2000);

    } catch (e) {
      console.error("[Upload] Full error:", e);
      const msg = e?.message || e?.error?.message || JSON.stringify(e);
      setErr(`❌ Upload failed: ${msg}. Please check browser console for details.`);
      // Don't close modal on error so user can retry
    } finally {
      setSaving(false);
    }
  }

  function saveFile() {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `everysay-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {item?.title || "SPACE STACK Cheer"}
          </h3>
          <button
            onClick={() => {
              cleanupMedia();
              onClose?.();
            }}
            className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        {err && (
          <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${err.includes("saved") || err.includes("✅") || err.includes("Success")
            ? "border-green-500/30 bg-green-500/10 text-green-200"
            : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}>
            {err}
          </div>
        )}

        <div className="space-y-5">
          {/* 영상 미리보기 - 9:16 Shorts 형식 */}
          {item?.video && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center">
              <div className="w-full max-w-[400px] aspect-[9/16]">
                <video
                  ref={videoRef}
                  src={item.video}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Script Display (Shadowing Mode) */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 text-center shadow-inner">
              <p className="text-sm text-pink-300 font-medium mb-3 tracking-wide uppercase text-[11px]">
                Shadowing Script
              </p>
              <h4 className="text-2xl md:text-3xl font-bold text-white break-keep leading-tight tracking-tight">
                "{script}"
              </h4>
              <p className="mt-4 text-sm text-neutral-400">
                {GUIDE_TEXT}
              </p>
            </div>
          </div>

          {/* 녹음 상태 및 컨트롤 */}
          <div className="space-y-3">
            {recording ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                  <span className="text-neutral-300">
                    Recording... {duration}s
                  </span>
                </div>
                <Karaoke words={words} currentIndex={wordIdx} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={stopRecording}
                    className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
                  >
                    ⏹ Stop Recording
                  </button>
                  <button
                    onClick={() => {
                      cleanupMedia();
                      resetAll();
                    }}
                    className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : counting ? (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="text-6xl font-bold text-pink-500 animate-pulse">
                    {countdown}
                  </div>
                  <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/20" />
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={startCountdown}
                  disabled={!selectedPreset}
                  className={`rounded-xl px-4 py-2 w-full ${selectedPreset
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    }`}
                >
                  {selectedPreset ? "🎙 Start Recording" : "Select a script first"}
                </button>

                {blobUrl && (
                  <div className="space-y-3">
                    <audio controls src={blobUrl} className="w-full" />
                    <div className="flex flex-col gap-2">
                      {/* Send & Stack 버튼 */}
                      <button
                        onClick={handleSendAndStack}
                        disabled={saving}
                        className={`w-full rounded-xl px-4 py-2.5 font-medium ${saving
                          ? "bg-neutral-600 text-neutral-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          }`}
                      >
                        {saving ? "Saving..." : "🚀 Send & Stack"}
                      </button>

                      {/* 보조 액션 버튼들 */}
                      <div className="flex gap-2">
                        <button
                          onClick={saveFile}
                          className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          💾 Download
                        </button>
                        <button
                          onClick={() => {
                            resetAll();
                            setSelectedPreset(null);
                          }}
                          className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          🔄 Record Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Consent Modal (custom) */}
      {(() => {
        console.log("[Consent] Rendering check - consentOpen:", consentOpen);
        return consentOpen;
      })() && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl">
              <h4 className="text-lg font-semibold mb-2">Consent required</h4>
              <p className="text-sm text-neutral-300 mb-3">
                By sending, you agree that your voice may be used in the SPACE STACK prototype and can be stored up to 180 days.
              </p>
              <ul className="list-disc pl-5 text-[13px] text-neutral-400 space-y-1 mb-4">
                <li>
                  Terms of Use:{" "}
                  <a href="/terms.html" target="_blank" rel="noreferrer" className="text-pink-300 underline">
                    View terms
                  </a>
                </li>
                <li>
                  Retention Policy:{" "}
                  <a href="/retention.html" target="_blank" rel="noreferrer" className="text-pink-300 underline">
                    View policy
                  </a>
                </li>
              </ul>
              <label className="flex items-center gap-2 text-sm text-neutral-300 mb-4 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                  checked={dontShowConsent}
                  onChange={(e) => setDontShowConsent(e.target.checked)}
                />
                Don't show this consent dialog again for 30 days
              </label>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setConsentOpen(false);
                    setErr("Send cancelled.");
                  }}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    try {
                      if (dontShowConsent) {
                        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                        const until = Date.now() + THIRTY_DAYS;
                        window.localStorage.setItem("spacestack_consent_until", String(until));
                      }
                    } catch { }
                    setConsentOpen(false);
                    // Continue with upload now that consent is granted
                    handleSendAndStack(true);
                  }}
                  className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-1.5 text-sm text-white"
                >
                  I Agree & Send
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function Karaoke({ words, currentIndex }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[15px] leading-8 flex flex-wrap gap-x-1.5">
        {words.map((w, i) => {
          const state = i < currentIndex ? "past" : i === currentIndex ? "now" : "next";
          return (
            <span
              key={i}
              className={
                state === "past"
                  ? "text-pink-300"
                  : state === "now"
                    ? "text-white font-semibold underline decoration-pink-400 decoration-2 underline-offset-[6px]"
                    : "text-neutral-400"
              }
            >
              {w}
            </span>
          );
        })}
      </p>
    </div>
  );
}