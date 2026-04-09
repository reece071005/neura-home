// VoiceAssistant.tsx
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useVoiceAssistant } from "@/lib/hooks/useVoiceAssistant";

const VoiceAssistant = () => {
  const {
    isRecording,
    isPlayingBack,
    isLoading,
    lastText,
    lastResult,
    recognitionError,
    startRecording,
    stopAndSend,
    stopPlayback,
    sendTextCommand,
    clearRecognitionError,
  } = useVoiceAssistant();

  const [errorMsg, setErrorMsg] = useState<string>("");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      scaleAnim.setValue(1);
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 0.75, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    } else {
      scaleAnim.stopAnimation(() => scaleAnim.setValue(1));
    }
    return () => { pulseLoop?.stop(); };
  }, [isRecording, scaleAnim]);

  useEffect(() => {
    return () => { stopPlayback(); };
  }, []);

  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(420)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");

  const openSheet = () => setSheetOpen(true);

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 420, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => { setSheetOpen(false); setText(""); });
  };

  useEffect(() => {
    if (!sheetOpen) return;
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => { setTimeout(() => inputRef.current?.focus(), 80); });
  }, [sheetOpen, backdrop, sheetY]);

  const onSend = async () => {
    if (!text.trim()) return;
    try {
      setErrorMsg("");
      clearRecognitionError();
      await stopPlayback();
      await sendTextCommand(text);
      closeSheet();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to send command");
    }
  };

  const assistantMessage =
    typeof lastResult?.response === "string" ? lastResult.response
    : typeof (lastResult as any)?.response?.response === "string" ? (lastResult as any).response.response
    : typeof (lastResult as any)?.response?.message === "string" ? (lastResult as any).response.message
    : typeof (lastResult as any)?.message === "string" ? (lastResult as any).message
    : "";

  return (
    <View className="flex-1">
      <View className="flex-1 px-5 pt-36 pb-6">
        <ScrollView
          className="flex-1 bg-white rounded-3xl px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-h3 font-bold text-black">Good Morning, User!</Text>
          <Text className="text-body font-medium text-black mt-2">What can I help you with?</Text>
          <Text className="text-textSecondary font-medium text-subtext mt-3">
            Press and hold the mic to speak, or use the keyboard button to type.
          </Text>

          <View className="mt-8">
            <Text className="text-textSecondary font-medium text-subtext">Heard:</Text>
            <Text className="text-black font-semibold mt-1">{lastText || "—"}</Text>

            <Text className="text-textSecondary font-medium text-subtext mt-4">Assistant:</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4AA8FF" style={{ marginTop: 8, alignSelf: "flex-start" }} />
            ) : assistantMessage ? (
              <Markdown style={{
                body: { color: "#000", fontWeight: "600", fontSize: 14 },
                strong: { fontWeight: "800" },
                bullet_list: { marginTop: 4 },
                ordered_list: { marginTop: 4 },
                code_inline: { backgroundColor: "#f3f4f6", borderRadius: 4, paddingHorizontal: 4 },
                fence: { backgroundColor: "#f3f4f6", borderRadius: 8, padding: 8 },
              }}>
                {assistantMessage}
              </Markdown>
            ) : (
              <Text className="text-black font-semibold mt-1">—</Text>
            )}

            {!!(errorMsg || recognitionError) && (
              <Text className="text-red-500 font-medium text-subtext mt-3">
                {errorMsg || recognitionError}
              </Text>
            )}
          </View>

          <View className="mt-auto pt-8 pb-4 items-center">
            <Pressable
              onPressIn={async () => {
                try {
                  setErrorMsg("");
                  clearRecognitionError();
                  await stopPlayback();
                  await startRecording();
                } catch (e: any) {
                  setErrorMsg(e?.message ?? "Failed to start recording");
                }
              }}
              onPressOut={async () => {
                try {
                  setErrorMsg("");
                  clearRecognitionError();
                  await stopAndSend({ executeCommand: true, playback: true });
                } catch (e: any) {
                  setErrorMsg(e?.message ?? "Failed to process audio");
                }
              }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 999,
                  backgroundColor: isRecording ? "#ff4d4d" : "#4AA8FF",
                  alignItems: "center", justifyContent: "center",
                  shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
                }}>
                  <MaterialIcons name="mic" size={36} color="white" />
                </View>
              </Animated.View>
            </Pressable>

            <Text className="mt-3 text-textSecondary font-medium text-subtext">
              {isRecording ? "Listening..." : isPlayingBack ? "Playing back..." : "Hold to talk"}
            </Text>

            {isPlayingBack && (
              <Pressable onPress={stopPlayback} className="mt-3 px-4 py-2 rounded-full bg-gray-100">
                <Text className="text-black font-semibold">Stop playback</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        <View className="absolute right-9 bottom-10">
          <Pressable
            onPress={openSheet}
            className="w-10 h-10 rounded-full items-center justify-center bg-gray-100"
            style={{ shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}
          >
            <MaterialIcons name="keyboard" size={18} color="#3C7BFF" />
          </Pressable>
        </View>
      </View>

      <Modal visible={sheetOpen} transparent animationType="none">
        <Pressable onPress={closeSheet} style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, opacity: backdrop, backgroundColor: "rgba(0,0,0,0.32)" }} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <Animated.View style={{ transform: [{ translateY: sheetY }] }}>
            <View className="bg-white rounded-t-3xl px-5 pt-4 pb-6">
              <View className="items-center pb-3">
                <View className="w-12 h-1.5 rounded-full bg-gray-300" />
              </View>

              <Text className="text-black font-bold text-body">Type your request</Text>
              <Text className="text-textSecondary font-medium text-subtext mt-1">
                Example: "Turn off the living room lights"
              </Text>

              <View className="mt-4 flex-row items-center gap-3">
                <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
                  <TextInput
                    ref={inputRef}
                    value={text}
                    onChangeText={setText}
                    placeholder="Type here…"
                    placeholderTextColor="#9CA3AF"
                    className="text-black"
                    returnKeyType="send"
                    onSubmitEditing={onSend}
                  />
                </View>
                <Pressable
                  onPress={onSend}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: "#3C7BFF" }}
                >
                  <MaterialIcons name="send" size={18} color="white" />
                </Pressable>
              </View>

              <Pressable onPress={closeSheet} className="mt-4 items-center">
                <Text className="text-primaryTo font-semibold">Close</Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default VoiceAssistant;
