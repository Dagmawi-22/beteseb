import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ChatProvider, useChatContext } from "../context/ChatContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { currentUser } = useChatContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inTabs = segments[0] === "(tabs)";

    if (!currentUser?.isOnboarded && inTabs) {
      router.replace("/onboarding");
    } else if (currentUser?.isOnboarded && segments[0] === "onboarding") {
      router.replace("/(tabs)");
    }
  }, [currentUser?.isOnboarded, segments]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-contact" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  if (!__DEV__) {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ChatProvider>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </ChatProvider>
    </ThemeProvider>
  );
}
