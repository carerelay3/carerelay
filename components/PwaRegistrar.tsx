"use client";

import { useEffect, useState } from "react";

export function PwaRegistrar() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => null);
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(worker);
            setUpdateAvailable(true);
          }
        });
      });
    }).catch(() => {
      // CircleRelay remains fully usable if service worker registration is unavailable.
    });
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md flex-col gap-3 rounded border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <p className="font-medium" style={{ color: "var(--text)" }}>
        An updated CircleRelay version is ready.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-soft px-3 py-2 text-sm"
          onClick={() => setUpdateAvailable(false)}
        >
          Later
        </button>
        <button
          type="button"
          className="btn btn-primary px-3 py-2 text-sm"
          onClick={() => waitingWorker?.postMessage({ type: "SKIP_WAITING" })}
        >
          Update
        </button>
      </div>
    </div>
  );
}
