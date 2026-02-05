import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    BanknoteArrowDownIcon,
    BanknoteArrowUpIcon,
    BarChart3,
    User,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    Text,
    View,
} from "react-native";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

export default function HomeScreen() {
    const router = useRouter();
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    // Check onboarding status on mount and when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            const checkOnboarding = async () => {
                try {
                    // Check if onboarding flag exists in secure store
                    const onboardingComplete = await SecureStore.getItemAsync(
                        ONBOARDING_COMPLETE_KEY
                    );

                    // If onboarding is not complete, redirect to onboarding
                    if (onboardingComplete !== "true") {
                        router.replace("/onboarding" as any);
                        return;
                    }
                } catch (error) {
                    console.error("Error checking onboarding status:", error);
                    // On error, redirect to onboarding to be safe
                    router.replace("/onboarding" as any);
                    return;
                } finally {
                    setIsCheckingOnboarding(false);
                }
            };

            checkOnboarding();
        }, [router])
    );

    const Tile = ({
        title,
        bgClass,
        Icon,
        onPress,
    }: {
        title: string;
        bgClass: string;
        Icon: any;
        onPress: () => void;
    }) => {
        const scale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Haptics.selectionAsync();
            Animated.timing(scale, {
                toValue: 0.96,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                friction: 5,
                tension: 120,
                useNativeDriver: true,
            }).start();
        };

        const isLight = bgClass.includes("bg-secondary") || bgClass.includes("bg-white");
        const textColor = isLight ? "text-foreground" : "text-white";
        const iconColor = isLight ? "hsl(var(--foreground))" : "white";

        return (
            <Pressable
                className={`flex-1 h-40 rounded-3xl ${bgClass} items-center justify-center shadow-xl shadow-black/10 overflow-hidden`}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View className='items-center justify-between gap-3 px-2'>
                        <Icon size={34} color={iconColor} />
                        <Text className={`${textColor} text-base font-bold`}>
                            {title}
                        </Text>
                    </View>
                </Animated.View>
            </Pressable>
        );
    };

    // Show loading while checking onboarding
    if (isCheckingOnboarding) {
        return (
            <View className='flex-1 bg-background items-center justify-center'>
                <ActivityIndicator size='large' color='hsl(var(--primary))' />
                <Text className='text-muted-foreground font-medium mt-4'>Loading...</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-background px-6 py-8'>
            <View className='flex-1 items-center justify-center'>
                <View className='items-center justify-center mb-10'>
                    <Text className='text-4xl font-black text-foreground tracking-tight'>
                        Money On Track
                    </Text>
                    <View className='h-1 w-12 bg-primary rounded-full mt-2 mb-3' />
                    <Text className='text-muted-foreground text-center text-sm font-medium leading-5 px-4'>
                        The easiest way to track money you&apos;ve lent or
                        borrowed
                    </Text>
                </View>

                <View className='w-full max-w-md gap-5'>
                    <View className='flex-row gap-5'>
                        <Tile
                            title='Pay Book'
                            bgClass='bg-brand-orange'
                            Icon={BanknoteArrowUpIcon}
                            onPress={() => router.push("/pay-book")}
                        />
                        <Tile
                            title='Collect Book'
                            bgClass='bg-brand-indigo'
                            Icon={BanknoteArrowDownIcon}
                            onPress={() => router.push("/collect-book")}
                        />
                    </View>

                    <View className='flex-row gap-5'>
                        <Tile
                            title='Analysis'
                            bgClass='bg-purple-600 dark:bg-purple-700'
                            Icon={BarChart3}
                            onPress={() => router.push("/analysis")}
                        />
                        <Tile
                            title='Account'
                            bgClass='bg-card border border-border'
                            Icon={User}
                            onPress={() => router.push("/my-account")}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}
