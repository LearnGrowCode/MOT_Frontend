import { Stack } from "expo-router";

export default function PayBookLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='index' options={{ title: "Pay Book" }} />
            <Stack.Screen
                name='add-record'
                options={{
                    title: "Add Record",
                    presentation: "formSheet",
                    sheetAllowedDetents: [1],
                    sheetInitialDetentIndex: 0,
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='edit-record'
                options={{
                    title: "Edit Record",
                    presentation: "formSheet",
                    sheetAllowedDetents: [1],
                    sheetInitialDetentIndex: 0,
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="options"
                options={{
                    presentation: 'formSheet',
                    sheetAllowedDetents: [0.5],
                    sheetInitialDetentIndex: 0,
                    headerShown: false,
                }}
                
            />
            <Stack.Screen
                name="filter"
                options={{
                    presentation: 'formSheet',
                    sheetAllowedDetents: [1],
                    sheetInitialDetentIndex: 0,
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="delete"
                options={{
                    presentation: 'formSheet',
                    sheetAllowedDetents: [0.75],
                    sheetInitialDetentIndex: 0,
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
