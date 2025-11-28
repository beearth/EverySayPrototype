// Translation map for English to Korean
export const TRANSLATIONS = {
  // Questions
  "Which is a positive choice?": "어떤 것이 긍정적인 선택일까요?",
  "What should you choose in difficult situations?": "어려운 상황에서 무엇을 선택해야 할까요?",
  "What is the right attitude for growth?": "성장을 위한 올바른 태도는 무엇일까요?",
  "What should you do after failure?": "실패 후 무엇을 해야 할까요?",
  "What mindset is needed to achieve goals?": "목표를 달성하기 위해 필요한 마음가짐은 무엇일까요?",
  "What is the power to overcome difficulties?": "어려움을 극복하는 힘은 무엇일까요?",
  "What is the attitude to accept change?": "변화를 받아들이는 태도는 무엇일까요?",
  "What is an important factor for success?": "성공을 위한 중요한 요소는 무엇일까요?",
  
  // Options
  "Despair": "절망",
  "Give up": "포기",
  "Courage": "용기",
  "Hatred": "증오",
  "Challenge": "도전",
  "Avoid": "회피",
  "Pessimism": "비관주의",
  "Blame": "비난",
  "Learning": "학습",
  "Resignation": "체념",
  "Try again": "다시 시도",
  "Doubt": "의심",
  "Hope": "희망",
  "Patience": "인내",
  "Rejection": "거부",
  "Acceptance": "수용",
  "Effort": "노력",
};

// 4-choice positive selection questions data
export const POSITIVE_CHOICE_QUESTIONS = [
  {
    id: 1,
    question: "Which is a positive choice?",
    options: ["Despair", "Give up", "Courage", "Hatred"],
    correctIndex: 2, // "Courage"
    correctText: "Courage",
  },
  {
    id: 2,
    question: "What should you choose in difficult situations?",
    options: ["Give up", "Challenge", "Avoid", "Pessimism"],
    correctIndex: 1, // "Challenge"
    correctText: "Challenge",
  },
  {
    id: 3,
    question: "What is the right attitude for growth?",
    options: ["Blame", "Learning", "Pessimism", "Avoid"],
    correctIndex: 1, // "Learning"
    correctText: "Learning",
  },
  {
    id: 4,
    question: "What should you do after failure?",
    options: ["Resignation", "Give up", "Try again", "Pessimism"],
    correctIndex: 2, // "Try again"
    correctText: "Try again",
  },
  {
    id: 5,
    question: "What mindset is needed to achieve goals?",
    options: ["Doubt", "Give up", "Hope", "Despair"],
    correctIndex: 2, // "Hope"
    correctText: "Hope",
  },
  {
    id: 6,
    question: "What is the power to overcome difficulties?",
    options: ["Give up", "Patience", "Pessimism", "Avoid"],
    correctIndex: 1, // "Patience"
    correctText: "Patience",
  },
  {
    id: 7,
    question: "What is the attitude to accept change?",
    options: ["Rejection", "Acceptance", "Pessimism", "Avoid"],
    correctIndex: 1, // "Acceptance"
    correctText: "Acceptance",
  },
  {
    id: 8,
    question: "What is an important factor for success?",
    options: ["Pessimism", "Effort", "Give up", "Resignation"],
    correctIndex: 1, // "Effort"
    correctText: "Effort",
  },
];

// Get random question
export function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * POSITIVE_CHOICE_QUESTIONS.length);
  return POSITIVE_CHOICE_QUESTIONS[randomIndex];
}

