import { useState, useEffect, useRef } from "react";

export default function EverySayPrototype() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [count, setCount] = useState({ today: 0, total: 0, streak: 0 });
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        chunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      alert("마이크 권한이 필요합니다 (https:// 또는 localhost 환경).");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    setCount({ today: 1, total: 12, streak: 5 }); // 더미 통계
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 border border-neutral-800 rounded-2xl bg-neutral-950 text-neutral-100">
      <h2 className="text-2xl font-bold mb-6 text-pink-400">Eternal Stack Prototype</h2>

      {/* 상단 상태 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card title="오늘 고백" value={count.today} />
        <Card title="전체 누적" value={count.total} />
        <Card title="연속 일수" value={count.streak} />
      </div>

      {/* 녹음 */}
      <div className="p-4 rounded-2xl border border-neutral-700">
        <h3 className="text-lg font-semibold mb-2">음성 고백 기록</h3>
        <div className="flex gap-2 mb-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600"
            >
              🎙 녹음 시작
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
            >
              ⏹ 정지
            </button>
          )}
        </div>

        {audioURL && (
          <audio
            controls
            src={audioURL}
            className="w-full border border-neutral-700 rounded-xl"
          />
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-neutral-800 p-4 text-center">
      <div className="text-neutral-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
