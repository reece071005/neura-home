// useVoiceAssistant.ts (expo-audio version with correct playback handling)
import { useRef, useState, useEffect } from "react";
import { getToken } from "@/lib/storage/token";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.10.18:8000";

type SttResponse = {
  success: boolean;
  message?: string;
  transcribed_text?: string;
  intent_data?: any;
  command_result?: { success: boolean; message: string };
  response?: string;
};

type TextCommandResponse = any;

type RecState = "idle" | "starting" | "recording" | "stopping";

export function useVoiceAssistant() {
  // Recorder managed by hook lifecycle (expo-audio standard)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  // Playback handled via AudioPlayer instance we create/release
  const playbackRef = useRef<AudioPlayer | null>(null);
  const playbackCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<RecState>("idle");
  const isMountedRef = useRef(true);

  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastResult, setLastResult] = useState<SttResponse | null>(null);

  const isRecording = recorderState.isRecording;

  // Cleanup on unmount to prevent resource leaks
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Clear any playback check interval
      if (playbackCheckIntervalRef.current) {
        clearInterval(playbackCheckIntervalRef.current);
        playbackCheckIntervalRef.current = null;
      }

      // Cleanup playback
      const player = playbackRef.current;
      if (player) {
        try {
          player.pause();
          player.release();
        } catch (e) {
          console.error("Error cleaning up player on unmount:", e);
        }
      }

      // Cleanup recorder
      if (recorderState.isRecording) {
        recorder.stop().catch((e) => {
          console.error("Error stopping recorder on unmount:", e);
        });
      }

      // Reset audio mode
      setAudioModeAsync({
        playsInSilentMode: false,
        allowsRecording: false,
      }).catch((e) => {
        console.error("Error resetting audio mode on unmount:", e);
      });
    };
  }, []);

  async function stopPlayback() {
    const p = playbackRef.current;
    if (!p) return;

    // Clear ref FIRST to prevent double-cleanup
    playbackRef.current = null;

    // Clear any playback check interval
    if (playbackCheckIntervalRef.current) {
      clearInterval(playbackCheckIntervalRef.current);
      playbackCheckIntervalRef.current = null;
    }

    try {
      await p.pause();
    } catch (e) {
      console.error("Error pausing playback:", e);
    }

    try {
      await p.release(); // MUST release to free native resources
    } catch (e) {
      console.error("Error releasing player:", e);
    }

    if (isMountedRef.current) {
      setIsPlayingBack(false);
    }

    // Reset audio mode after playback
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch (e) {
      console.error("Error resetting audio mode after playback:", e);
    }
  }

  async function _playbackUri(uri: string) {
    // Stop any existing playback first
    await stopPlayback();

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch (e) {
      console.error("Error setting playback mode:", e);
    }

    const player = createAudioPlayer(uri);
    playbackRef.current = player;

    if (isMountedRef.current) {
      setIsPlayingBack(true);
    }

    // ✅ FIX: Use polling to check when playback finishes instead of addListener
    // expo-audio doesn't provide a completion event, so we poll the current time
    playbackCheckIntervalRef.current = setInterval(() => {
      if (!playbackRef.current || playbackRef.current !== player) {
        if (playbackCheckIntervalRef.current) {
          clearInterval(playbackCheckIntervalRef.current);
          playbackCheckIntervalRef.current = null;
        }
        return;
      }

      try {
        const currentTime = player.currentTime;
        const duration = player.duration;

        // If we've reached the end (within 100ms), stop playback
        if (duration > 0 && currentTime >= duration - 0.1) {
          if (playbackCheckIntervalRef.current) {
            clearInterval(playbackCheckIntervalRef.current);
            playbackCheckIntervalRef.current = null;
          }
          stopPlayback();
        }
      } catch (e) {
        // Player might be released, stop checking
        if (playbackCheckIntervalRef.current) {
          clearInterval(playbackCheckIntervalRef.current);
          playbackCheckIntervalRef.current = null;
        }
      }
    }, 100); // Check every 100ms

    player.play();
  }

  async function startRecording() {
    if (stateRef.current === "starting" || stateRef.current === "recording") {
      console.warn("Already recording or starting");
      return;
    }

    stateRef.current = "starting";

    try {
      // Stop playback and wait for cleanup
      await stopPlayback();

      // Ensure recorder is fully stopped before restarting
      if (recorderState.isRecording) {
        try {
          await recorder.stop();
          // Wait for recorder to fully release
          await new Promise((resolve) => setTimeout(resolve, 150));
        } catch (e) {
          console.error("Error stopping existing recording:", e);
        }
      }

      // Check permissions
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        throw new Error("Mic permission not granted");
      }

      // Give Android audio subsystem time to reset (critical for preventing buzzing)
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Set audio mode for recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // Small delay before prepare
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      await recorder.record();

      stateRef.current = "recording";
    } catch (e) {
      console.error("Error starting recording:", e);
      stateRef.current = "idle";

      // Always reset audio mode on error
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch (resetError) {
        console.error("Error resetting audio mode:", resetError);
      }

      throw e;
    }
  }

  async function stopAndSend(options?: {
    executeCommand?: boolean;
    playback?: boolean;
  }) {
    const executeCommand = options?.executeCommand ?? true;
    const playback = options?.playback ?? true;

    if (stateRef.current !== "recording") {
      console.warn("Not currently recording");
      return;
    }

    stateRef.current = "stopping";

    try {
      // Stop recording
      await recorder.stop();

      // Wait for stop to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = recorder.uri;
      if (!uri) {
        throw new Error("No recording URI");
      }

      // Play back the recording if requested
      if (playback) {
        await _playbackUri(uri);
      }

      // Prepare form data
      const form = new FormData();
      form.append("file", {
        uri,
        name: "voice.m4a",
        type: "audio/mp4",
      } as any);

      // Get auth token
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Send to backend
      const url = `${BASE_URL}/voice/stt?execute_command=${
        executeCommand ? "true" : "false"
      }`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err?.detail === "string"
            ? err.detail
            : err?.message || `STT failed (${res.status})`
        );
      }

      const json = (await res.json()) as SttResponse;

      if (isMountedRef.current) {
        setLastResult(json);
        setLastText(json.transcribed_text ?? "");
      }

      console.log(executeCommand)
      return json;
    } catch (error) {
      console.error("Error in stopAndSend:", error);
      throw error;
    } finally {
      // Always reset audio mode
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch (e) {
        console.error("Error resetting audio mode in finally:", e);
      }

      stateRef.current = "idle";
    }
  }

  async function sendTextCommand(text: string) {
    const q = text.trim();
    if (!q) {
      throw new Error("Text is empty");
    }

    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${BASE_URL}/voice/command?text=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        typeof err?.detail === "string"
          ? err.detail
          : err?.message || `Command failed (${res.status})`
      );
    }

    const json = (await res.json()) as TextCommandResponse;

    if (isMountedRef.current) {
      setLastText(q);
      setLastResult(json as any);
    }

    console.log("voice/command response:", json);
    return json;
  }

  return {
    isRecording,
    isPlayingBack,
    lastText,
    lastResult,
    startRecording,
    stopAndSend,
    stopPlayback,
    sendTextCommand,
  };
}