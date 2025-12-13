import { useState } from "react";
import { getLanguage, setLanguage, t } from "../lib/i18n";

function getTutorialSteps(lang) {
  return [
    {
      title: t("tutorial.step1.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            {t("tutorial.step1.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step1.content.1", lang)}
            <br />
            {t("tutorial.step1.content.2", lang)}
          </p>
        </div>
      ),
      icon: "🎉",
    },
    {
      title: t("tutorial.step2.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            {t("tutorial.step2.content.0", lang)}{" "}
            <span className="text-pink-500 font-semibold">WorldStack</span>{" "}
            {t("tutorial.step2.content.1", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step2.content.2", lang)}
            <br />
            {t("tutorial.step2.content.3", lang)}
          </p>
        </div>
      ),
      icon: "🌍",
    },
    {
      title: t("tutorial.step3.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            <span className="text-pink-500 font-semibold">"Who to Cheer"</span>{" "}
            {t("tutorial.step3.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            <span className="text-pink-500 font-semibold">"Cheer Now"</span>{" "}
            {t("tutorial.step3.content.1", lang)}
          </p>
        </div>
      ),
      icon: "💝",
    },
    {
      title: t("tutorial.step4.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            {t("tutorial.step4.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step4.content.1", lang)}
            <br />
            {t("tutorial.step4.content.2", lang)}
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            {t("tutorial.step4.content.3", lang)}
          </p>
        </div>
      ),
      icon: "🎤",
    },
    {
      title: t("tutorial.step5.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            <span className="text-pink-500 font-semibold">"✨ Positive Choice"</span>{" "}
            {t("tutorial.step5.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step5.content.1", lang)}
            <br />
            <span className="text-pink-500 font-semibold">{t("tutorial.step5.content.2", lang)}</span>{" "}
            {t("tutorial.step5.content.3", lang)}
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            {t("tutorial.step5.content.4", lang)}
          </p>
        </div>
      ),
      icon: "✨",
    },
    {
      title: t("tutorial.step6.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            <span className="text-pink-500 font-semibold">{t("tutorial.step6.highlight", lang)}</span>{" "}
            {t("tutorial.step6.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step6.content.1", lang)}
            <br />
            {t("tutorial.step6.content.2", lang)}
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            {t("tutorial.step6.content.3", lang)}
          </p>
        </div>
      ),
      icon: "📚",
    },
    {
      title: t("tutorial.step7.title", lang),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            <span className="text-pink-500 font-semibold">{t("tutorial.step7.highlight", lang)}</span>{" "}
            {t("tutorial.step7.content.0", lang)}
          </p>
          <p className="text-neutral-300">
            {t("tutorial.step7.content.1", lang)}
            <br />
            {t("tutorial.step7.content.2", lang)}
            <br />
            {t("tutorial.step7.content.3", lang)}
          </p>
        </div>
      ),
      icon: "🎨",
    },
  ];
}

export default function TutorialModal({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const TUTORIAL_STEPS = getTutorialSteps(currentLang);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ko" : "en";
    setLanguage(newLang);
    setCurrentLang(newLang);
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem("spacestack_tutorial_completed", "true");
    }
    onComplete();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem("spacestack_tutorial_completed", "true");
    }
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        className="w-full max-w-[700px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[750px]
        rounded-3xl bg-background border border-border shadow-2xl p-8 sm:p-10 text-[16px] leading-relaxed
        animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-500">
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>
            <div className="flex gap-4 items-center">
              <button
                onClick={toggleLanguage}
                className="text-xs px-2 py-1 rounded border border-neutral-600 hover:bg-neutral-800 transition-colors"
                title="Switch Language / 언어 변경"
              >
                {currentLang === "en" ? "🇰🇷 KO" : "🇺🇸 EN"}
              </button>
              <button
                onClick={handleSkip}
                className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                {t("tutorial.skip", currentLang)}
              </button>
            </div>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            {step.title}
          </h2>
          <div className="text-left">{step.content}</div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mb-6">
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              className="flex-1 px-6 py-3 rounded-2xl border border-border bg-background hover:bg-muted text-foreground font-medium transition-colors"
            >
              {t("tutorial.previous", currentLang)}
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex-1 px-6 py-3 rounded-2xl text-white font-semibold transition-colors
              bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600`}
          >
            {isLastStep ? t("tutorial.start", currentLang) : t("tutorial.next", currentLang)}
          </button>
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center gap-3 justify-center pt-4 border-t border-border">
          <input
            type="checkbox"
            id="dontShowAgain"
            className="accent-pink-500 w-5 h-5"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label htmlFor="dontShowAgain" className="text-sm text-neutral-400 cursor-pointer">
            {t("tutorial.dontShowAgain", currentLang)}
          </label>
        </div>
      </div>
    </div>
  );
}

