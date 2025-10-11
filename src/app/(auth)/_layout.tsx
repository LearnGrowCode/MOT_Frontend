import { Drawer } from "expo-router/drawer";

export default function AuthLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: true,
                drawerStyle: {
                    backgroundColor: "#1f2937",
                },
                drawerActiveTintColor: "#3b82f6",
                drawerInactiveTintColor: "#9ca3af",
            }}
        >
            <Drawer.Screen
                name='index'
                options={{
                    title: "Home",
                }}
            />
            <Drawer.Screen
                name='analysis/index'
                options={{
                    title: "Analysis",
                }}
            />
            <Drawer.Screen
                name='my-account/index'
                options={{
                    title: "My Account",
                }}
            />
            <Drawer.Screen
                name='to-collect/index'
                options={{
                    title: "To Collect",
                }}
            />
            <Drawer.Screen
                name='to-pay/index'
                options={{
                    title: "To Pay",
                }}
            />
        </Drawer>
    );
}
