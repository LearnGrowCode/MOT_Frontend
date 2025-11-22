import { Stack } from "expo-router";

export default function CollectBookLayout() {
    return (
        <Stack
            screenOptions={{
                animation: "slide_from_right",
                headerShown: false,
            }}
        >
            <Stack.Screen name='index' options={{ title: "Collect Book" }} />
            <Stack.Screen
                name='add-record'
                options={{
                    title: "Add Record",
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name='edit-record'
                options={{
                    title: "Edit Record",
                    animation: "slide_from_right",
                }}
            />
        </Stack>
    );
}
