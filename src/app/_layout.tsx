import { Drawer } from "expo-router/drawer";
import "react-native-get-random-values";

import "@/global.css";
import { ThemeProvider } from "@react-navigation/native";
import { NAV_THEME } from "@/lib/theme";
import { useColorScheme } from "react-native";
import { PortalHost } from "@rn-primitives/portal";
import { KeyboardProvider } from "react-native-keyboard-controller";
import React from "react";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function Layout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={NAV_THEME[colorScheme as "light" | "dark"]}>
            <CurrencyProvider>
                <KeyboardProvider>
                    <PortalHost name='root' />
                    <Drawer
                        screenOptions={{
                            headerShown: true,
                            drawerStyle: { backgroundColor: "#1f2937" },
                            drawerActiveTintColor: "#3b82f6",
                            drawerInactiveTintColor: "#9ca3af",
                        }}
                    >
                        <Drawer.Screen
                            name='onboarding'
                            options={{
                                title: "Welcome",
                                drawerItemStyle: { display: "none" },
                                headerShown: false,
                            }}
                        />
                        <Drawer.Screen
                            name='index'
                            options={{ title: "Home" }}
                        />
                        <Drawer.Screen
                            name='analysis/index'
                            options={{ title: "Analysis" }}
                        />
                        <Drawer.Screen
                            name='my-account/index'
                            options={{ title: "My Account" }}
                        />
                        <Drawer.Screen
                            name='collect-book/index'
                            options={{ title: "Collect Book" }}
                        />
                        <Drawer.Screen
                            name='pay-book/index'
                            options={{
                                title: "Pay Book",
                                headerShown: false,
                            }}
                        />
                    </Drawer>
                </KeyboardProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}
