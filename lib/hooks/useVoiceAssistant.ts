// useVoiceAssistant.ts
import { useRef, useState, useEffect } from "react";
import { getToken } from "@/lib/storage/token";
import { File } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import {
  setAudioModeAsync,
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.10.86:8000";

type TextCommandResponse = any;

function extractAssistantText(payload: any): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload?.response === "string") return payload.response;
  if (typeof payload?.response?.response === "string") return payload.response.response;
  if (typeof payload?.response?.message === "string") return payload.response.message;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.command_result?.message === "string") return payload.command_result.message;
  return "";
}

export function useVoiceAssistant() {
  const playbackRef = useRef<AudioPlayer | null>(null);
  const playbackCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTtsFileRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Accumulates the live transcript as words come in
  const transcriptRef = useRef<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastResult, setLastResult] = useState<TextCommandResponse | null>(null);

  // ─── Speech recognition event listeners ──────────────────────────────────

  // Live interim results — updates "Heard:" in real time while user speaks
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    transcriptRef.current = transcript;
    if (isMountedRef.current) setLastText(transcript);
  });

  // Recognition ended — fire the command with the final transcript
  useSpeechRecognitionEvent("end", async () => {
    if (isMountedRef.current) setIsRecording(false);

    const finalText = transcriptRef.current.trim();
    if (!finalText) {
      setIsLoading(false);
      return;
    }

    try {
      await _sendCommand(finalText, { playback: true });
    } catch (e) {
      console.error("[STT] Error sending command after recognition ended:", e);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("[STT] Recognition error:", event.error, event.message);
    if (isMountedRef.current) {
      setIsRecording(false);
      setIsLoading(false);
    }
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;

      if (playbackCheckIntervalRef.current) {
        clearInterval(playbackCheckIntervalRef.current);
        playbackCheckIntervalRef.current = null;
      }

      const player = playbackRef.current;
      if (player) {
        try { player.pause(); } catch {}
        try { player.release(); } catch {}
      }

      const lastFile = lastTtsFileRef.current;
      if (lastFile) {
        try { new File(lastFile).delete(); } catch {}
        lastTtsFileRef.current = null;
      }

      ExpoSpeechRecognitionModule.abort();
      setAudioModeAsync({ playsInSilentMode: false, allowsRecording: false }).catch(() => {});
    };
  }, []);

  // ─── Playback helpers ─────────────────────────────────────────────────────

  async function stopPlayback() {
    const p = playbackRef.current;
    if (!p) return;

    playbackRef.current = null;

    if (playbackCheckIntervalRef.current) {
      clearInterval(playbackCheckIntervalRef.current);
      playbackCheckIntervalRef.current = null;
    }

    try { await p.pause(); } catch (e) { console.error("Error pausing playback:", e); }
    try { await p.release(); } catch (e) { console.error("Error releasing player:", e); }

    if (isMountedRef.current) setIsPlayingBack(false);

    const lastFile = lastTtsFileRef.current;
    if (lastFile) {
      try { new File(lastFile).delete(); } catch {}
      lastTtsFileRef.current = null;
    }

    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    } catch (e) {
      console.error("Error resetting audio mode after playback:", e);
    }
  }

  async function _playbackUri(uri: string) {
    await stopPlayback();

    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    } catch (e) {
      console.error("Error setting playback mode:", e);
    }

    const player = createAudioPlayer(uri);
    playbackRef.current = player;

    if (isMountedRef.current) setIsPlayingBack(true);

    playbackCheckIntervalRef.current = setInterval(() => {
      if (!playbackRef.current || playbackRef.current !== player) {
        clearInterval(playbackCheckIntervalRef.current!);
        playbackCheckIntervalRef.current = null;
        return;
      }
      try {
        const currentTime = player.currentTime;
        const duration = player.duration;
        if (duration > 0 && currentTime >= duration - 0.1) {
          clearInterval(playbackCheckIntervalRef.current!);
          playbackCheckIntervalRef.current = null;
          stopPlayback();
        }
      } catch {
        clearInterval(playbackCheckIntervalRef.current!);
        playbackCheckIntervalRef.current = null;
      }
    }, 100);

    player.play();
  }

  async function fetchAndPlayTts(text: string) {
    const t = text.trim();
    if (!t) return;

    await stopPlayback();

    const token = await getToken();
    const headers: Record<string, string> = { Accept: "audio/mpeg" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `${BASE_URL}/voice/tts?text=${encodeURIComponent(t)}`;
    const res = await fetch(url, { method: "GET", headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        typeof err?.detail === "string"
          ? err.detail
          : err?.message ?? `TTS failed (${res.status})`
      );
    }

    const ab = await res.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    const fileUri = `${FileSystemLegacy.cacheDirectory ?? ""}neura_tts_${Date.now()}.mp3`;
    await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    await _playbackUri(fileUri);
    lastTtsFileRef.current = fileUri;
  }

  // ─── Core command sender (shared by voice + text paths) ──────────────────

  async function _sendCommand(text: string, options?: { playback?: boolean }) {
    const playbackAssistantTts = options?.playback ?? true;
    const q = text.trim();
    if (!q) throw new Error("Text is empty");

    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    setIsLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/voice/command?text=${encodeURIComponent(q)}`,
        { method: "GET", headers }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err?.detail === "string"
            ? err.detail
            : err?.message ?? `Command failed (${res.status})`
        );
      }

      const json = (await res.json()) as TextCommandResponse;

      if (isMountedRef.current) {
        setLastText(q);
        setLastResult(json);
      }

      if (playbackAssistantTts) {
        const assistantText = extractAssistantText(json);
        if (assistantText) await fetchAndPlayTts(assistantText);
      }

      return json;
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async function startRecording() {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) throw new Error("Microphone / speech recognition permission not granted");

    await stopPlayback();

    transcriptRef.current = "";
    if (isMountedRef.current) {
      setLastText("");
      setLastResult(null);
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,           // live transcript updates in "Heard:" field
      requiresOnDeviceRecognition: true, // Apple on-device SFSpeechRecognizer, no server
      addsPunctuation: true,
    });

    if (isMountedRef.current) setIsRecording(true);
  }

  // Called by VoiceAssistant on onPressOut — stops recognition, "end" event fires the command
  async function stopAndSend(_options?: { executeCommand?: boolean; playback?: boolean }) {
    ExpoSpeechRecognitionModule.stop();
    // "end" event listener above handles the rest
  }

  // Called by the keyboard sheet — same backend route, no STT involved
  async function sendTextCommand(text: string) {
    return _sendCommand(text, { playback: true });
  }

  return {
    isRecording,
    isLoading,
    isPlayingBack,
    lastText,
    lastResult,
    startRecording,
    stopAndSend,
    stopPlayback,
    sendTextCommand,
  };
}