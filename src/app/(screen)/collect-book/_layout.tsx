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


<Stack.Screen name="delete" options={{
  presentation: "modal",
  animation: "slide_from_right",
}} />

    </Stack>
  );
}
