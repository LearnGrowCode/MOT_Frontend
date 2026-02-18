import { Tabs } from "expo-router";
import "react-native-get-random-values";

import { PreferencesProvider, usePreferences } from "@/context/PreferencesContext";
import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import React from "react";
import { useColorScheme } from "nativewind";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
    BarChart3, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    UserCircle, 
    PlusCircle
} from "lucide-react-native";

function LayoutContent() {
    const { colorScheme } = useColorScheme();

    return (
        <ThemeProvider value={NAV_THEME[colorScheme as "light" | "dark"]}>
            <SafeAreaView className='flex-1 bg-background'>
                <KeyboardProvider>
                    <PortalHost name='root' />
                    <Tabs
                        screenOptions={{
                            headerShown: false,
                            tabBarStyle: { backgroundColor: NAV_THEME[colorScheme as "light" | "dark"].colors.card },
                            tabBarActiveTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.primary,
                            tabBarInactiveTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.text + "80", // Opacity 0.5
                            headerStyle: { backgroundColor: NAV_THEME[colorScheme as "light" | "dark"].colors.card },
                            headerTintColor: NAV_THEME[colorScheme as "light" | "dark"].colors.text,
                        }}
                    >
                        <Tabs.Screen
                            name='collect-book'
                            options={{
                                title: "Collect",
                                tabBarLabel: "Collect",
                                tabBarIcon: ({ color, size }) => <ArrowDownCircle color={color} size={size} />,
                            }}
                        />
                        <Tabs.Screen
                            name='pay-book'
                            options={{
                                title: "Pay",
                                tabBarLabel: "Pay",
                                tabBarIcon: ({ color, size }) => <ArrowUpCircle color={color} size={size} />,
                            }}
                        />
                        <Tabs.Screen
                            name='add-selection'
                            options={{
                                title: "Add",
                                tabBarLabel: "Add",
                                tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size + 10} />,
                                // This will be handled as a modal-like action later or a simple middle tab
                            }}
                        />
                        <Tabs.Screen
                            name='analysis/index'
                            options={{
                                title: "Analysis",
                                tabBarLabel: "Analysis",
                                tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
                            }}
                        />
                        <Tabs.Screen
                            name='my-account/index'
                            options={{
                                title: "Account",
                                tabBarLabel: "Account",
                                tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />,
                            }}
                        />
                        <Tabs.Screen
                            name='index'
                            options={{
                                href: null, // Hide Home from tab bar
                            }}
                        />
                        <Tabs.Screen
                            name='settings'
                            options={{
                                href: null, // Hide Settings from tab bar (merging into Account)
                            }}
                        />
                        <Tabs.Screen
                            name='onboarding/index'
                            options={{
                                title: "Onboarding",
                                href: null,
                            }}
                        />
                    </Tabs>
                </KeyboardProvider>
            </SafeAreaView>
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
