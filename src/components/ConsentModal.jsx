// ...existing code...
import { useState } from "react";

export default function ConsentModal({ onAgree }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        className="w-full max-w-[700px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[750px]
        rounded-3xl bg-background border border-border shadow-2xl p-8 sm:p-10 text-[16px] leading-relaxed"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Eternal Stack Support Platform Prototype
        </h2>

        <p className="text-neutral-500 mb-8 text-[15px] text-center sm:text-left leading-relaxed">
          This is a <b>prototype version</b> of the Eternal Stack Support Platform.<br /><br />
          Recorded voices will be used only for testing and internal service improvement and will be stored for up to <b>1 year (365 days)</b>.<br /><br />
          Recordings will never be <b>shared, sold, redistributed, or used externally</b> for any commercial purpose.<br /><br />
          If you withdraw consent, remaining stored data will be deleted upon request. (Note: data already incorporated into deployed models may not be retractable.)
        </p>

        <div className="flex items-center gap-3 mb-8 text-sm text-neutral-500 justify-center sm:justify-start">
          <input
            type="checkbox"
            id="agree"
            className="accent-pink-500 w-5 h-5"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="agree" className="text-[14px] sm:text-[15px]">
            I have read and agree to the statement above.
          </label>
        </div>

        <button
          onClick={() => { if (checked) onAgree() }}
          disabled={!checked}
          className={`w-full px-6 py-4 rounded-2xl text-white text-lg font-semibold tracking-wide transition
            ${checked ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : "bg-neutral-700 opacity-50"}`}
        >
          Agree and Continue
        </button>
      </div>
    </div>
  );
}
// ...existing code...