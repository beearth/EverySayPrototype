import { useEffect, useMemo, useRef, useState } from "react";

const GUIDE_TEXT = "When the light turns on, speak your cheer slowly.";
const PRESET_SCRIPTS = {
  yc: "i love ycombinator",
  bts: "i love bts",
  lord: "i loveyou lord aman"
};

export default function CheerModal({ open, onClose, item, onSend, onStack }) {
  const [err, setErr] = useState("");
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [counting, setCounting] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const tickerRef = useRef(null);
  const countdownRef = useRef(null);

  const script = (selectedPreset ? PRESET_SCRIPTS[selectedPreset] : item?.cheerScript || "").trim();
  const words = useMemo(() => script.split(/\s+/).filter(Boolean), [script]);
  const SPEED_MS = 420;

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
    setSelectedPreset("");
    setCountdown(0);
    setCounting(false);
    clearInterval(tickerRef.current);
    clearInterval(countdownRef.current);
  }

  function cleanupMedia() {
    try {
      clearInterval(tickerRef.current);
      clearInterval(countdownRef.current);
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    recorderRef.current = null;
    mediaStreamRef.current = null;
  }

  function startCountdown() {
    if (counting || recording || !selectedPreset) return;
    
    setCountdown(3);
    setCounting(true);
    
    let count = 3;
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
    }, 1000);
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
        setDuration(Math.floor(elapsed / 1000));
        setWordIdx((i) => Math.min(words.length - 1, i + 1));
      }, SPEED_MS);

      rec.start();
    } catch (e) {
      console.error(e);
      setErr("마이크 권한이 거부되었거나 사용할 수 없습니다.");
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

  async function handleSendAndStack() {
    if (!blobUrl) return;
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const filename = `everysay-${Date.now()}.webm`;
      const file = new File([blob], filename, { type: blob.type });
      const metadata = {
        preset: selectedPreset,
        script: script,
        duration: duration,
        timestamp: Date.now(),
        type: 'local-recording'
      };

      // 로컬 스택에 저장
      await onStack?.(file, metadata);

      // 성공 메시지 표시
      setErr("녹음이 My Stack에 저장되었습니다!");

      // 1초 후 모달 닫기
      setTimeout(() => {
        cleanupMedia();
        onClose?.();
      }, 1000);

    } catch (e) {
      console.error(e);
      setErr("My Stack 저장 중 오류가 발생했습니다.");
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
            {item?.title || "EVERYSAY Cheer"}
          </h3>
          <button
            onClick={() => {
              cleanupMedia();
              onClose?.();
            }}
            className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
          >
            닫기
          </button>
        </div>

        {err && (
          <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
            err.includes("저장되었습니다") 
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}>
            {err}
          </div>
        )}

        <div className="space-y-5">
          {/* 영상 미리보기 */}
          {item?.video && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
              <video
                ref={videoRef}
                src={item.video}
                controls
                className="w-full max-h-[360px] object-cover"
              />
            </div>
          )}

          {/* 프리셋 선택 */}
          <div className="space-y-3">
            <p className="text-sm text-neutral-300">스크립트 선택:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPreset("yc")}
                className={`rounded-xl px-4 py-2 ${
                  selectedPreset === "yc"
                    ? "bg-pink-500 text-white"
                    : "border border-white/20 text-neutral-200 hover:bg-white/10"
                }`}
              >
                1. I love YCombinator
              </button>
              <button
                onClick={() => setSelectedPreset("bts")}
                className={`rounded-xl px-4 py-2 ${
                  selectedPreset === "bts"
                    ? "bg-pink-500 text-white"
                    : "border border-white/20 text-neutral-200 hover:bg-white/10"
                }`}
              >
                2. I love BTS
              </button>
              <button
                onClick={() => setSelectedPreset("lord")}
                className={`rounded-xl px-4 py-2 ${
                  selectedPreset === "lord"
                    ? "bg-pink-500 text-white"
                    : "border border-white/20 text-neutral-200 hover:bg-white/10"
                }`}
              >
                3. I love you Lord, Amen
              </button>
            </div>
          </div>

          {/* 가이드 + 선택된 스크립트 */}
          {selectedPreset && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
              <p className="text-sm text-neutral-300">{GUIDE_TEXT}</p>
              <p className="text-[13px] leading-6 text-neutral-200">
                <b>읽을 문장:</b> {script}
              </p>
            </div>
          )}

          {/* 녹음 상태 및 컨트롤 */}
          <div className="space-y-3">
            {recording ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                  <span className="text-neutral-300">
                    녹음 중... {duration}초
                  </span>
                </div>
                <Karaoke words={words} currentIndex={wordIdx} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={stopRecording}
                    className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
                  >
                    ⏹ 녹음 중지
                  </button>
                  <button
                    onClick={() => {
                      cleanupMedia();
                      resetAll();
                    }}
                    className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    취소
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
                  className={`rounded-xl px-4 py-2 w-full ${
                    selectedPreset
                      ? "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {selectedPreset ? "🎙 녹음 시작" : "스크립트를 선택해주세요"}
                </button>

                {blobUrl && (
                  <div className="space-y-3">
                    <audio controls src={blobUrl} className="w-full" />
                    <div className="flex flex-col gap-2">
                      {/* Send & Stack 버튼 */}
                      <button
                        onClick={handleSendAndStack}
                        className="w-full rounded-xl bg-pink-500 px-4 py-2.5 text-white hover:bg-pink-600 font-medium"
                      >
                        🚀 Send & Stack
                      </button>
                      
                      {/* 보조 액션 버튼들 */}
                      <div className="flex gap-2">
                        <button
                          onClick={saveFile}
                          className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          💾 다운로드
                        </button>
                        <button
                          onClick={() => {
                            resetAll();
                            setSelectedPreset("");
                          }}
                          className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          🔄 다시 녹음
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