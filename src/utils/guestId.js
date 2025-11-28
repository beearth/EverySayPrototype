// src/utils/guestId.js
export function getGuestId() {
  if (typeof window === "undefined") return null;

  const KEY = "spacestack_guest_id";

  let id = window.localStorage.getItem(KEY);
  if (!id) {
    // Generate only on first visit
    if (window.crypto?.randomUUID) {
      id = window.crypto.randomUUID();
    } else {
      id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    window.localStorage.setItem(KEY, id);
  }

  return id;
}

