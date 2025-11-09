// src/App.jsx
import { useState } from "react";
import MentorList from "./pages/MentorList";
import ConsentModal from "./components/ConsentModal";

export default function App() {
  const [agreed, setAgreed] = useState(false);

  if (!agreed) return <ConsentModal onAgree={() => setAgreed(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <MentorList />
      </div>

      {/* 하단 고지문 (항상 표시) */}
<footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-neutral-500">
  ⚠️ This is a prototype of the EVERYSAY Support Platform. 
  All recorded voices are temporary and deleted within 30 days. 
  No data is shared or used commercially.
</footer>

    </div>
  );
}
