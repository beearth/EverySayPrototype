// src/pages/App.jsx
import { useState } from "react";
import MentorList from "./MentorList";
import ConsentModal from "../components/ConsentModal";

export default function App() {
  const [agreed, setAgreed] = useState(false);

  if (!agreed) return <ConsentModal onAgree={() => setAgreed(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <MentorList />
      </div>

      <footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-neutral-500">
        ⚠️ This is a prototype of the EVERYSAY Support Platform.
        All recorded voices are temporary and deleted within 30 days.
        No data is shared or used commercially.
      </footer>
    </div>
  );
}
