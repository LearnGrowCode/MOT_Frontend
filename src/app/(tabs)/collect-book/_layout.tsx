import { Stack } from "expo-router";

export default function CollectBookLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='index' options={{ title: "Collect Book" }} />
            <Stack.Screen
                name='add-record'
                options={{
                    title: "Add Record",
                    animation: "slide_from_bottom",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name='edit-record'
                options={{
                    title: "Edit Record",
                    animation: "slide_from_bottom",
                    presentation: "modal",
                }}
            />
        </Stack>
    );
}
