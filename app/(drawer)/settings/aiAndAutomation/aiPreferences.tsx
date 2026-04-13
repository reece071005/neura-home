import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import SectionCard from "@/components/aiAndAutomation/SectionCard";
import ConfirmDialog from "@/components/general/ConfirmDialog";
import GradientButton from "@/components/general/GradientButton";

import {
  getRoomAiPreferences,
  setRoomAiPreferences,
  getTrainingPreferences,
  setTrainingPreferences,
  getTrainingReadiness,
  trainRoomModel,
} from "@/lib/api/ai/aiTraining";

type TrainingFrequency = "daily" | "weekly" | "monthly";

const FREQUENCIES: TrainingFrequency[] = [
  "daily",
  "weekly",
  "monthly",
];

export default function AiPreferencesScreen() {
  const { room, roomId, id } = useLocalSearchParams<{
    room?: string;
    roomId?: string;
    id?: string;
  }>();

  const targetRoomId = roomId ?? id ?? "";

  const [aiEnabled, setAiEnabled] = useState(false);
  const [autoTraining, setAutoTraining] = useState(false);
  const [trainingFrequency, setTrainingFrequency] =
    useState<TrainingFrequency>("weekly");

  const [lastTrainedAt, setLastTrainedAt] = useState<string | null>(null);

  const [daysCollected, setDaysCollected] = useState(0);
  const [daysRequired, setDaysRequired] = useState(0);
  const [canTrain, setCanTrain] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  // Calculate days remaining
  const daysRemaining = Math.max(0, daysRequired - daysCollected);

  const progressPercentage =
    daysRequired > 0 ? Math.min(100, (daysCollected / daysRequired) * 100) : 0;

  /* -----------------------------
     LOAD DATA
  ----------------------------- */

  useEffect(() => {
    const load = async () => {
      if (!room) return;

      try {
        const aiPrefs = await getRoomAiPreferences(room);
        setAiEnabled(aiPrefs.preferences.enabled);
      } catch (err) {
        console.log("Room AI prefs load error", err);
      }

      try {
        const trainingPrefs = await getTrainingPreferences(room);
        if (trainingPrefs?.preferences) {
          setAutoTraining(trainingPrefs.preferences.enabled);
          setTrainingFrequency(trainingPrefs.preferences.frequency);
          setLastTrainedAt(trainingPrefs.preferences.last_trained_at ?? null);
        }
      } catch (err) {
        console.log("Training prefs load error", err);
      }

      try {
        const readiness = await getTrainingReadiness(room);
        console.log("Training readiness", readiness);

        setCanTrain(readiness.ready);
        setDaysCollected(readiness.days_available);
        setDaysRequired(readiness.min_days_required);
      } catch (err) {
        console.log("Training readiness load error", err);
      }
    };

    load();
  }, [room]);

  /* -----------------------------
     NAVIGATION
  ----------------------------- */

  const handleCancel = () => {
    if (targetRoomId) {
      router.replace({
        pathname: "/settings/aiAndAutomation/createRoom",
        params: { id: targetRoomId },
      });
    } else {
      router.back();
    }
  };

  /* -----------------------------
     SAVE SETTINGS
  ----------------------------- */

  const save = async () => {
    if (!room) return;

    try {
      // Always save AI preferences with current enabled state
      await setRoomAiPreferences(room, aiEnabled);

      // Always save training preferences with current enabled state and frequency
      await setTrainingPreferences(room, autoTraining, trainingFrequency);
    } catch (err) {
      console.log("Save failed", err);
    }

    handleCancel();
  };

  /* -----------------------------
     TRAIN MODEL
  ----------------------------- */

  const trainNow = async () => {
    if (!canTrain || !room || isTraining) return;

    setIsTraining(true);
    setTrainingError(null);

    try {
      await trainRoomModel(room);

      const now = new Date();
      const formatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      setLastTrainedAt(formatted);
      setIsTraining(false);
      setDialogVisible(true);
    } catch (err) {
      console.log("Training failed", err);
      setIsTraining(false);
      setTrainingError(
        err instanceof Error
          ? err.message
          : "Training failed. Please try again later."
      );
    }
  };

  const cycleFrequency = () => {
    const idx = FREQUENCIES.indexOf(trainingFrequency);
    const next = FREQUENCIES[(idx + 1) % FREQUENCIES.length];
    setTrainingFrequency(next);
  };

  /* -----------------------------
     UI
  ----------------------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>

      {/* HEADER */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <Pressable onPress={handleCancel} hitSlop={12}>
          <Text style={{ fontWeight: "600", color: "#111827" }}>
            Cancel
          </Text>
        </Pressable>

        <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
          {room ? `${room} AI` : "AI Preferences"}
        </Text>

        <Pressable onPress={save} hitSlop={12}>
          <Text style={{ fontWeight: "700", color: "#111827" }}>
            Save
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* DATA COLLECTION */}

        {!canTrain && (
          <SectionCard title="Data Collection Status">
            <View className="px-4 py-4">

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-subtext text-black font-semibold">
                  Collecting room data
                </Text>

                <Text className="text-subtext text-blue-600 font-semibold">
                  {daysCollected}/{daysRequired} days
                </Text>
              </View>

              <View className="bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
                <View
                  style={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    backgroundColor: "#3B82F6",
                  }}
                />
              </View>

              <View className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Text className="text-hint text-amber-800">
                  <Text className="font-semibold">
                    {daysRemaining} days remaining
                  </Text>
                  {"\n"}
                  AI features will unlock once enough data is collected.
                </Text>
              </View>

            </View>
          </SectionCard>
        )}

        {/* AI BEHAVIOUR */}

        <SectionCard title="AI behaviour">

          <View
            className="px-4 py-4 flex-row items-center justify-between border-b border-gray-200"
            style={{ opacity: canTrain ? 1 : 0.5 }}
          >
            <View style={{ flex: 1 }}>
              <Text className="text-subtext text-black">
                Enable AI in this room
              </Text>

              <Text className="text-hint text-textSecondary mt-1">
                {canTrain
                  ? "Allow Neura to learn behaviour in this room"
                  : "Requires training data first"}
              </Text>
            </View>

            <Switch
              value={aiEnabled && canTrain}
              onValueChange={canTrain ? setAiEnabled : undefined}
              disabled={!canTrain}
            />
          </View>

          <View
            className="px-4 py-4 flex-row items-center justify-between border-b border-gray-200"
            style={{ opacity: canTrain ? 1 : 0.5 }}
          >
            <View>
              <Text className="text-subtext text-black">
                Automatic retraining
              </Text>

              <Text className="text-hint text-textSecondary mt-1">
                Keep the AI model up to date automatically
              </Text>
            </View>

            <Switch
              value={autoTraining && canTrain}
              onValueChange={canTrain ? setAutoTraining : undefined}
              disabled={!canTrain}
            />
          </View>

          <Pressable
            onPress={canTrain ? cycleFrequency : undefined}
            disabled={!canTrain}
            className="px-4 py-4 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-subtext text-black">
                Retraining frequency
              </Text>

              <Text className="text-hint text-textSecondary mt-1">
                {trainingFrequency}
              </Text>
            </View>

            <Text style={{ color: "#9CA3AF", fontSize: 18 }}>›</Text>
          </Pressable>

          <View className="px-4 py-4">
            <Text className="text-subtext text-black">
              Last trained
            </Text>

            <Text className="text-hint text-textSecondary mt-1">
              {lastTrainedAt ?? "Not trained yet"}
            </Text>
          </View>

        </SectionCard>

        {/* MANUAL TRAINING */}

        <SectionCard title="Manual training">

          <View className="px-4 py-4">

            <GradientButton
              title={
                isTraining
                  ? "Training in progress..."
                  : canTrain
                    ? "Train model now"
                    : "Collecting data..."
              }
              onPress={trainNow}
              disabled={!canTrain || isTraining}
            />

            {isTraining && (
              <View className="flex-row items-center justify-center mt-3">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-hint text-blue-600 ml-2">
                  Training model, please wait...
                </Text>
              </View>
            )}

            {trainingError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <Text className="text-hint text-red-800">
                  ⚠️ {trainingError}
                </Text>
              </View>
            )}

            {!isTraining && !trainingError && (
              <Text className="text-hint text-textSecondary mt-3">
                {canTrain
                  ? "Retraining may take several minutes depending on available data."
                  : `Training available after ${daysRemaining} more days.`}
              </Text>
            )}

          </View>

        </SectionCard>

      </ScrollView>

      <ConfirmDialog
        visible={dialogVisible}
        title="Training completed"
        message="Neura has successfully retrained the model."
        confirmText="OK"
        onConfirm={() => setDialogVisible(false)}
        onCancel={() => setDialogVisible(false)}
      />

    </SafeAreaView>
  );
}