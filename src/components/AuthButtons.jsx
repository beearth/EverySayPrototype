import { useEffect, useState } from "react";
import { supa } from "../lib/supa";

export default function AuthButtons() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supa.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supa.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInGoogle() {
    await supa.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    await supa.auth.signOut();
    setUser(null);
  }

  return (
    <div className="flex gap-2 items-center">
      {user ? (
        <>
          <span className="text-sm text-neutral-300">
            {user.user_metadata?.name || user.email}
          </span>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-sm"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={signInGoogle}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
        >
          Continue with Google
        </button>
      )}
    </div>
  );
}
