import { Stack } from "expo-router";
import React from "react";

export default function MyAccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen
                name="edit"
                options={{
                    animation: "slide_from_bottom",
                }}
            />
        </Stack>
    );
}
