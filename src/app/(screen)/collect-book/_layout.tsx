import { Stack } from "expo-router";

export default function CollectBookScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="add" options={{
  presentation: "card",
  animation: "slide_from_right"
}} />

<Stack.Screen name="edit-record" options={{
  presentation: "modal",
  animation: "slide_from_left"
}} />

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
