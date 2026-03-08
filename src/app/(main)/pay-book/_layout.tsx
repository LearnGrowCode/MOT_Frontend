import { Stack } from "expo-router";

export default function PayBookLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='index' options={{ title: "Pay Book" }} />
        </Stack>
    );
}
