import { useEffect, useRef } from "react";
import { AlertCircle, Camera, Mic, MicOff, RefreshCw, SwitchCamera, Video, VideoOff } from "lucide-react";
import type { MediaStatus } from "@/hooks/useNativeMediaStream";

export interface NativeCameraFeedProps {
  stream: MediaStream | null;
  status: MediaStatus;
  errorMessage?: string | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  audioLevel?: number; // 0-100
  hasMultipleCameras?: boolean;
  userName?: string;
  className?: string;
  showControls?: boolean;
  isScreenShare?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onSwitchCamera?: () => void;
  onRetry?: () => void;
}

export function NativeCameraFeed({
  stream,
  status,
  errorMessage,
  videoEnabled,
  audioEnabled,
  audioLevel = 0,
  hasMultipleCameras = false,
  userName = "You",
  className = "",
  showControls = false,
  isScreenShare = false,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera,
  onRetry,
}: NativeCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Attach MediaStream to HTMLVideoElement
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      videoEl.srcObject = stream;
      videoEl.play().catch(() => {
        // Autoplay may be deferred until user gesture or tab focus
      });
    } else {
      videoEl.srcObject = null;
    }
  }, [stream]);

  return (
    <div
      className={`relative aspect-video rounded-2xl bg-[#090b14] border-2 border-white/20 flex flex-col items-center justify-center overflow-hidden shadow-2xl group ${className}`}
    >
      {/* 1. Active Camera / Screen Feed */}
      {status === "active" && videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full ${isScreenShare ? "object-contain bg-black" : "object-cover"}`}
          style={{ transform: isScreenShare ? "none" : "scaleX(-1)" }} // Only mirror webcam, not screen share
        />
      ) : null}

      {/* 2. Camera Off Placeholder */}
      {status === "active" && !videoEnabled ? (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-white mb-3 shadow-lg">
            <VideoOff size={24} className="text-zinc-400" />
          </div>
          <span className="text-sm font-bold text-white mb-0.5">{userName}</span>
          <span className="text-xs text-zinc-400">Camera turned off</span>
        </div>
      ) : null}

      {/* 3. Requesting Access State */}
      {status === "requesting" ? (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white mb-3">
            <Camera size={22} className="animate-spin text-white" />
          </div>
          <span className="text-xs font-bold text-white">Connecting native camera...</span>
          <span className="text-[11px] text-zinc-400 mt-1">Please allow browser permissions</span>
        </div>
      ) : null}

      {/* 4. Permission Denied or Hardware Error */}
      {status === "denied" || status === "error" ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-xs">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-2">
            <AlertCircle size={22} />
          </div>
          <span className="text-xs font-bold text-white mb-1">Camera Access Blocked</span>
          <p className="text-[11px] text-zinc-400 mb-3 leading-tight">
            {errorMessage || "Camera permissions were denied. Check browser site permissions in the URL bar."}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-zinc-200 transition-all cursor-pointer"
            >
              <RefreshCw size={12} className="text-black" />
              <span style={{ color: "#000000", fontWeight: 800 }}>Retry Access</span>
            </button>
          )}
        </div>
      ) : null}

      {/* 5. Unsupported Environment Fallback */}
      {status === "unsupported" ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-xl font-bold text-white mb-2">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-white">{userName} (Self)</span>
          <span className="text-[10px] text-zinc-400 mt-1">Camera Standby</span>
        </div>
      ) : null}

      {/* TOP OVERLAYS */}
      {status === "active" && (
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
          {/* Live Status Badge */}
          <div className="flex items-center gap-1.5 bg-black/75 border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>LIVE HD</span>
          </div>

          {/* Audio Activity Visualizer */}
          {audioEnabled && (
            <div className="flex items-center gap-1 bg-black/75 border border-white/20 px-2 py-1 rounded-full backdrop-blur-md">
              <Mic size={11} className="text-emerald-400" />
              <div className="flex items-end gap-0.5 h-3 w-7">
                <span
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(20, audioLevel * 0.9)}%` }}
                />
                <span
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(25, audioLevel * 1.1)}%` }}
                />
                <span
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(15, audioLevel * 0.7)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM IDENTITY & STATUS */}
      <div className="absolute bottom-3 left-3 bg-black/75 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] text-white backdrop-blur-md shadow flex items-center gap-1.5 font-medium">
        <span>{isScreenShare ? "Your Screen" : userName}</span>
        <span className="text-zinc-500">·</span>
        {isScreenShare ? (
          <span className="text-blue-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Sharing Live
          </span>
        ) : (
          <span className={audioEnabled ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
            {audioEnabled ? "Mic On" : "Muted"}
          </span>
        )}
      </div>

      {/* OPTIONAL INLINE CONTROLS (IF REQUESTED) */}
      {showControls && status === "active" && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {hasMultipleCameras && onSwitchCamera && (
            <button
              onClick={onSwitchCamera}
              className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur transition-all"
              title="Switch Camera"
            >
              <SwitchCamera size={13} />
            </button>
          )}
          {onToggleVideo && (
            <button
              onClick={onToggleVideo}
              className={`p-1.5 rounded-lg border backdrop-blur transition-all ${
                videoEnabled
                  ? "bg-black/75 hover:bg-black text-white border-white/20"
                  : "bg-red-500/80 text-white border-red-500"
              }`}
              title={videoEnabled ? "Turn Camera Off" : "Turn Camera On"}
            >
              {videoEnabled ? <Video size={13} /> : <VideoOff size={13} />}
            </button>
          )}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded-lg border backdrop-blur transition-all ${
                audioEnabled
                  ? "bg-black/75 hover:bg-black text-white border-white/20"
                  : "bg-red-500/80 text-white border-red-500"
              }`}
              title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
            >
              {audioEnabled ? <Mic size={13} /> : <MicOff size={13} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
