import { useState, useEffect } from "react";
import { WORD_STUDY_WORDS } from "../lib/wordStudy";

const DB_NAME = "spacestack";
const WORD_STORE = "wordStudy";

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

async function getWordsByState(state) {
  try {
    const db = await openWordDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, "readonly");
      const req = tx.objectStore(WORD_STORE).getAll();
      req.onsuccess = () => {
        const allWords = req.result || [];
        const filtered = allWords.filter(item => item.state === state);
        resolve(filtered);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export default function WordBookModal({ open, onClose, bookType }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  const bookConfig = {
    red: {
      title: "🔴 Red Word Book",
      subtitle: "Unmemorized Words",
      state: "red",
      color: "red"
    },
    yellow: {
      title: "🟡 Yellow Word Book",
      subtitle: "Words with Unknown Pronunciation",
      state: "yellow",
      color: "yellow"
    },
    green: {
      title: "🟢 Green Word Book",
      subtitle: "Memorized Words",
      state: "green",
      color: "green"
    }
  };

  const config = bookConfig[bookType] || bookConfig.red;

  useEffect(() => {
    if (open) {
      loadWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookType]);

  const loadWords = async () => {
    setLoading(true);
    try {
      const wordStates = await getWordsByState(config.state);

      // Get full word data
      const fullWords = wordStates.map(item => {
        const wordData = WORD_STUDY_WORDS.find(w => w.id === item.wordId);
        return wordData ? {
          ...wordData,
          state: item.state,
          updatedAt: item.updatedAt
        } : null;
      }).filter(Boolean);

      // Sort by updatedAt (most recent first)
      fullWords.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      setWords(fullWords);
    } catch (err) {
      console.error("[WordBook] Failed to load words:", err);
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0b1220] p-6 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p className="text-sm text-neutral-400 mt-1">{config.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-neutral-400">Loading...</div>
          ) : words.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-lg mb-2">No words yet</p>
              <p className="text-sm">Change word colors in Word Study mode to add them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {words.map((word) => {
                const bgColor = config.color === "red" ? "bg-red-500/20 border-red-500/50" :
                  config.color === "yellow" ? "bg-yellow-500/20 border-yellow-500/50" :
                    "bg-green-500/20 border-green-500/50";

                return (
                  <div
                    key={word.id}
                    className={`rounded-lg px-3 py-3 border ${bgColor} text-center`}
                  >
                    <div className="text-sm font-medium text-white mb-1">
                      {word.word}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {word.meaning}
                    </div>
                    {word.updatedAt && (
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {new Date(word.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-neutral-400">
          Total: {words.length} {words.length === 1 ? "word" : "words"}
        </div>
      </div>
    </div>
  );
}

