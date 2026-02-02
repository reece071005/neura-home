import { useRef, useState } from "react";
import { Audio } from "expo-av";
import { getToken } from "@/lib/storage/token";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

type SttResponse = {
  success: boolean;
  message?: string;
  transcribed_text?: string;
  intent_data?: any;
  command_result?: { success: boolean; message: string };
};

type RecState = "idle" | "starting" | "recording" | "stopping";

export function useVoiceAssistant() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const stateRef = useRef<RecState>("idle");

  const [isRecording, setIsRecording] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastResult, setLastResult] = useState<SttResponse | null>(null);

  async function startRecording() {
    // ✅ Guard: no double start
    if (stateRef.current === "starting" || stateRef.current === "recording") return;

    stateRef.current = "starting";

    try {
      // If something is left over, clean it up first
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        recordingRef.current = null;
      }

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) throw new Error("Mic permission not granted");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      recordingRef.current = recording;

      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      stateRef.current = "recording";
      setIsRecording(true);
    } catch (e) {
      // Reset everything if start fails
      stateRef.current = "idle";
      setIsRecording(false);
      recordingRef.current = null;
      throw e;
    }
  }

  async function stopAndSend(options?: { executeCommand?: boolean }) {
    const executeCommand = options?.executeCommand ?? true;

    // ✅ Guard: only stop if currently recording
    if (stateRef.current !== "recording") return;

    stateRef.current = "stopping";
    setIsRecording(false);

    const recording = recordingRef.current;
    recordingRef.current = null;

    try {
      if (!recording) {
        stateRef.current = "idle";
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error("No recording URI");
      // ✅ DEBUG: play back what we just recorded
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();

      // optional: unload later so it doesn’t leak memory
      setTimeout(() => {
        sound.unloadAsync();
      }, 4000);

      const form = new FormData();
      form.append("file", {
        uri,
        name: "voice.m4a",
        type: "audio/mp4",
      } as any);

      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const url = `${BASE_URL}/voice/stt?execute_command=${executeCommand ? "true" : "false"}`;

      const res = await fetch(url, { method: "POST", headers, body: form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err?.detail === "string"
            ? err.detail
            : err?.message || `STT failed (${res.status})`
        );
      }

      const json = (await res.json()) as SttResponse;
      setLastResult(json);
      setLastText(json.transcribed_text ?? "");
      return json;
    } finally {
      stateRef.current = "idle";
    }
  }

  return { isRecording, lastText, lastResult, startRecording, stopAndSend };
}
