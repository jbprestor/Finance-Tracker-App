import { Stack, useRouter, useSegments } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/authContext";
import "../global.css";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

import { colors } from "../constants/theme";

// ... existing imports

const MainLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // const inAuthGroup = segments[0] === "(group)"; // adjust based on folder structure
    // Actually, let's use the logic from before
    const firstSegment = segments[0] as string | undefined;
    const inAuthRoute = !firstSegment || firstSegment === "sign-in" || firstSegment === "sign-up" || firstSegment === "welcome";

    if (!user && !inAuthRoute) {
      // Redirect to welcome if accessing protected route without user
      router.replace("/welcome");
    } else if (user && inAuthRoute && firstSegment !== undefined) {
      // Redirect to home if user is logged in and trying to access auth screens
      router.replace("/(tabs)/home");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.neutral900 }
    }} />
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
});
