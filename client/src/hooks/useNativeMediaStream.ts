import { useCallback, useEffect, useRef, useState } from "react";

export type MediaStatus = "idle" | "requesting" | "active" | "denied" | "unsupported" | "error";

export interface NativeMediaStreamOptions {
  autoStart?: boolean;
  video?: boolean;
  audio?: boolean;
}

export interface UseNativeMediaStreamReturn {
  stream: MediaStream | null;
  screenStream: MediaStream | null;
  status: MediaStatus;
  errorMessage: string | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  audioLevel: number; // 0 to 100
  devices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
  hasMultipleCameras: boolean;
  isScreenSharing: boolean;
  screenShareError: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  switchCamera: () => Promise<void>;
  retry: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  toggleScreenShare: () => Promise<void>;
}

export function useNativeMediaStream(
  options: NativeMediaStreamOptions = {}
): UseNativeMediaStreamReturn {
  const { autoStart = true, video: initialVideo = true, audio: initialAudio = true } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [status, setStatus] = useState<MediaStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(initialVideo);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(initialAudio);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop hardware media tracks
  const stopTracks = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch {
          // ignore
        }
      });
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setStream(null);

    // Cancel audio analysis
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
    } catch {
      // ignore
    }
  }, []);

  // Audio meter loop
  const setupAudioMeter = useCallback((mediaStream: MediaStream) => {
    if (typeof window === "undefined" || !(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
      return;
    }
    const audioTrack = mediaStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!analyserRef.current || !streamRef.current) {
          setAudioLevel(0);
          return;
        }
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-255 to 0-100 scale
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch {
      // AudioContext may be restricted by autoplay policy until user gesture
      setAudioLevel(0);
    }
  }, []);

  // Request user media
  const startStream = useCallback(
    async (deviceIdToUse?: string | null) => {
      // Environment check
      if (
        typeof window === "undefined" ||
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setStatus("unsupported");
        setErrorMessage("Camera access is not supported in this browser environment.");
        return;
      }

      setStatus("requesting");
      setErrorMessage(null);

      // Clean up previous stream
      stopTracks();

      const videoConstraints: MediaTrackConstraints = deviceIdToUse
        ? { deviceId: { exact: deviceIdToUse } }
        : {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };

      try {
        // Attempt audio + video first
        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: true,
          });
        } catch (initialErr) {
          // If audio fails (e.g. no mic or mic blocked), fallback to video only
          newStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        }

        streamRef.current = newStream;
        setStream(newStream);
        setStatus("active");
        setErrorMessage(null);

        // Apply initial enabled states
        newStream.getVideoTracks().forEach((track) => {
          track.enabled = videoEnabled;
        });
        newStream.getAudioTracks().forEach((track) => {
          track.enabled = audioEnabled;
        });

        // Setup audio visualizer if audio track exists
        if (newStream.getAudioTracks().length > 0) {
          setupAudioMeter(newStream);
        }

        // Refresh camera device list
        await refreshDevices();
      } catch (err: unknown) {
        const error = err as Error;
        const name = error.name || "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
          setErrorMessage(
            "Camera and microphone permissions were denied. Please enable camera access in your browser site settings."
          );
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setStatus("error");
          setErrorMessage("No camera or microphone hardware found on your device.");
        } else {
          setStatus("error");
          setErrorMessage(error.message || "Failed to access camera device.");
        }
      }
    },
    [audioEnabled, refreshDevices, setupAudioMeter, stopTracks, videoEnabled]
  );

  // Toggle video track
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const nextState = !videoEnabled;
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
      setVideoEnabled(nextState);
    } else {
      setVideoEnabled((v) => !v);
    }
  }, [videoEnabled]);

  // Toggle audio track
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const nextState = !audioEnabled;
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
      setAudioEnabled(nextState);
    } else {
      setAudioEnabled((a) => !a);
    }
  }, [audioEnabled]);

  // Switch between cameras if multiple exist
  const switchCamera = useCallback(async () => {
    if (devices.length <= 1) return;

    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];

    setSelectedDeviceId(nextDevice.deviceId);
    await startStream(nextDevice.deviceId);
  }, [devices, selectedDeviceId, startStream]);

  // Retry
  const retry = useCallback(async () => {
    await startStream(selectedDeviceId);
  }, [selectedDeviceId, startStream]);

  // Screen sharing controls
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    setScreenShareError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      setScreenShareError("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const displayMedia = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = displayMedia;
      setScreenStream(displayMedia);
      setIsScreenSharing(true);

      const videoTrack = displayMedia.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== "NotAllowedError") {
        setScreenShareError(error.message || "Failed to start screen share.");
      }
    }
  }, [stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  // Auto-start on mount if requested
  useEffect(() => {
    if (autoStart) {
      startStream();
    }
    return () => {
      stopTracks();
    };
  }, [autoStart, startStream, stopTracks]);

  return {
    stream,
    screenStream,
    status,
    errorMessage,
    videoEnabled,
    audioEnabled,
    audioLevel,
    devices,
    selectedDeviceId,
    hasMultipleCameras: devices.length > 1,
    isScreenSharing,
    screenShareError,
    start: () => startStream(selectedDeviceId),
    stop: stopTracks,
    toggleVideo,
    toggleAudio,
    switchCamera,
    retry,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}
