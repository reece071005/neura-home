// useVoiceAssistant.ts
import { useRef, useState, useEffect } from "react";
import { getToken } from "@/lib/storage/token";
import { File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
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
  response?: any;
};

type TextCommandResponse = any;
type RecState = "idle" | "starting" | "recording" | "stopping";

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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const playbackRef = useRef<AudioPlayer | null>(null);
  const playbackCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTtsFileRef = useRef<string | null>(null);
  const stateRef = useRef<RecState>("idle");
  const isMountedRef = useRef(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastResult, setLastResult] = useState<SttResponse | null>(null);

  const isRecording = recorderState.isRecording;

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

      if (recorderState.isRecording) {
        recorder.stop().catch(() => {});
      }

      setAudioModeAsync({ playsInSilentMode: false, allowsRecording: false }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    console.log("[TTS] Player created for uri:", uri);

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
        console.log("[TTS] currentTime:", currentTime, "duration:", duration);
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
    await FileSystemLegacy.writeAsStringAsync(fileUri, base64, { encoding: FileSystemLegacy.EncodingType.Base64 });

    console.log("[TTS] File written to:", fileUri);
    await _playbackUri(fileUri);
    lastTtsFileRef.current = fileUri;
  }

  async function startRecording() {
    if (stateRef.current === "starting" || stateRef.current === "recording") {
      console.warn("Already recording or starting");
      return;
    }

    stateRef.current = "starting";

    try {
      await stopPlayback();

      if (recorderState.isRecording) {
        try {
          await recorder.stop();
          await new Promise((r) => setTimeout(r, 150));
        } catch (e) {
          console.error("Error stopping existing recording:", e);
        }
      }

      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) throw new Error("Mic permission not granted");

      await new Promise((r) => setTimeout(r, 200));
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await new Promise((r) => setTimeout(r, 50));

      await recorder.prepareToRecordAsync();
      await recorder.record();

      stateRef.current = "recording";
    } catch (e) {
      console.error("Error starting recording:", e);
      stateRef.current = "idle";
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      } catch {}
      throw e;
    }
  }

  async function stopAndSend(options?: { executeCommand?: boolean; playback?: boolean; minConfidence?: number }) {
    const executeCommand = options?.executeCommand ?? true;
    const playbackAssistantTts = options?.playback ?? true;

    //Potentially let user set this???
    const minConfidence = options?.minConfidence ?? 0.1;

    if (stateRef.current !== "recording") {
      console.warn("Not currently recording");
      return;
    }

    stateRef.current = "stopping";

    try {
      await recorder.stop();
      await new Promise((r) => setTimeout(r, 100));

      const uri = recorder.uri;
      if (!uri) throw new Error("No recording URI");

      const form = new FormData();
      form.append("file", { uri, name: "voice.m4a", type: "audio/mp4" } as any);

      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const params = new URLSearchParams({
        execute_command: executeCommand ? "true" : "false",
        min_confidence: String(minConfidence),
      });

      const url = `${BASE_URL}/voice/stt?${params.toString()}`;

      setIsLoading(true);
      const res = await fetch(url, { method: "POST", headers, body: form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err?.detail === "string"
            ? err.detail
            : err?.message ?? `STT failed (${res.status})`
        );
      }

      const json = (await res.json()) as SttResponse;

      if (isMountedRef.current) {
        setLastResult(json);
        setLastText(json.transcribed_text ?? "");
      }

      if (playbackAssistantTts) {
        const assistantText = extractAssistantText(json);
        if (assistantText) {
          await fetchAndPlayTts(assistantText);
        }
      }

      return json;
    } catch (error) {
      console.error("Error in stopAndSend:", error);
      throw error;
    } finally {
      setIsLoading(false);
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      } catch {}
      stateRef.current = "idle";
    }
  }

  async function sendTextCommand(text: string) {
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
        setLastResult(json as any);
      }

      return json;
    } finally {
      setIsLoading(false);
    }
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