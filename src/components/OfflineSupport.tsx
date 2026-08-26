"use client";

import { useEffect, useState } from "react";

/**
 * Registers the service worker and tells the room when the wifi has gone.
 *
 * Registration is production-only: in development the pages being cached are
 * the ones actively being edited, which makes for very confusing debugging.
 */
export default function OfflineSupport() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // An unsupported or blocked service worker just means no offline play.
      });
    }

    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-400/30 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100 backdrop-blur"
    >
      📴 Offline — games you have already opened still work
    </div>
  );
}
