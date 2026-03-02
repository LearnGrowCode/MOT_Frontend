import "react-native-get-random-values";
import "@/global.css";
import { Stack } from "expo-router";
import { AppProviders } from "./_providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Pay Book Actions */}
        <Stack.Screen
          name="(actions)/pay-add"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/pay-edit"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/pay-options"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.5],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/pay-filter"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/pay-delete"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.6],
            sheetInitialDetentIndex: 0,
          }}
        />

        {/* Collect Book Actions */}
        <Stack.Screen
          name="(actions)/collect-add"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/collect-edit"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/collect-options"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.6],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/collect-filter"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/collect-delete"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.6],
            sheetInitialDetentIndex: 0,
          }}
        />
        <Stack.Screen
          name="(actions)/collect-reminder"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [1],
            sheetInitialDetentIndex: 0,
          }}
        />
      </Stack>
    </AppProviders>
  );
}