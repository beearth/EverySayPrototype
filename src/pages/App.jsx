// src/pages/App.jsx
import { useEffect, useState } from "react";
import MentorList from "./MentorList";
import AuthButtons from "../components/AuthButtons";
import TutorialModal from "../components/TutorialModal";
import { supaMain as supa } from "../lib/supa";
import { getGuestId } from "../utils/guestId";

export default function App() {
  const [guestId, setGuestId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const href = window.location.href;
    const hasCode = href.includes("code=") && href.includes("state=");
    if (!hasCode) return;

    supa.auth
      .exchangeCodeForSession(href)
      .then(() => {
        const url = new URL(href);
        window.history.replaceState(
          {},
          document.title,
          url.origin + url.pathname + url.hash
        );
      })
      .catch((e) => {
        console.error("[exchangeCodeForSession]", e);
      });
  }, []);

  // Initialize guestId once
  useEffect(() => {
    const id = getGuestId();
    setGuestId(id);
    // eslint-disable-next-line no-console
    console.log("GUEST ID:", id);
  }, []);

  // Check if tutorial should be shown
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("spacestack_tutorial_completed");
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  // Render only after guestId is ready
  if (!guestId) {
    return <div className="text-white text-center p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex justify-end">
          <AuthButtons />
        </div>
        <MentorList guestId={guestId} />
      </div>

      <footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-neutral-500">
        ⚠️ This is a prototype of the SPACE STACK Support Platform.
        All recorded voices are temporary and deleted within 180 days.
        No data is shared or used commercially.
      </footer>

      {showTutorial && (
        <TutorialModal
          onComplete={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
