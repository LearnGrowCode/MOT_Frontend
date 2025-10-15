import { Drawer } from "expo-router/drawer";

export default function AuthLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: true,
                drawerStyle: { backgroundColor: "#1f2937" },
                drawerActiveTintColor: "#3b82f6",
                drawerInactiveTintColor: "#9ca3af",
            }}
        >
            <Drawer.Screen name='index' options={{ title: "Home" }} />
            <Drawer.Screen name='analysis' options={{ title: "Analysis" }} />
            <Drawer.Screen
                name='my-account'
                options={{ title: "My Account" }}
            />
            <Drawer.Screen
                name='collect-book'
                options={{ title: "Collect Book" }}
            />
            <Drawer.Screen name='pay-book' options={{ title: "Pay Book" }} />
        </Drawer>
    );
}
