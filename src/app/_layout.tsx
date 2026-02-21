import { Tabs } from "expo-router";
import "react-native-get-random-values";

import { PreferencesProvider } from "@/context/PreferencesContext";
import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { PortalHost } from "@rn-primitives/portal";
import React from "react";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BarChart3,
  ArrowDownCircle,
  ArrowUpCircle,
  UserCircle,
  Plus,
} from "lucide-react-native";

function LayoutContent() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme as "light" | "dark"];

  return (
  
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardProvider>
          <PortalHost name="root" />

          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,

              tabBarStyle: {
                left: 20,
                right: 20,
                height: 60,
                bottom: 5,
                borderRadius: 30,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(25,25,35,0.95)"
                    : "rgba(255,255,255,0.95)",
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 12,
              },

              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.text + "60",
            }}
          >
            {/* Collect */}
            <Tabs.Screen
              name="collect-book"
              options={{
                tabBarIcon: ({ color, focused }) => (
                  <View
                    style={{
                        bottom: -10,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderRadius: 20,
                      backgroundColor: focused
                        ? colorScheme === "dark"
                          ? "rgba(80,80,255,0.25)"
                          : "rgba(80,80,255,0.15)"
                        : "transparent",
                    }}
                  >
                    <ArrowDownCircle color={color} size={22} />
                  </View>
                ),
              }}
            />

            {/* Pay */}
            <Tabs.Screen
              name="pay-book"
              options={{
                tabBarIcon: ({ color, focused }) => (
                  <View
                    style={{
                        bottom: -10,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderRadius: 20,
                      backgroundColor: focused
                        ? colorScheme === "dark"
                          ? "rgba(80,80,255,0.25)"
                          : "rgba(80,80,255,0.15)"
                        : "transparent",
                    }}
                  >
                    <ArrowUpCircle color={color} size={22} />
                  </View>
                ),
              }}
            />

            {/* Center Add FAB */}
            <Tabs.Screen
              name="add-selection"
              options={{
                tabBarIcon: () => (
                    <View
                      style={{
                          bottom: -10,
                        position: "absolute",
                        height: 60,
                        width: 60,
                        borderRadius: 30,
                        backgroundColor: theme.colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 8,
                      }}
                    >
                      <Plus color="#fff" size={28} />
                    </View>
                ),
              }}
            />

            {/* Analysis */}
            <Tabs.Screen
              name="analysis/index"
              options={{
                tabBarIcon: ({ color, focused }) => (
                  <View
                    style={{
                        bottom: -10,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderRadius: 20,
                      backgroundColor: focused
                        ? colorScheme === "dark"
                          ? "rgba(80,80,255,0.25)"
                          : "rgba(80,80,255,0.15)"
                        : "transparent",
                    }}
                  >
                    <BarChart3 color={color} size={22} />
                  </View>
                ),
              }}
            />

            {/* Account */}
            <Tabs.Screen
              name="my-account/index"
              options={{
                tabBarIcon: ({ color, focused }) => (
                  <View
                    style={{
                        bottom: -10,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderRadius: 20,
                      backgroundColor: focused
                        ? colorScheme === "dark"
                          ? "rgba(80,80,255,0.25)"
                          : "rgba(80,80,255,0.15)"
                        : "transparent",
                    }}
                  >
                    <UserCircle color={color} size={22} />
                  </View>
                ),
              }}
            />

            {/* Hidden Routes */}
            <Tabs.Screen name="index" options={{ href: null, tabBarStyle: { display: "none" } }} />
             <Tabs.Screen 
              name="onboarding/index" 
              options={{ 
                href: null,
                tabBarStyle: { display: "none" }
              }} 
            />
          </Tabs>
        </KeyboardProvider>
      </SafeAreaView>
   
  );
}

export default function Layout() {
  return (
    <PreferencesProvider>
      <LayoutContent />
    </PreferencesProvider>
  );
}
