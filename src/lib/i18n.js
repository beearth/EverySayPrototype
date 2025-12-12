// Internationalization (i18n) support
const translations = {
  en: {
    tutorial: {
      step1: {
        title: "Welcome to SPACE STACK! 👋",
        content: {
          0: "SPACE STACK transforms positive energy from Faith, Fandom, and Support into digital assets.",
          1: "We digitize every 'Positive Choice' you make in real-time as a Stack.",
          2: "Accumulated Stacks become powerful social proof for viral growth.",
        },
      },
      step2: {
        title: "Understanding WorldStack 🗼",
        content: {
          0: "WorldStack gathers all your positive expressions:",
          1: "Voice, Word Study, Positive Choices, and Drawings.",
          2: "These four types of 'Stacks' come together",
          3: "to build a tower that transforms the world.",
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
      step7: {
        title: "Positive Drawing Mode 🎨",
        highlight: "Draw Your Heart",
        content: {
          0: "Select a positive word like Love, Hope, Peace,",
          1: "and express it with your own drawing.",
          2: "Your creation becomes a unique stack",
          3: "that adds color to the WorldStack tower.",
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
    main: {
      title: "SPACE STACK Cheer Hub",
      searchPlaceholder: "Search events",
      whoToCheer: "Who to Cheer",
      cheerNow: "Cheer Now",
      worldStack: "WorldStack",
      voicesBuilding: "Voices building together",
      startBuilding: "Start building the tower...",
      myStackLocal: "My Stack (Local)",
      refresh: "Refresh",
      categories: {
        fandom: "Fandom",
        health: "Health",
        education: "Education",
        local: "Local",
        sports: "Sports",
        nonProfit: "Non-profit",
        children: "Children",
        emergingCreators: "Emerging Creators",
      },
    },
  },
  ko: {
    tutorial: {
      step1: {
        title: "SPACE STACK에 오신 것을 환영합니다! 👋",
        content: {
          0: "SPACE STACK는 신앙, 팬덤, 후원의 긍정 에너지를 디지털 자산(Stack)으로 전환합니다.",
          1: "당신의 모든 '긍정적 선택'은 실시간으로 기록되어 스택이 됩니다.",
          2: "축적된 스택은 강력한 사회적 증거가 되어 세상을 변화시킵니다.",
        },
      },
      step2: {
        title: "WorldStack 알아보기 🗼",
        content: {
          0: "WorldStack은 음성 녹음, 긍정 단어 학습,",
          1: "긍정 선택, 그리고 드로잉까지 모든 표현을 담습니다.",
          2: "이 4가지 방식의 스택들이 하나로 모여,",
          3: "세상을 따뜻하게 변화시키는 거대한 타워가 됩니다.",
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
      step7: {
        title: "긍정 드로잉 모드 🎨",
        highlight: "마음을 그려보세요",
        content: {
          0: "Love, Hope, Peace와 같은 긍정 단어를 선택하고,",
          1: "나만의 그림으로 표현해 보세요.",
          2: "당신의 그림은 특별한 스택이 되어",
          3: "WorldStack 타워를 다채롭게 채워줍니다.",
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
    main: {
      title: "SPACE STACK 치어 허브",
      searchPlaceholder: "이벤트 검색",
      whoToCheer: "응원하기",
      cheerNow: "응원하기",
      worldStack: "WorldStack",
      voicesBuilding: "함께 쌓아가는 목소리들",
      startBuilding: "타워 쌓기를 시작해보세요...",
      myStackLocal: "나의 스택 (로컬)",
      refresh: "새로고침",
      categories: {
        fandom: "팬덤",
        health: "건강",
        education: "교육",
        local: "지역",
        sports: "스포츠",
        nonProfit: "비영리",
        children: "어린이",
        emergingCreators: "라이징 크리에이터",
      },
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
