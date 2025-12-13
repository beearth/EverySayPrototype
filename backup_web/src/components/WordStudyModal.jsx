import { useState, useEffect, useRef } from "react";
import { WORD_STUDY_WORDS, WORD_STATE } from "../lib/wordStudy";
import { addToStack } from "./MyStackFeed";
import WordBookModal from "./WordBookModal";

const DB_NAME = "spacestack";
const WORD_STORE = "wordStudy";

// IndexedDB helper for word study (uses same DB as MyStackFeed)
async function openWordDB() {
  return await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 3);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(WORD_STORE)) {
        db.createObjectStore(WORD_STORE, { keyPath: "wordId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// getWordState was unused, removing it as per lint (previous diff showed it being removed)
// Wait, looking at Step 506 diff, getWordState WAS removed.
// Original file Step 500 line 25.

async function saveWordState(wordId, state) {
  try {
    const db = await openWordDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, "readwrite");
      const store = tx.objectStore(WORD_STORE);
      store.put({ wordId, state, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("[WordStudy] Failed to save word state:", err);
  }
}

async function getAllWordStates() {
  try {
    const db = await openWordDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, "readonly");
      const req = tx.objectStore(WORD_STORE).getAll();
      req.onsuccess = () => {
        const states = {};
        req.result.forEach((item) => {
          states[item.wordId] = item.state;
        });
        resolve(states);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export default function WordStudyModal({ open, onClose, onStackComplete }) {
  const [wordStates, setWordStates] = useState({});
  const [longPressWord, setLongPressWord] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [optionPosition, setOptionPosition] = useState({ x: 0, y: 0 });
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(null);
  const [wordBookOpen, setWordBookOpen] = useState(false);
  const [wordBookType, setWordBookType] = useState("red");

  // Unused lang variable removed
  // const lang = getLanguage();

  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  // Unused ref removed
  // const touchCurrentRef = useRef(null);
  const moveHandlerRef = useRef(null);
  const endHandlerRef = useRef(null);
  const showOptionsRef = useRef(false);
  const selectedDirectionRef = useRef(null);
  const longPressWordRef = useRef(null);

  useEffect(() => {
    if (open) {
      loadWordStates();
    }
  }, [open]);

  const loadWordStates = async () => {
    const states = await getAllWordStates();
    setWordStates(states);
  };

  const getNextState = (currentState) => {
    switch (currentState) {
      case WORD_STATE.WHITE:
        return WORD_STATE.RED;
      case WORD_STATE.RED:
        return WORD_STATE.YELLOW;
      case WORD_STATE.YELLOW:
        return WORD_STATE.GREEN;
      case WORD_STATE.GREEN:
        return WORD_STATE.WHITE;
      default:
        return WORD_STATE.RED;
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case WORD_STATE.RED:
        return "bg-red-500 text-white";
      case WORD_STATE.YELLOW:
        return "bg-yellow-500 text-white";
      case WORD_STATE.GREEN:
        return "bg-green-500 text-white";
      default:
        return "bg-white/10 text-neutral-200 border border-white/20";
    }
  };

  const handleWordClick = async (word) => {
    if (saving || showOptions) return;

    const currentState = wordStates[word.id] || WORD_STATE.WHITE;
    const nextState = getNextState(currentState);

    const newStates = { ...wordStates, [word.id]: nextState };
    setWordStates(newStates);

    await saveWordState(word.id, nextState);

    // Save to word book with state
    await saveToWordBook(word, nextState);
  };

  const saveToWordBook = async (word, state) => {
    try {
      const db = await openWordDB();
      const tx = db.transaction(WORD_STORE, "readwrite");
      const store = tx.objectStore(WORD_STORE);

      // Save word state (red, yellow, or green)
      // Only save if state is not white
      if (state !== WORD_STATE.WHITE) {
        await new Promise((resolve, reject) => {
          const req = store.put({
            wordId: word.id,
            state: state,
            updatedAt: Date.now()
          });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } else {
        // If state is white, remove from word book
        await new Promise((resolve, reject) => {
          const req = store.delete(word.id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (err) {
      console.error("[WordStudy] Failed to save to word book:", err);
    }
  };

  useEffect(() => {
    showOptionsRef.current = showOptions;
  }, [showOptions]);

  useEffect(() => {
    selectedDirectionRef.current = selectedDirection;
  }, [selectedDirection]);

  useEffect(() => {
    longPressWordRef.current = longPressWord;
  }, [longPressWord]);

  useEffect(() => {
    if (!open) {
      // 모달이 닫힐 때 모든 이벤트 리스너 정리
      if (moveHandlerRef.current) {
        document.removeEventListener('mousemove', moveHandlerRef.current);
        document.removeEventListener('touchmove', moveHandlerRef.current);
      }
      if (endHandlerRef.current) {
        document.removeEventListener('mouseup', endHandlerRef.current);
        document.removeEventListener('touchend', endHandlerRef.current);
      }
    }
  }, [open]);

  const handleWordPressStart = (word, event) => {
    if (saving || showOptions) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    touchStartRef.current = { word, x: clientX, y: clientY };
    setSelectedDirection(null);
    selectedDirectionRef.current = null;

    // 전역 이벤트 핸들러 생성
    const handleMove = (e) => {
      if (!showOptionsRef.current || !touchStartRef.current) return;

      const moveX = e.touches ? e.touches[0].clientX : e.clientX;
      const moveY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = moveX - touchStartRef.current.x;
      const dy = moveY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 25) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        let direction = null;

        if (angle >= -45 && angle <= 45) {
          direction = "right";
        } else if (angle > 45 && angle <= 135) {
          direction = "bottom";
        } else if (angle > 135 || angle <= -135) {
          direction = "left";
        } else if (angle > -135 && angle < -45) {
          direction = "top";
        }

        setSelectedDirection(direction);
        selectedDirectionRef.current = direction;
      }
    };

    const handleEnd = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);

      const currentDirection = selectedDirectionRef.current;
      const currentWord = longPressWordRef.current;
      const currentShowOptions = showOptionsRef.current;

      moveHandlerRef.current = null;
      endHandlerRef.current = null;

      console.log("[WordStudy] End event:", {
        showOptions: currentShowOptions,
        direction: currentDirection,
        word: currentWord
      });

      // 약간의 지연을 두고 실행 (state 업데이트 대기)
      setTimeout(async () => {
        if (currentShowOptions && currentDirection && currentWord) {
          console.log("[WordStudy] Executing action:", currentDirection);
          await handleOptionClick(currentDirection);
        } else if (currentShowOptions) {
          console.log("[WordStudy] Closing options (no direction selected)");
          setShowOptions(false);
          setLongPressWord(null);
          setSelectedDirection(null);
        }
      }, 50);

      touchStartRef.current = null;
    };

    moveHandlerRef.current = handleMove;
    endHandlerRef.current = handleEnd;

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    longPressTimerRef.current = setTimeout(() => {
      setLongPressWord(word);
      longPressWordRef.current = word;
      setOptionPosition({ x: clientX, y: clientY });
      setShowOptions(true);
      showOptionsRef.current = true;
    }, 500);
  };

  // REMOVED: handleWordPressMove, handleWordPressEnd

  const handleOptionClick = async (direction) => {
    const word = longPressWordRef.current || longPressWord;
    if (!word || saving) {
      console.warn("[WordStudy] Cannot execute - no word or saving:", { word, saving });
      return;
    }

    console.log("[WordStudy] Executing option:", direction, "for word:", word.word);

    setSaving(true);
    setShowOptions(false);
    setSelectedDirection(null);
    setLongPressWord(null);
    selectedDirectionRef.current = null;
    longPressWordRef.current = null;
    showOptionsRef.current = false;

    try {
      if (direction === "top") {
        // 음성 발음 재생
        console.log("[WordStudy] Playing pronunciation for:", word.word);
        playPronunciation(word.word);
        setSaving(false);
      } else if (direction === "bottom") {
        // 스택하기
        console.log("[WordStudy] Adding to stack:", word.word);
        await addWordToStack(word);

        // 성공 애니메이션 표시
        setSuccessAnimation({
          wordId: word.id,
          word: word.word,
          timestamp: Date.now()
        });

        // 2초 후 애니메이션 제거
        setTimeout(() => {
          setSuccessAnimation(null);
        }, 2000);

        setSaving(false);
      } else if (direction === "right") {
        // 우: 커스터마이징 (나중에 구현)
        console.log("[WordStudy] Right option clicked for:", word.word);
        setSaving(false);
      } else if (direction === "left") {
        // 좌: 커스터마이징 (나중에 구현)
        console.log("[WordStudy] Left option clicked for:", word.word);
        setSaving(false);
      }
    } catch (err) {
      console.error("[WordStudy] Option action error:", err);
      setSaving(false);
    }
  };

  const playPronunciation = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } else {
      console.warn("[WordStudy] Speech synthesis not supported");
    }
  };

  const addWordToStack = async (word) => {
    try {
      const script = `I found a positive word: ${word.word}`;

      // Create minimal audio blob
      const minimalAudioData = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
      const blob = new Blob([minimalAudioData], { type: "audio/webm" });
      const file = new File([blob], `word-study-${word.id}-${Date.now()}.webm`, { type: "audio/webm" });

      await addToStack(file, {
        preset: "word-study",
        script: script,
        duration: 0,
        timestamp: Date.now(),
        type: "word-study",
        itemId: `word-study-${word.id}`,
        note: `Positive word: ${word.word} (${word.meaning})`,
      });

      onStackComplete?.();
    } catch (err) {
      console.error("[WordStudy] Failed to add to stack:", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0b1220] p-6 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">📚 Word Study Mode</h3>
          <div className="flex gap-2 items-center">
            <div className="relative group">
              <button
                className="rounded-lg px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              >
                📖 Word Books
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-[#0b1220] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => {
                    setWordBookType("red");
                    setWordBookOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-sm"
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Red Word Book
                </button>
                <button
                  onClick={() => {
                    setWordBookType("yellow");
                    setWordBookOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-sm"
                >
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  Yellow Word Book
                </button>
                <button
                  onClick={() => {
                    setWordBookType("green");
                    setWordBookOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-sm"
                >
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Green Word Book
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 text-sm text-neutral-400">
          <p>• Click a word to change color: White → Red → Yellow → Green</p>
          <p>• Hold for 0.5 seconds to see options</p>
          <p>• Red/Yellow: Unmemorized | Green: Memorized</p>
          <p>• Stack positive words to WorldStack (Drag Down)</p>
        </div>

        {/* Word Grid */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {WORD_STUDY_WORDS.map((word) => {
              const state = wordStates[word.id] || WORD_STATE.WHITE;
              const colorClass = getStateColor(state);
              const isSuccess = successAnimation?.wordId === word.id;

              return (
                <div key={word.id} className="relative aspect-square">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleWordPressStart(word, e);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleWordPressStart(word, e);
                    }}
                    onClick={() => {
                      // 짧은 클릭만 처리 (홀딩이 아닌 경우)
                      if (!showOptions && !longPressTimerRef.current) {
                        handleWordClick(word);
                      }
                    }}
                    className={`w-full h-full rounded-lg text-xs font-medium transition-all ${colorClass} ${saving ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"
                      } select-none relative z-10 flex items-center justify-center ${isSuccess ? "ring-4 ring-green-400 ring-offset-2 scale-110" : ""}`}
                    title={`${word.word} - ${word.meaning}`}
                  >
                    <span className="truncate px-1 w-full text-center">{word.word}</span>
                  </button>

                  {/* Success Animation - Checkmark */}
                  {isSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce">
                        <span className="text-lg font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Success Message Overlay */}
                  {isSuccess && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in-up">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow-lg whitespace-nowrap font-medium">
                        ✨ Added to Stack!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlay to close options */}
        {showOptions && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/20"
              onClick={() => {
                setShowOptions(false);
                setLongPressWord(null);
              }}
            />
            {/* 4-Direction Options Modal */}
            <div
              className="fixed z-[70] pointer-events-none"
              style={{
                left: `${optionPosition.x}px`,
                top: `${optionPosition.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative w-32 h-32 pointer-events-auto">
                {/* Top: Pronunciation */}
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${selectedDirection === "top"
                    ? "bg-blue-600 ring-4 ring-blue-300 scale-110"
                    : "bg-blue-500"
                    } text-white flex items-center justify-center shadow-lg text-lg transition-all`}
                >
                  🔊
                </div>

                {/* Bottom: Stack */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${selectedDirection === "bottom"
                    ? "bg-pink-600 ring-4 ring-pink-300 scale-110"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                    } text-white flex items-center justify-center shadow-lg text-lg transition-all`}
                >
                  ⬆️
                </div>

                {/* Right: Custom (우) */}
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${selectedDirection === "right"
                    ? "bg-green-600 ring-4 ring-green-300 scale-110"
                    : "bg-green-500"
                    } text-white flex items-center justify-center shadow-lg text-lg transition-all`}
                >
                  →
                </div>

                {/* Left: Custom (좌) */}
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${selectedDirection === "left"
                    ? "bg-gray-600 ring-4 ring-gray-300 scale-110"
                    : "bg-gray-500"
                    } text-white flex items-center justify-center shadow-lg text-lg transition-all`}
                >
                  ←
                </div>

                {/* Center: Close */}
                <button
                  onClick={() => {
                    setShowOptions(false);
                    setLongPressWord(null);
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white flex items-center justify-center shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </>
        )}

        {/* Word Book Modal */}
        <WordBookModal
          open={wordBookOpen}
          onClose={() => setWordBookOpen(false)}
          bookType={wordBookType}
        />
      </div>
    </div>
  );
}
