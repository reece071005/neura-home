import React, { useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, Image, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";

import GradientButton from "@/components/general/GradientButton";

import { addUserFace } from "@/lib/api/faces";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function FaceCaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraHeight, setCameraHeight] = useState(0);

  const [permission, requestPermission] = useCameraPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);



  /**
   * NEW SIZING
   * Much bigger + proper oval shape
   */
  const ovalWidth = useMemo(() => {
    return Math.round(SCREEN_W * 0.82); // BIG — fills most width
  }, []);

  const ovalHeight = useMemo(() => {
    return Math.round(ovalWidth * 1.28); // taller for face framing
  }, [ovalWidth]);

  // PERFECT CENTERING
  const ovalTop = useMemo(() => {
    if (!cameraHeight) return 0;
    return Math.round((cameraHeight - ovalHeight) / 2);
  }, [cameraHeight, ovalHeight]);

  if (!permission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-h3 font-bold text-black text-center">Camera access needed</Text>
          <Text className="mt-2 text-hint text-textSecondary text-center">
            We use your camera to capture a clear face photo for recognition.
          </Text>

          <View className="mt-6 w-full">
            <GradientButton title="Allow camera" onPress={requestPermission} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current || taking) return;

    try {
      setTaking(true);

      const pic = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
        base64: false,
      });

      if (pic?.uri) setPhotoUri(pic.uri);
    } catch (e) {
      console.error("takePhoto error", e);
    } finally {
      setTaking(false);
    }
  }

  function retake() {
    setPhotoUri(null);
  }

  async function usePhoto() {
      if (!photoUri) return;
      try {
          setUploading(true);
          setUploadError(null);
          await addUserFace({ photoUri });
          setPhotoUri(null); // ← reset before leaving
          router.replace("/settings/account/accountPage");
      } catch (e: any) {
          setUploadError(e.message ?? "Upload failed. Please try again.");
      } finally {
          setUploading(false);
      }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
          <Pressable onPress={() => router.replace("/settings/account/accountPage")}>
            <Text className="text-white text-base">Back</Text>
          </Pressable>

          <Text className="text-white text-base font-semibold">Face photo</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Camera / Preview */}
        <View style={{ flex: 1}}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />
          ) : (
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
          )}

          {/* BIG CENTERED OVAL GUIDE */}
          {!photoUri && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                flex: 1
              }}
            >
              {/* TOP DIM */}
              <View style={{height: ovalTop, backgroundColor: "rgba(0,0,0,0.6)"}} />

              {/* MIDDLE */}
              <View style={{ flexDirection: "row", height: ovalHeight}}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />

                {/* OVAL */}
                <View
                  style={{
                    width: ovalWidth,
                    height: ovalHeight,
                    borderRadius: ovalHeight / 2,
                    borderWidth: 3,
                    borderColor: "rgba(255,255,255,0.95)",
                    shadowColor: "#fff",
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                  }}
                />

                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
              </View>

              {/* BOTTOM DIM */}
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />

              {/* TEXT */}
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: ovalTop + ovalHeight + 20,
                  alignItems: "center",
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                  Center your face in the frame
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6, textAlign: "center" }}>
                  Good lighting • No sunglasses • Look straight ahead
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom controls */}
        <View className="px-6 pt-4 pb-6 bg-black">
          {uploadError && (
            <Text style={{ color: "#FF4D4D", textAlign: "center", marginBottom: 10, fontSize: 13 }}>
              {uploadError}
            </Text>
          )}

          {photoUri ? (
            <View className="flex-row items-center justify-between">
              <Pressable onPress={retake} className="py-3 px-4">
                <Text className="text-white">Retake</Text>
              </Pressable>
              <View className="flex-1 ml-4">
                <GradientButton
                  title={uploading ? "Uploading..." : "Use photo"}
                  onPress={usePhoto}
                  disabled={uploading}
                />
              </View>
            </View>
          ) : (
            <View className="items-center">
              <Pressable
                onPress={takePhoto}
                disabled={taking}
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: 41,
                  borderWidth: 5,
                  borderColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: taking ? 0.6 : 1,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "white",
                  }}
                />
              </Pressable>

              <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 12 }}>
                Tap to capture
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}