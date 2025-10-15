import { Stack } from "expo-router";

export default function PayBookLayout() {
    return (
        <Stack
            screenOptions={{
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name='index' options={{ title: "Pay Book" }} />
            <Stack.Screen
                name='add-record/index'
                options={{
                    title: "Add Record",
                    animation: "slide_from_right",
                }}
            />
        </Stack>
    );
}
