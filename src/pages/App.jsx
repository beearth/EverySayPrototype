// src/pages/App.jsx
import { useEffect, useState } from "react";
import MentorList from "./MentorList";
import ConsentModal from "../components/ConsentModal";
import AuthButtons from "../components/AuthButtons";
import { supaMain as supa } from "../lib/supa";

export default function App() {
  const [agreed, setAgreed] = useState(false);

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

  if (!agreed) return <ConsentModal onAgree={() => setAgreed(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex justify-end">
          <AuthButtons />
        </div>
        <MentorList />
      </div>

      <footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-neutral-500">
        ⚠️ This is a prototype of the EVERYSAY Support Platform.
        All recorded voices are temporary and deleted within 365 days.
        No data is shared or used commercially.
      </footer>
    </div>
  );
}
