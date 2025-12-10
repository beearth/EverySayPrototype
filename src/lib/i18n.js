// Internationalization (i18n) support
const translations = {
  en: {
    tutorial: {
      step1: {
        title: "Welcome to SPACE STACK! 👋",
        content: {
          0: "SPACE STACK is a voice-based emotional support platform.",
          1: "People around the world record and share messages of encouragement,",
          2: "building a global cheer culture together.",
        },
      },
      step2: {
        title: "Understanding WorldStack 🗼",
        content: {
          0: "The WorldStack at the top shows the total number of voices",
          1: "recorded by users worldwide.",
          2: "Each voice stacks like a tower block,",
          3: "creating a warmer world together.",
        },
      },
      step3: {
        title: "Using Cheer Feature 💗",
        content: {
          0: "section, select a person or event you want to support.",
          1: "button to record a voice message.",
        },
      },
      step4: {
        title: "Recording Your Voice 🎙️",
        content: {
          0: "Grant microphone permission to record your voice.",
          1: "Recorded voices are added to WorldStack and",
          2: "delivered as messages of encouragement to others.",
          3: "💡 Tip: Short and heartfelt messages are most effective!",
        },
      },
      step5: {
        title: "Positive Choice Quiz ✨",
        content: {
          0: "button at the top to start a quiz that helps you practice positive choices.",
          1: "Select the positive answer in multiple-choice questions,",
          2: "without voice recording",
          3: "and it will be added to WorldStack.",
          4: "💡 An alternative feature for those who find voice recording difficult!",
        },
      },
      step6: {
        title: "Word Study Mode 📚",
        highlight: "Stack Positive Words",
        content: {
          0: "by dragging down!",
          1: "Memorize words by changing their colors,",
          2: "and stack positive words directly to WorldStack.",
          3: "💡 Grow your vocabulary starting with positive words!",
        },
      },
      skip: "Skip",
      previous: "Previous",
      next: "Next",
      start: "Get Started",
      dontShowAgain: "Don't show again",
    },
    positiveChoice: {
      title: "Positive Choice Quiz ✨",
      close: "Close",
      selectPositive: "Select the positive choice",
      correct: "🎉 Correct!",
      incorrect: "❌ Incorrect",
      correctAnswer: "The correct answer is",
      adding: "Adding to WorldStack...",
      added: "Added to WorldStack!",
      retry: "Try Again",
      error: "Save error",
      scriptPrefix: "Positive Choice:",
    },
    common: {
      loading: "Loading...",
      error: "Error",
    },
  },
  ko: {
    tutorial: {
      step1: {
        title: "SPACE STACK에 오신 것을 환영합니다! 👋",
        content: {
          0: "SPACE STACK는 음성 기반 감정 지원 플랫폼입니다.",
          1: "전 세계 사람들이 격려의 메시지를 녹음하고 공유하여",
          2: "글로벌 응원 문화를 만들어갑니다.",
        },
      },
      step2: {
        title: "WorldStack 알아보기 🗼",
        content: {
          0: "상단의 WorldStack은",
          1: "전 세계 사용자들이 녹음한 음성의 총 개수를 보여줍니다.",
          2: "각 음성은 타워의 블록처럼 쌓여가며,",
          3: "함께 세상을 더 따뜻하게 만들어갑니다.",
        },
      },
      step3: {
        title: "Cheer 기능 사용하기 💗",
        content: {
          0: "섹션에서 응원하고 싶은 사람이나 이벤트를 선택하세요.",
          1: "버튼을 클릭하면 음성 메시지를 녹음할 수 있습니다.",
        },
      },
      step4: {
        title: "음성 녹음하기 🎙️",
        content: {
          0: "마이크 권한을 허용하면 음성을 녹음할 수 있습니다.",
          1: "녹음한 음성은 WorldStack에 추가되며,",
          2: "다른 사람들에게 응원의 메시지로 전달됩니다.",
          3: "💡 팁: 짧고 진심 어린 메시지가 가장 효과적입니다!",
        },
      },
      step5: {
        title: "긍정 선택 퀴즈 ✨",
        content: {
          0: "버튼을 클릭하면 긍정적인 선택을 연습할 수 있는 퀴즈가 시작됩니다.",
          1: "4지선다 문제에서 긍정적인 답을 선택하면,",
          2: "음성 녹음 없이 바로",
          3: "WorldStack에 추가됩니다.",
          4: "💡 음성 녹음이 어려운 분들을 위한 대안 기능입니다!",
        },
      },
      step6: {
        title: "Word Study 모드 📚",
        highlight: "긍정 단어 스택하기",
        content: {
          0: "기능이 추가되었습니다! (아래로 드래그)",
          1: "단어의 색상을 바꾸며 암기 상태를 관리하고,",
          2: "긍정 단어를 WorldStack에 바로 쌓아보세요.",
          3: "💡 긍정적인 단어부터 어휘력을 키워보세요!",
        },
      },
      skip: "건너뛰기",
      previous: "이전",
      next: "다음",
      start: "시작하기",
      dontShowAgain: "다시 보지 않기",
    },
    positiveChoice: {
      title: "긍정 선택 퀴즈 ✨",
      close: "닫기",
      selectPositive: "긍정적인 선택지를 선택하세요",
      correct: "🎉 정답입니다!",
      incorrect: "❌ 틀렸습니다",
      correctAnswer: "정답은",
      adding: "WorldStack에 추가 중...",
      added: "WorldStack에 추가되었습니다!",
      retry: "다시 시도",
      error: "저장 오류",
      scriptPrefix: "긍정 선택:",
    },
    common: {
      loading: "로딩 중...",
      error: "오류",
    },
  },
};

// Get language from localStorage or default to English
export function getLanguage() {
  if (typeof window === "undefined") return "en";
  // Default to English for US accelerator submission
  return localStorage.getItem("spacestack_language") || "en";
}

// Set language
export function setLanguage(lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem("spacestack_language", lang);
}

// Get translation
export function t(key, lang = null) {
  const currentLang = lang || getLanguage();
  const keys = key.split(".");
  let value = translations[currentLang] || translations.en;

  // Navigate through nested object
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (value && typeof value === "object") {
      // Try string key first
      if (k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (let j = 0; j <= i; j++) {
          const k2 = keys[j];
          if (value && typeof value === "object" && k2 in value) {
            value = value[k2];
          } else {
            console.warn(`[i18n] Translation not found: ${key}`);
            return key; // Return key if translation not found
          }
        }
        break;
      }
    } else {
      // Fallback to English
      value = translations.en;
      for (let j = 0; j <= i; j++) {
        const k2 = keys[j];
        if (value && typeof value === "object" && k2 in value) {
          value = value[k2];
        } else {
          console.warn(`[i18n] Translation not found: ${key}`);
          return key;
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
}

export default translations;
