import React from "react";
import { View, Text, Pressable } from "react-native";
import { Check, Sun, Moon, Monitor } from "lucide-react-native";
import { useColorScheme } from "nativewind";

interface AppearanceSettingsProps {
    theme: "light" | "dark" | "system";
    updateTheme: (theme: "light" | "dark" | "system") => void;
}

const themeOptions: { label: string; value: "light" | "dark" | "system"; icon: any }[] = [
    { label: "Light Mode", value: "light", icon: Sun },
    { label: "Dark Mode", value: "dark", icon: Moon },
    { label: "System Default", value: "system", icon: Monitor },
];

export default function AppearanceSettings({ theme, updateTheme }: AppearanceSettingsProps) {
    const { colorScheme } = useColorScheme();

    return (
        <View className='mb-6 px-4'>
            <View className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                    Appearance
                </Text>
                
                <View className='gap-3'>
                    {themeOptions.map((option) => {
                        const isActive = theme === option.value;
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => updateTheme(option.value)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border ${
                                    isActive
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-background border-border/50"
                                }`}
                            >
                                <View className='flex-row items-center'>
                                    <View className={`p-2 rounded-lg ${
                                        isActive ? "bg-primary/20" : "bg-muted"
                                    }`}>
                                        <option.icon 
                                            size={20} 
                                            color={isActive ? "#6366f1" : (colorScheme === 'dark' ? "#94a3b8" : "#64748b")} 
                                        />
                                    </View>
                                    <Text className={`ml-3 font-semibold ${
                                        isActive ? "text-primary" : "text-foreground"
                                    }`}>
                                        {option.label}
                                    </Text>
                                </View>
                                {isActive && (
                                    <Check size={20} color="#6366f1" />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
