import { useState, useEffect } from "react";
import { getRandomQuestion, TRANSLATIONS } from "../lib/positiveChoices";
import { addToStack } from "./MyStackFeed";
import { getLanguage, t } from "../lib/i18n";

export default function PositiveChoiceModal({
  open,
  onClose,
  onStackComplete,
}) {
  const [question, setQuestion] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hoveredText, setHoveredText] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const lang = getLanguage();

  const getTranslation = (text) => {
    return TRANSLATIONS[text] || text;
  };

  const handleMouseEnter = (e, text) => {
    if (lang === "ko") {
      const translation = getTranslation(text);
      if (translation !== text) {
        setHoveredText(translation);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (hoveredText) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredText(null);
  };

  useEffect(() => {
    if (open) {
      const newQuestion = getRandomQuestion();
      setQuestion(newQuestion);
      setSelectedIndex(null);
      setIsCorrect(null);
      setError("");
      setSaving(false);
    }
  }, [open]);

  const handleSelect = async (index) => {
    if (saving || isCorrect !== null) return;
    
    setSelectedIndex(index);
    const correct = index === question.correctIndex;
    setIsCorrect(correct);

    // 정답 선택 시 바로 스택에 추가
    if (correct) {
      await handleAddToStack();
    }
  };

  const handleAddToStack = async () => {
    try {
      setSaving(true);
      setError("");

      const script = `${t("positiveChoice.scriptPrefix", lang)} ${question.correctText}`;
      
      // 최소한의 데이터가 있는 오디오 파일 생성 (음성 녹음 없이 스택에 추가)
      // 빈 Blob 대신 최소한의 바이트를 포함한 Blob 생성
      const minimalAudioData = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]); // WebM 헤더 시작 바이트
      const blob = new Blob([minimalAudioData], { type: "audio/webm" });
      const file = new File([blob], `positive-choice-${Date.now()}.webm`, { type: "audio/webm" });

      console.log("[PositiveChoice] Adding to stack:", { script, fileSize: file.size });

      // 로컬 스택에만 추가 (카운트 자동 증가)
      const result = await addToStack(file, {
        preset: "positive-choice",
        script: script,
        duration: 0,
        timestamp: Date.now(),
        type: "positive-choice",
        itemId: `positive-choice-${question.id}`,
        note: `${t("positiveChoice.correctAnswer", lang)} ${question.correctText}`,
      });

      console.log("[PositiveChoice] Stack add result:", result);

      // 성공 콜백 호출
      onStackComplete?.();

      // 2초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error("[PositiveChoice] Error adding to stack:", e);
      setError(`${t("positiveChoice.error", lang)}: ${e?.message || JSON.stringify(e)}`);
      setIsCorrect(null);
      setSelectedIndex(null);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !question) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1220] p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{t("positiveChoice.title", lang)}</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
          >
            {t("positiveChoice.close", lang)}
          </button>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p 
            className="text-lg text-neutral-200 mb-6 text-center cursor-help"
            onMouseEnter={(e) => handleMouseEnter(e, question.question)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {question.question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectAnswer = index === question.correctIndex;
              let buttonClass = "rounded-xl px-4 py-4 text-center font-medium transition-all border-2 ";

              if (isCorrect !== null) {
                // 결과 표시 후
                if (isCorrectAnswer) {
                  buttonClass += "bg-green-500/20 border-green-500 text-green-300 ";
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += "bg-red-500/20 border-red-500 text-red-300 ";
                } else {
                  buttonClass += "border-white/10 bg-white/5 text-neutral-400 ";
                }
              } else {
                // 선택 전
                if (isSelected) {
                  buttonClass += "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50 text-white ";
                } else {
                  buttonClass += "border-white/20 bg-white/5 text-neutral-200 hover:bg-white/10 hover:border-pink-500/50 ";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={saving || isCorrect !== null}
                  onMouseEnter={(e) => handleMouseEnter(e, option)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={buttonClass + (saving || isCorrect !== null ? "cursor-not-allowed opacity-60" : "cursor-pointer")}
                >
                  <div className="text-sm font-semibold mb-1">
                    {index + 1}
                  </div>
                  <div className="text-base">{option}</div>
                  {isCorrect !== null && isCorrectAnswer && (
                    <div className="mt-2 text-xs">✓ {t("positiveChoice.correct", lang)}</div>
                  )}
                  {isSelected && !isCorrectAnswer && (
                    <div className="mt-2 text-xs">✗ {t("positiveChoice.incorrect", lang)}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result Message */}
        {isCorrect !== null && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-center ${
            isCorrect
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}>
            {isCorrect ? (
              <div>
                <div className="text-lg font-semibold mb-1">{t("positiveChoice.correct", lang)}</div>
                <div className="text-sm">
                  {saving ? t("positiveChoice.adding", lang) : t("positiveChoice.added", lang)}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-semibold mb-1">{t("positiveChoice.incorrect", lang)}</div>
                <div 
                  className="text-sm cursor-help"
                  onMouseEnter={(e) => handleMouseEnter(e, question.correctText)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {t("positiveChoice.correctAnswer", lang)} "{question.correctText}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Translation Tooltip */}
        {hoveredText && lang === "ko" && (
          <div
            className="fixed z-[100] pointer-events-none"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: "translateY(-100%)",
            }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
              {hoveredText}
            </div>
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-pink-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Instructions */}
        {isCorrect === null && (
          <div className="text-center text-sm text-neutral-400 mt-4">
            {t("positiveChoice.selectPositive", lang)}
          </div>
        )}

        {/* Retry Button */}
        {isCorrect === false && !saving && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                const newQuestion = getRandomQuestion();
                setQuestion(newQuestion);
                setSelectedIndex(null);
                setIsCorrect(null);
                setError("");
              }}
              className="rounded-xl px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              {t("positiveChoice.retry", lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

