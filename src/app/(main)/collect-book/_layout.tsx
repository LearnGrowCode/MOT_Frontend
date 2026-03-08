import { Stack } from "expo-router";

export default function CollectBookLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='index' options={{ title: "Collect Book" }} />
        </Stack>
    );
}
