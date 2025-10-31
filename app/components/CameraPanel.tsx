"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Camera, RotateCcw, Maximize, X, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (props.url && props.url !== camUrl) setCamUrl(props.url);
  }, [props.url, camUrl]);

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

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <>
      <div className="card-glass animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                {props.title || "Live Camera Feed"}
              </h3>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Real-time aquarium monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {effectiveSrc && (
              <button
                onClick={toggleFullscreen}
                className="btn btn-ghost btn-sm"
                title="Fullscreen view"
              >
                <Maximize className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={reload}
              className="btn btn-ghost btn-sm"
              title="Reload stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Stream */}
        {!effectiveSrc ? (
          <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="text-center p-6">
              <Camera className="w-16 h-16 mx-auto mb-3 text-gray-400" />
              <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                Camera URL not configured
              </div>
              <div className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
                Set <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_CAM_URL</code> environment variable
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10">
            {isError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-16 h-16 mb-3 text-red-400" />
                <div className="text-sm mb-3" style={{ color: "rgb(var(--text-primary))" }}>
                  Camera stream unavailable
                </div>
                <div className="text-xs mb-4" style={{ color: "rgb(var(--text-muted))" }}>
                  The camera server may be offline or blocking requests
                </div>
                <div className="flex gap-2">
                  <a
                    href={camUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Direct Link
                  </a>
                  <button
                    onClick={reload}
                    className="btn btn-primary btn-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry Connection
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={effectiveSrc}
                  alt="Live camera stream"
                  fill
                  className="object-cover"
                  onLoad={() => { 
                    setIsLoading(false); 
                    setIsError(null); 
                  }}
                  onError={() => { 
                    setIsLoading(false); 
                    setIsError("Stream connection failed"); 
                  }}
                  unoptimized
                />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="loading w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <div className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                        Connecting to camera...
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stream Status Indicator */}
                {!isLoading && !isError && (
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-white">LIVE</span>
                    </div>
                  </div>
                )}
                
                {/* Quality Indicator */}
                {!isLoading && !isError && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-white">HD</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>Stream active</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && effectiveSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-full">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 btn btn-ghost text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
              Close
            </button>
            <Image
              src={effectiveSrc}
              alt="Live camera stream - fullscreen"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}