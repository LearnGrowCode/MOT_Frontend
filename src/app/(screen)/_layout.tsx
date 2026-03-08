import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenLayout() {
  return (
     <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">

    <Stack
      screenOptions={{
          headerShown: false,
        }}
        >
      <Stack.Screen name="collect-book" />
      <Stack.Screen name="pay-book" />
      <Stack.Screen name="account" />
    </Stack>
        </SafeAreaView>
  );
}
