import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
} from "react-native";
import { usePreferences } from "@/context/PreferencesContext";
import { CardContent } from "@/components/ui/card";
import {
    Check,
    Globe,
    CreditCard,
    ChevronRight,
    Moon,
    Sun,
    Monitor,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import BottomModal from "@/components/ui/BottomModal";

const currencyOptions = [
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "JPY - Japanese Yen", value: "JPY" },
    { label: "AUD - Australian Dollar", value: "AUD" },
    { label: "CAD - Canadian Dollar", value: "CAD" },
    { label: "CHF - Swiss Franc", value: "CHF" },
    { label: "CNY - Chinese Yuan", value: "CNY" },
    { label: "SGD - Singapore Dollar", value: "SGD" },
];

export default function SettingsScreen() {
    const {
        theme,
        currency,
        updateTheme,
        updateCurrency,
    } = usePreferences();

    const { colorScheme } = useColorScheme();
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const themeOptions: { label: string; value: "light" | "dark" | "system"; icon: any }[] = [
        { label: "Light Mode", value: "light", icon: Sun },
        { label: "Dark Mode", value: "dark", icon: Moon },
        { label: "System Default", value: "system", icon: Monitor },
    ];

    return (
        <View className='flex-1 bg-background'>
            <ScrollView
                className='flex-1'
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                            Application
                        </Text>
                        <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                            Settings
                        </Text>
                    </View>

                    {/* Theme Section */}
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

                    {/* Regional Section */}
                    <View className='mb-6 px-4'>
                        <View className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                            <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                                Regional Settings
                            </Text>

                            <Pressable
                                onPress={() => setShowCurrencyModal(true)}
                                className='flex-row items-center justify-between p-4 rounded-xl bg-background border border-border mt-2'
                            >
                                <View className='flex-row items-center'>
                                    <View className='p-2 rounded-lg bg-muted'>
                                        <CreditCard size={20} className='text-muted-foreground' />
                                    </View>
                                    <View className='ml-3'>
                                        <Text className='font-semibold text-foreground'>Currency</Text>
                                        <Text className='text-xs text-muted-foreground'>{currency}</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} className='text-muted-foreground' />
                            </Pressable>

                            <View className='flex-row items-center justify-between p-4 rounded-xl bg-background border border-border mt-3 opacity-50'>
                                <View className='flex-row items-center'>
                                    <View className='p-2 rounded-lg bg-muted'>
                                        <Globe size={20} className='text-muted-foreground' />
                                    </View>
                                    <View className='ml-3'>
                                        <Text className='font-semibold text-foreground'>Language</Text>
                                        <Text className='text-xs text-muted-foreground'>English (Default)</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} className='text-muted-foreground' />
                            </View>
                        </View>
                    </View>

                    <View className='mb-6 px-4' />
                </CardContent>
            </ScrollView>

            {/* Currency Modal */}
            <BottomModal
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
                title='Select Currency'
                maxHeight={0.7}
                minHeight={0.3}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {currencyOptions.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => {
                                updateCurrency(option.value);
                                setShowCurrencyModal(false);
                            }}
                            className={`px-6 py-4 border-b border-border flex-row items-center justify-between ${
                                currency === option.value ? "bg-primary/5" : ""
                            }`}
                        >
                            <View>
                                <Text className={`font-semibold ${
                                    currency === option.value ? "text-primary" : "text-foreground"
                                }`}>
                                    {option.label}
                                </Text>
                                <Text className='text-xs text-muted-foreground'>{option.value}</Text>
                            </View>
                            {currency === option.value && (
                                <Check size={20} className='text-primary' />
                            )}
                        </Pressable>
                    ))}
                </ScrollView>
            </BottomModal>
        </View>
    );
}
