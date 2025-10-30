"use client";

import { useEffect, useMemo, useState } from "react";

type CameraPanelProps = {
  url?: string;
  title?: string;
};

export function CameraPanel(props: CameraPanelProps) {
  const defaultUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CAM_URL : undefined;
  const [camUrl, setCamUrl] = useState<string | undefined>(props.url || defaultUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  useEffect(() => {
    if (props.url && props.url !== camUrl) setCamUrl(props.url);
  }, [props.url]);

  const effectiveSrc = useMemo(() => {
    if (!camUrl) return undefined;
    const u = new URL(camUrl, typeof window !== "undefined" ? window.location.href : "http://localhost");
    u.searchParams.set("_", String(nonce));
    return u.toString();
  }, [camUrl, nonce]);

  useEffect(() => {
    if (!effectiveSrc) return;
    setIsError(null);
    setIsLoading(true);
  }, [effectiveSrc]);

  function reload() {
    setIsError(null);
    setIsLoading(true);
    setNonce((n) => n + 1);
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-strong">{props.title || "Live Camera"}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="btn btn-outline text-xs"
            title="Reload stream"
          >
            Reload
          </button>
        </div>
      </div>

      {!effectiveSrc ? (
        <div className="p-4 text-sm text-muted">
          Camera URL not configured. Set <code className="text-strong">NEXT_PUBLIC_CAM_URL</code> or pass <code className="text-strong">url</code>.
        </div>
      ) : (
        <div className="w-full aspect-video overflow-hidden rounded-lg border border-white/15 bg-black/60 flex items-center justify-center relative">
          {isError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="text-strong">Could not load camera stream</div>
              <div className="text-xs text-muted">The camera server may be offline or blocking cross-origin requests.</div>
              <div className="flex items-center gap-2">
                <a
                  href={camUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline text-xs"
                >
                  Open stream in new tab
                </a>
                <button
                  onClick={reload}
                  className="btn btn-outline text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Using <img> for MJPEG streams. */}
              <img
                src={effectiveSrc}
                alt="Live camera stream"
                className="w-full h-full object-contain"
                onLoad={() => { setIsLoading(false); setIsError(null); }}
                onError={() => { setIsLoading(false); setIsError("Failed to load stream"); }}
              />
              {isLoading && (
                <div className="absolute text-muted text-sm">Loading…</div>
              )}
            </>
          )}
        </div>
      )}

      {isError && (
        <div className="text-xs text-danger">{isError}. Ensure the tunnel is reachable and CORS allows this origin.</div>
      )}

      <div className="text-xs text-muted">
        For external links or dev tunnels, whitelisting this origin and using HTTPS now.
      </div>
    </div>
  );
}