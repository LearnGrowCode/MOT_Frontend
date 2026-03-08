import { Stack } from "expo-router";

export default function PayBookLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Pay Book" }} />
            <Stack.Screen
                name="filter"
                options={{
                    presentation: "formSheet",
                    animation: "slide_from_bottom",
                    sheetAllowedDetents: [0.75, 1],
                    sheetGrabberVisible: true,
                    sheetExpandsWhenScrolledToEdge: false,
                }}
            />
            <Stack.Screen
                name="options"
                options={{
                    presentation: "formSheet",
                    animation: "slide_from_bottom",
                    sheetAllowedDetents: [0.5, 1],
                    sheetGrabberVisible: true,
                    sheetExpandsWhenScrolledToEdge: false,
                }}
            />
            <Stack.Screen
                name="confirm"
                options={{
                    presentation: "formSheet",
                    animation: "slide_from_bottom",
                    sheetAllowedDetents: [0.6, 1],
                    sheetGrabberVisible: true,
                    sheetExpandsWhenScrolledToEdge: false,
                }}
            />
        </Stack>
    );
}
