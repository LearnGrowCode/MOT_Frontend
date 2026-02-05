import { Drawer } from "expo-router/drawer";
import "react-native-get-random-values";

import { PreferencesProvider, usePreferences } from "@/context/PreferencesContext";
import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import React from "react";
import { useColorScheme } from "nativewind";
import { KeyboardProvider } from "react-native-keyboard-controller";

function LayoutContent() {
    const { colorScheme } = useColorScheme();

    return (
        <ThemeProvider value={NAV_THEME[colorScheme as "light" | "dark"]}>
                <KeyboardProvider>
                    <PortalHost name='root' />
                    <Drawer
                        screenOptions={{
                            headerShown: true,
                            drawerStyle: { backgroundColor: NAV_THEME[colorScheme as "light" | "dark"].colors.card },
                            drawerActiveTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.primary,
                            drawerInactiveTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.text + "80", // Opacity 0.5
                            headerStyle: { backgroundColor: NAV_THEME[colorScheme as "light" | "dark"].colors.card },
                            headerTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.text,
                        }}
                    >
                        <Drawer.Screen
                            name='index'
                            options={{
                                title: "Home",
                                drawerLabel: "Home",
                            }}
                        />
                        <Drawer.Screen
                            name='analysis/index'
                            options={{
                                title: "Analysis",
                                drawerLabel: "Analysis",
                            }}
                        />
                        <Drawer.Screen
                            name='my-account/index'
                            options={{
                                title: "My Account",
                                drawerLabel: "My Account",
                            }}
                        />
                        <Drawer.Screen
                            name='collect-book'
                            options={{
                                title: "Collect Book",
                                drawerLabel: "Collect Book",
                            }}
                        />
                        <Drawer.Screen
                            name='pay-book'
                            options={{
                                title: "Pay Book",
                                drawerLabel: "Pay Book",
                            }}
                        />
                        <Drawer.Screen
                            name='settings'
                            options={{
                                title: "Settings",
                                drawerLabel: "Settings",
                            }}
                        />
                        <Drawer.Screen
                            name='onboarding/index'
                            options={{
                                title: "Onboarding",
                                drawerLabel: "Onboarding",
                                drawerItemStyle: {
                                    display: "none",
                                }
                            }}
                        />
                    </Drawer>
                </KeyboardProvider>
        </ThemeProvider>
    );
}

export default function Layout() {
    return (
        <PreferencesProvider>
            <LayoutContent />
        </PreferencesProvider>
    );
}
