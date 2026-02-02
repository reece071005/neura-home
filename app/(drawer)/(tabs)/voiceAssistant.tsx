import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useVoiceAssistant } from "@/lib/hooks/useVoiceAssistant";

const Chip = ({ label }: { label: string }) => {
  return (
    <Pressable className="px-4 py-2 rounded-full border border-gray-300 bg-white">
      <Text className="text-black text-subtext font-medium">{label}</Text>
    </Pressable>
  );
};

const VoiceAssistant = () => {
  // ✅ Hook
  const { isRecording, lastText, lastResult, startRecording, stopAndSend } =
    useVoiceAssistant();

  // Optional: show errors / loading UI
  const [errorMsg, setErrorMsg] = useState<string>("");

  /* ---------------- Mic pulse animation ---------------- */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      scaleAnim.setValue(1);

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.75,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoop.start();
    } else {
      scaleAnim.stopAnimation(() => scaleAnim.setValue(1));
    }

    return () => {
      pulseLoop?.stop();
    };
  }, [isRecording, scaleAnim]);

  /* ---------------- Bottom sheet keyboard ---------------- */
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(420)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");

  const openSheet = () => setSheetOpen(true);

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 420,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetOpen(false);
      setText("");
    });
  };

  useEffect(() => {
    if (!sheetOpen) return;

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => inputRef.current?.focus(), 80);
    });
  }, [sheetOpen, backdrop, sheetY]);

  const onSend = () => {
    if (!text.trim()) return;
    // TODO: send text to /voice/command (separate)
    closeSheet();
  };

  const assistantMessage =
    lastResult?.command_result?.message ||
    lastResult?.message ||
    "";

  return (
    <View className="flex-1">
      {/* Main white panel */}
      <View className="flex-1 px-5 pt-36 pb-6">
        <View className="flex-1 bg-white rounded-3xl px-6 pt-6">
          <Text className="text-h3 font-bold text-black">
            Good Morning, User!
          </Text>
          <Text className="text-body font-medium text-black mt-2">
            What can I help you with?
          </Text>

          {/* Suggestion chips */}
          <View className="mt-6 flex-row flex-wrap gap-3">
            <Chip label="Turn on the lights" />
            <Chip label="Close the blinds" />
            <Chip label="Add device" />
            <Chip label="What are the latest deliveries" />
            <Chip label="Show me the camera feeds" />
          </View>

          {/* ✅ Display transcript + result */}
          <View className="mt-6">
            <Text className="text-textSecondary font-medium text-subtext">
              Heard:
            </Text>
            <Text className="text-black font-semibold mt-1">
              {lastText ? lastText : "—"}
            </Text>

            <Text className="text-textSecondary font-medium text-subtext mt-4">
              Assistant:
            </Text>
            <Text className="text-black font-semibold mt-1">
              {assistantMessage ? assistantMessage : "—"}
            </Text>

            {!!errorMsg && (
              <Text className="text-red-500 font-medium text-subtext mt-3">
                {errorMsg}
              </Text>
            )}
          </View>

          {/* ✅ Mic button: press & hold */}
          <View className="mt-auto pb-10 items-center">
            <Pressable
              onPressIn={async () => {
                try {
                  setErrorMsg("");
                  await startRecording();
                } catch (e: any) {
                  setErrorMsg(e?.message ?? "Failed to start recording");
                }
              }}
              onPressOut={async () => {
                try {
                  setErrorMsg("");
                  await stopAndSend({ executeCommand: true });
                } catch (e: any) {
                  setErrorMsg(e?.message ?? "Failed to process audio");
                }
              }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 999,
                    backgroundColor: isRecording ? "#ff4d4d" : "#4AA8FF",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowOpacity: 0.22,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  <MaterialIcons name="mic" size={36} color="white" />
                </View>
              </Animated.View>
            </Pressable>

            <Text className="mt-3 text-textSecondary font-medium text-subtext">
              {isRecording ? "Listening..." : "Hold to talk"}
            </Text>
          </View>

          {/* Keyboard button */}
          <View className="absolute right-5 bottom-5">
            <Pressable
              onPress={openSheet}
              className="w-10 h-10 rounded-full items-center justify-center bg-gray-100"
              style={{
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <MaterialIcons name="keyboard" size={18} color="#3C7BFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom sheet */}
      <Modal visible={sheetOpen} transparent animationType="none">
        {/* Backdrop */}
        <Pressable onPress={closeSheet} style={{ flex: 1 }}>
          <Animated.View
            style={{
              flex: 1,
              opacity: backdrop,
              backgroundColor: "rgba(0,0,0,0.32)",
            }}
          />
        </Pressable>

        {/* Sheet */}
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

              <Text className="text-black font-bold text-body">
                Type your request
              </Text>
              <Text className="text-textSecondary font-medium text-subtext mt-1">
                Example: “Turn off the living room lights”
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
