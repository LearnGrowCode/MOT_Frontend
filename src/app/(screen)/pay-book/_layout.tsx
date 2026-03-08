import { Stack } from "expo-router";

export default function PayBookScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="add" />
      <Stack.Screen
        name="edit-record"
        options={{
          animation: "slide_from_left",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="filter" options={{
        presentation: "formSheet",
        animation: "slide_from_bottom",
        // @ts-ignore
        sheetAllowedDetents: ["content", 0.9],
        sheetGrabberVisible: true,
        sheetExpandsWhenScrolledToEdge: false,
      }} />
      <Stack.Screen name="delete" options={{
        presentation: "modal",
        animation: "slide_from_right",
      }} />
      <Stack.Screen name="options" options={{
        presentation: "formSheet",
        animation: "slide_from_bottom",
        // @ts-ignore
        sheetAllowedDetents: ["content"],
        sheetGrabberVisible: true,
        sheetExpandsWhenScrolledToEdge: false,
      }} />
    </Stack>
  );
}
