"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Room, RoomEvent, ConnectionState } from "livekit-client";
import { postMessage } from "@/lib/api";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Sparkles,
  Send,
  Play,
  RotateCcw,
} from "lucide-react";

interface MeetingRoomProps {
  negotiationId: string;
  candidateName: string;
  onEndMeeting?: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  negotiationId,
  candidateName,
  onEndMeeting,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [candidateCaption, setCandidateCaption] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const shortName = candidateName ? candidateName.split(" ")[0] : "there";
  const greetingText = `Hello ${shortName}! Welcome. I'm your AI HR partner. What compensation range are you targeting for this role?`;

  const [aiCaption, setAiCaption] = useState<string>(greetingText);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "active">("active");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastProcessedTextRef = useRef<string>("");
  const isAudioLockedRef = useRef<boolean>(false);
  const isBusyProcessingRef = useRef<boolean>(false);
  const activeAudioSessionIdRef = useRef<number>(0);
  const speechSafetyTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const isRecognizingRef = useRef<boolean>(false);
  const shouldListenRef = useRef<boolean>(false);
  const restartTimerRef = useRef<any>(null);
  const handleProcessCandidateMessageRef = useRef<any>(null);
  const stopAllAudioRef = useRef<any>(null);

  // Client-side sanitization: Guarantees raw JSON or "thought" never leaks to screen or voice
  const cleanCaptionAndVoice = useCallback((text: string): string => {
    if (!text) return "";
    let s = text.trim();
    // If preamble exists before a JSON object: "Text... { "thought": "..." }"
    const braceIdx = s.search(/\{[\s\S]*\}/);
    if (braceIdx > 0) {
      const preamble = s.substring(0, braceIdx).trim();
      if (preamble.length >= 8) return preamble;
    }
    s = s.replace(/\{[\s\S]*?\}/g, "");
    s = s.replace(/```(?:json)?[\s\S]*?```/gi, "");
    s = s.replace(/"thought"\s*:\s*"[^"]*"/gi, "");
    s = s.replace(/"action"\s*:\s*"[^"]*"/gi, "");
    s = s.replace(/"message"\s*:\s*"[^"]*"/gi, "");
    s = s.replace(/^[\s{}"':,]+|[\s{}"':,]+$/g, "").trim();
    return s || "Understood.";
  }, []);

  // Stop any ongoing audio immediately to guarantee only 1 voice plays
  const stopAllAudio = useCallback(() => {
    activeAudioSessionIdRef.current++;
    if (speechSafetyTimerRef.current) {
      clearTimeout(speechSafetyTimerRef.current);
      speechSafetyTimerRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
      } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    isAudioLockedRef.current = false;
    setIsAiSpeaking(false);
  }, []);

  // Fallback Web Speech Synthesis (Fast 1.35x rate with professional Indian English voice)
  const fallbackBrowserTTS = useCallback(
    (rawText: string) => {
      const text = cleanCaptionAndVoice(rawText);
      const sessionId = ++activeAudioSessionIdRef.current;

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        stopAllAudio();
        isAudioLockedRef.current = true;
        setIsAiSpeaking(true);

        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
        } catch {}

        const utterance = new SpeechSynthesisUtterance(text);

        // Fast conversational pace (1.35x)
        utterance.rate = 1.35;
        utterance.pitch = 1.0;
        utterance.lang = "en-IN";

        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(
          (v) =>
            v.lang === "en-IN" ||
            v.lang === "en_IN" ||
            v.name.toLowerCase().includes("india") ||
            v.name.toLowerCase().includes("neerja") ||
            v.name.toLowerCase().includes("heera") ||
            v.name.toLowerCase().includes("prabhat") ||
            v.name.toLowerCase().includes("ravi")
        );
        if (indianVoice) {
          utterance.voice = indianVoice;
        }

        // Keep anchor on window to prevent V8 garbage collector from dropping onend event
        (window as any).__activeUtterance = utterance;

        // Auto-release safety timer in case Chrome onend is delayed
        if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
        const estDuration = Math.max(2500, (text.split(" ").length / 2.5) * 1000 + 1000);
        speechSafetyTimerRef.current = setTimeout(() => {
          setIsAiSpeaking(false);
          isAudioLockedRef.current = false;
        }, estDuration);

        utterance.onend = () => {
          if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
          if (sessionId === activeAudioSessionIdRef.current) {
            setIsAiSpeaking(false);
            isAudioLockedRef.current = false;
          }
        };
        utterance.onerror = () => {
          if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
          if (sessionId === activeAudioSessionIdRef.current) {
            setIsAiSpeaking(false);
            isAudioLockedRef.current = false;
          }
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          if (sessionId === activeAudioSessionIdRef.current) {
            setIsAiSpeaking(false);
            isAudioLockedRef.current = false;
          }
        }, 1500);
      }
    },
    [stopAllAudio, cleanCaptionAndVoice]
  );

  // Play voice through VerbX TTS at 1.35x speed with strict single-voice lock & 2s timeout
  const playAiVoice = useCallback(
    async (rawText: string) => {
      const text = cleanCaptionAndVoice(rawText);
      const sessionId = ++activeAudioSessionIdRef.current;

      // Step 1: Kill any previously playing audio immediately
      stopAllAudio();

      isAudioLockedRef.current = true;
      setIsAiSpeaking(true);

      // Auto-release safety timer in case audio playback stalls
      if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
      const estDuration = Math.max(2500, (text.split(" ").length / 2.5) * 1000 + 1500);
      speechSafetyTimerRef.current = setTimeout(() => {
        setIsAiSpeaking(false);
        isAudioLockedRef.current = false;
      }, estDuration);

      // Fast 2-second timeout to prevent any hanging cold start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const ttsRes = await fetch("/api/verbx/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // If another speech session began while fetch was resolving, discard this one
        if (sessionId !== activeAudioSessionIdRef.current || !isMountedRef.current) {
          return;
        }

        if (ttsRes.ok) {
          const contentType = ttsRes.headers.get("content-type");
          if (contentType && (contentType.includes("audio") || contentType.includes("ogg") || contentType.includes("mpeg"))) {
            const blob = await ttsRes.blob();
            if (sessionId !== activeAudioSessionIdRef.current || !isMountedRef.current) {
              return;
            }

            if (blob.size > 200) {
              const audioUrl = URL.createObjectURL(blob);
              const audio = new Audio(audioUrl);

              // 1.35x fast conversational speaking rate with pitch lock
              audio.playbackRate = 1.35;
              (audio as any).preservesPitch = true;

              currentAudioRef.current = audio;

              audio.onended = () => {
                if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
                if (sessionId === activeAudioSessionIdRef.current) {
                  setIsAiSpeaking(false);
                  isAudioLockedRef.current = false;
                }
                URL.revokeObjectURL(audioUrl);
                currentAudioRef.current = null;
              };

              audio.onerror = () => {
                if (speechSafetyTimerRef.current) clearTimeout(speechSafetyTimerRef.current);
                currentAudioRef.current = null;
                if (sessionId === activeAudioSessionIdRef.current) {
                  fallbackBrowserTTS(text);
                }
              };

              await audio.play();
              return;
            }
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("VerbX TTS notice, utilizing client speech engine:", err);
      }

      if (sessionId === activeAudioSessionIdRef.current && isMountedRef.current) {
        fallbackBrowserTTS(text);
      }
    },
    [fallbackBrowserTTS, stopAllAudio, cleanCaptionAndVoice]
  );

  // Start Camera & Microphone
  const startCameraAndMic = useCallback(async () => {
    try {
      if (localStreamRef.current && localStreamRef.current.active) {
        setLocalStream(localStreamRef.current);
        if (videoRef.current) {
          videoRef.current.srcObject = localStreamRef.current;
          await videoRef.current.play().catch(() => {});
        }
        return localStreamRef.current;
      }

      // Fast unconstrained audio & video for instant webcam startup
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraEnabled(true);
      setMicEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (err) {
      console.warn("Camera/Mic getUserMedia notice:", err);
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true });
        localStreamRef.current = videoOnly;
        setLocalStream(videoOnly);
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnly;
          await videoRef.current.play().catch(() => {});
        }
        return videoOnly;
      } catch (e2) {
        console.warn("Video only fallback notice:", e2);
      }
      return null;
    }
  }, []);

  // Connect to LiveKit
  const connectLiveKit = useCallback(async (stream: MediaStream | null) => {
    try {
      const res = await fetch(`/api/livekit/token?negotiationId=${negotiationId}&type=candidate`);
      if (!res.ok) return;
      const data = await res.json();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Disconnected, () => {});
      livekitRoomRef.current = room;

      await room.connect(data.url, data.token);

      if (isMountedRef.current) {
        setConnectionStatus("connected");
      }

      if (stream && room.state === ConnectionState.Connected) {
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        if (videoTrack) await room.localParticipant.publishTrack(videoTrack).catch(() => {});
        if (audioTrack) await room.localParticipant.publishTrack(audioTrack).catch(() => {});
      }
    } catch (err) {
      console.warn("LiveKit signaling notice, direct session active:", err);
      if (isMountedRef.current) {
        setConnectionStatus("active");
      }
    }
  }, [negotiationId]);

  // Handle Candidate Message Processing Pipeline
  const handleProcessCandidateMessage = useCallback(
    async (messageText: string) => {
      const cleaned = messageText.trim();
      if (!cleaned || isBusyProcessingRef.current) return;

      if (lastProcessedTextRef.current === cleaned) return;
      lastProcessedTextRef.current = cleaned;

      // Stop any AI speech immediately when candidate speaks/submits
      stopAllAudio();

      isBusyProcessingRef.current = true;
      setIsProcessing(true);

      try {
        const res = await postMessage(negotiationId, cleaned);
        const rawReply = res.message || "Understood.";
        const aiReply = cleanCaptionAndVoice(rawReply);

        setAiCaption(aiReply);
        await playAiVoice(aiReply);
      } catch (err: any) {
        console.error("Pipeline message processing error:", err);
        setAiCaption("Could you please repeat your expectation?");
      } finally {
        isBusyProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [negotiationId, playAiVoice, cleanCaptionAndVoice, stopAllAudio]
  );

  // Keep references stable for event listeners to avoid teardowns
  handleProcessCandidateMessageRef.current = handleProcessCandidateMessage;
  stopAllAudioRef.current = stopAllAudio;

  // Real-time hardware microphone volume meter via Web Audio API
  useEffect(() => {
    if (!localStream || !micEnabled || !hasStarted) {
      setAudioLevel(0);
      return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) {
      setAudioLevel(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animId: number;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;

      source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isMountedRef.current) return;
        analyser?.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        // If candidate speaks aloud while AI is talking, interrupt AI immediately!
        if (normalized > 18 && isAiSpeaking) {
          stopAllAudioRef.current?.();
        }

        animId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn("Audio meter init notice:", err);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (source) {
        try {
          source.disconnect();
        } catch {}
      }
      if (audioContext && audioContext.state !== "closed") {
        try {
          audioContext.close();
        } catch {}
      }
    };
  }, [localStream, micEnabled, hasStarted, isAiSpeaking]);

  // Safe Start & Stop controllers for Speech Recognition
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isRecognizingRef.current || !shouldListenRef.current) {
      return;
    }
    try {
      recognitionRef.current.start();
      isRecognizingRef.current = true;
      setIsListening(true);
    } catch (err: any) {
      if (err?.name === "InvalidStateError") {
        isRecognizingRef.current = true;
        setIsListening(true);
      } else {
        console.warn("Speech recognition start notice:", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    isRecognizingRef.current = false;
    setIsListening(false);
  }, []);

  // Continuous, resilient Speech Recognition lifecycle
  useEffect(() => {
    if (!hasStarted) return;

    if (!micEnabled) {
      stopListening();
      return;
    }

    shouldListenRef.current = true;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      setSpeechError("Speech recognition not supported in your browser. You can type in the box below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      if (isBusyProcessingRef.current) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const candidateText = (final || interim).trim();
      if (candidateText && candidateText.length >= 2) {
        // If candidate speaks, instantly silence AI
        stopAllAudioRef.current?.();

        setCandidateCaption(candidateText);
        setIsCandidateSpeaking(true);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (final && final.trim().length >= 2) {
          setIsCandidateSpeaking(false);
          handleProcessCandidateMessageRef.current?.(final.trim());
        } else {
          // 850ms silence-debounce allows natural conversational pauses
          silenceTimerRef.current = setTimeout(() => {
            if (candidateText.trim().length >= 2 && !isBusyProcessingRef.current) {
              setIsCandidateSpeaking(false);
              handleProcessCandidateMessageRef.current?.(candidateText.trim());
            }
          }, 850);
        }
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition notice:", e?.error);
      setIsCandidateSpeaking(false);

      if (e?.error === "language-not-supported") {
        recognition.lang = "en-US";
      } else if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        setSpeechError("Microphone permission was denied. Please allow microphone in browser address bar.");
        shouldListenRef.current = false;
        setIsListening(false);
      }
      // On non-fatal errors like 'no-speech' or 'audio-capture', onend will fire and restart safely
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setIsListening(false);

      if (shouldListenRef.current && isMountedRef.current && micEnabled) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          startListening();
        }, 200);
      }
    };

    recognitionRef.current = recognition;
    startListening();

    return () => {
      stopListening();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [hasStarted, micEnabled, startListening, stopListening]);

  // Start Meeting Handler
  const handleStartMeeting = async () => {
    // 1. Instantly prime/unlock browser audio during the user click gesture
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {}
    }
    try {
      const silentAudio = new Audio();
      silentAudio.play().catch(() => {});
    } catch {}

    // 2. Await camera & mic permissions FIRST so SpeechRecognition doesn't race
    let stream: MediaStream | null = null;
    try {
      stream = await startCameraAndMic();
      if (stream) connectLiveKit(stream);
    } catch (e) {
      console.warn("Start camera/mic notice:", e);
    }

    // 3. Mark meeting started (triggers SpeechRecognition with permissions ready)
    setHasStarted(true);
    setAiCaption(greetingText);

    // 4. Trigger initial greeting
    playAiVoice(greetingText);
  };

  // Re-attach video stream whenever localStream or hasStarted updates
  useEffect(() => {
    if (hasStarted && videoRef.current && (localStream || localStreamRef.current)) {
      const s = localStream || localStreamRef.current;
      if (videoRef.current.srcObject !== s) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [hasStarted, localStream]);

  // Clean teardown on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAllAudio();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (livekitRoomRef.current && livekitRoomRef.current.state === ConnectionState.Connected) {
        livekitRoomRef.current.disconnect();
      }
    };
  }, [stopAllAudio]);

  // Controls
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    const nextState = !micEnabled;
    setMicEnabled(nextState);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = nextState;
      }
    }
    if (nextState) {
      shouldListenRef.current = true;
      startListening();
    } else {
      stopListening();
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const msg = textInput.trim();
    setTextInput("");
    stopAllAudio();
    setCandidateCaption(msg);
    handleProcessCandidateMessage(msg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto p-4 w-full justify-between relative">
      {/* Start Discussion Overlay */}
      {!hasStarted && (
        <div className="absolute inset-4 z-40 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center text-white border border-slate-800 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Ready to Begin Your Compensation Discussion?
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mb-8 leading-relaxed">
            Connect your camera and microphone to speak directly with the AutoOffer AI HR representative with real-time speech and interactive voice dialogue.
          </p>
          <button
            onClick={handleStartMeeting}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-3"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Join & Start Speaking</span>
          </button>
        </div>
      )}

      {/* Primary Video Grid: Exactly 2 Views */}
      <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-[420px]">
        {/* View 1: Candidate Video */}
        <div
          className={`relative rounded-3xl bg-slate-900 overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-xl group ${
            isCandidateSpeaking || audioLevel > 15
              ? "border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/30"
              : "border-slate-800"
          }`}
        >
          <video
            ref={(el) => {
              videoRef.current = el;
              const s = localStream || localStreamRef.current;
              if (el && s && el.srcObject !== s) {
                el.srcObject = s;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              !cameraEnabled ? "hidden" : ""
            }`}
          />

          {!cameraEnabled && (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <VideoOff className="w-8 h-8 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-300">Camera Paused</span>
            </div>
          )}

          {/* Participant Label & Real-time Mic Activity Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-white border border-white/10 shadow-md">
            <span>{candidateName || "Candidate"} (You)</span>

            {micEnabled ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/20">
                {/* Audio Equalizer Bars */}
                <div className="flex items-end gap-0.5 h-3.5 w-4">
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(20, Math.min(100, audioLevel * 1.5))}%` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(25, Math.min(100, audioLevel * 2.2))}%` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(15, Math.min(100, audioLevel * 1.2))}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  {isCandidateSpeaking || audioLevel > 15
                    ? "Speaking"
                    : isListening
                    ? "Listening"
                    : "Ready"}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider pl-1.5 border-l border-white/20">
                Muted
              </span>
            )}
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="absolute top-14 left-4 right-4 bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs p-2.5 rounded-xl backdrop-blur-md">
              {speechError}
            </div>
          )}

          {/* Captions Overlay for Candidate */}
          {candidateCaption && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl text-xs text-white border border-white/10 shadow-lg">
              <span className="text-blue-400 font-bold block mb-0.5">You:</span>
              <p className="leading-relaxed">{candidateCaption}</p>
            </div>
          )}
        </div>

        {/* View 2: AI HR Agent Visual / Avatar */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 overflow-hidden flex flex-col items-center justify-center border border-indigo-900/50 shadow-xl p-8 text-center">
          {/* Animated Avatar Glow */}
          <div className="relative mb-6">
            {isAiSpeaking && (
              <>
                <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-2xl animate-ping opacity-40"></div>
              </>
            )}

            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-2xl relative transition-transform duration-300 ${
                isAiSpeaking ? "scale-105 ring-4 ring-blue-400/50" : ""
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-slate-900/30 flex items-center justify-center backdrop-blur-xs">
                <Sparkles className={`w-12 h-12 text-white ${isAiSpeaking ? "animate-spin-slow" : ""}`} />
              </div>
            </div>

            {/* Speaking Wave Badge */}
            {isAiSpeaking ? (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-md animate-bounce">
                Speaking
              </div>
            ) : (
              <button
                onClick={() => playAiVoice(aiCaption)}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-700/80 hover:bg-indigo-600 text-[10px] font-bold text-white tracking-wider shadow-sm flex items-center gap-1 transition"
                title="Speak / Replay AI Voice"
              >
                <Volume2 className="w-3 h-3" />
                <span>Play Voice</span>
              </button>
            )}
          </div>

          <h3 className="text-lg font-bold text-white">AutoOffer AI HR Representative</h3>
          <p className="text-xs text-indigo-300 mt-1">Autonomous Compensation Partner • LiveKit + VerbX</p>

          {/* Connection Status Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-medium text-slate-300 border border-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                connectionStatus === "connected" ? "bg-emerald-500" : "bg-sky-400"
              }`}
            ></span>
            <span>{connectionStatus === "connected" ? "LiveKit Cloud Connected" : "Voice Session Active"}</span>
          </div>

          {/* Captions Overlay for AI HR */}
          {aiCaption && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl text-xs text-white border border-white/10 shadow-lg text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-400 font-bold text-[11px]">AI HR Agent:</span>
                <button
                  onClick={() => playAiVoice(aiCaption)}
                  className="text-slate-400 hover:text-white transition p-1"
                  title="Replay Voice"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="leading-relaxed">{aiCaption}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clean Meeting Controls Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Meeting Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl font-semibold transition shadow-sm flex items-center gap-2 text-xs ${
              micEnabled
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{micEnabled ? "Mic On" : "Muted"}</span>
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-2xl font-semibold transition shadow-sm flex items-center gap-2 text-xs ${
              cameraEnabled
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? <Video className="w-5 h-5 text-blue-400" /> : <VideoOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{cameraEnabled ? "Camera On" : "Camera Off"}</span>
          </button>

          {onEndMeeting && (
            <button
              onClick={onEndMeeting}
              className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition shadow-md flex items-center gap-2 text-xs"
              title="End Discussion and Generate Report"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Discussion & View Report</span>
            </button>
          )}
        </div>

        {/* Text Fallback Input */}
        <form onSubmit={handleManualTextSubmit} className="flex-1 max-w-lg flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Speak aloud or type your counter-offer / justification here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-xs"
          />
          <button
            type="submit"
            disabled={isProcessing || !textInput.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
