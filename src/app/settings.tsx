import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Switch,
} from "react-native";
import { usePreferences, ThemeType } from "@/context/PreferencesContext";
import { CardContent } from "@/components/ui/card";
import {
    Moon,
    Sun,
    Monitor,
    Check,
    Globe,
    CreditCard,
    Info,
    ChevronRight,
} from "lucide-react-native";
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

    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const themeOptions: { label: string; value: ThemeType; icon: any }[] = [
        { label: "System Default", value: "system", icon: Monitor },
        { label: "Light Mode", value: "light", icon: Sun },
        { label: "Dark Mode", value: "dark", icon: Moon },
    ];

    return (
        <View className='flex-1 bg-background'>
            <ScrollView
                className='flex-1'
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-6'>
                        <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                            Application
                        </Text>
                        <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                            Settings
                        </Text>
                    </View>

                    {/* Theme Section */}
                    <View className='mb-8 px-6'>
                        <View className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                            <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                                Appearance
                            </Text>
                            
                            <View className='space-y-2'>
                                {themeOptions.map((option) => (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => updateTheme(option.value)}
                                        className={`flex-row items-center justify-between p-4 rounded-xl border ${
                                            theme === option.value
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-background border-transparent"
                                        }`}
                                    >
                                        <View className='flex-row items-center'>
                                            <View className={`p-2 rounded-lg ${
                                                theme === option.value ? "bg-primary/20" : "bg-muted"
                                            }`}>
                                                <option.icon 
                                                    size={20} 
                                                    className={theme === option.value ? "text-primary" : "text-muted-foreground"} 
                                                />
                                            </View>
                                            <Text className={`ml-3 font-semibold ${
                                                theme === option.value ? "text-primary" : "text-foreground"
                                            }`}>
                                                {option.label}
                                            </Text>
                                        </View>
                                        {theme === option.value && (
                                            <Check size={20} className='text-primary' />
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Regional Section */}
                    <View className='mb-8 px-6'>
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

                    {/* About Section */}
                    <View className='mb-8 px-6'>
                        <View className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                            <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                                About
                            </Text>

                            <View className='space-y-4'>
                                <View className='flex-row items-center justify-between'>
                                    <View className='flex-row items-center'>
                                        <Info size={18} className='text-muted-foreground' />
                                        <Text className='ml-3 text-foreground'>Version</Text>
                                    </View>
                                    <Text className='text-muted-foreground font-medium'>1.0.0 (Alpha)</Text>
                                </View>
                                
                                <View className='h-px bg-border my-2' />
                                
                                <Text className='text-[10px] text-muted-foreground text-center mt-2'>
                                    Built with ❤️ for Financial Management
                                </Text>
                            </View>
                        </View>
                    </View>
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
