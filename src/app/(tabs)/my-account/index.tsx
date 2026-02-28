import { CardContent } from "@/components/ui/card";
import { usePreferences } from "@/context/PreferencesContext";
import {
    getUser,
    getUserPreferences,
} from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import { useFocusEffect, useRouter } from "expo-router";
import {
    Pencil,
} from "lucide-react-native";

import ProfileCard from "@/components/screens/my-account/ProfileCard";
import AppearanceSettings from "@/components/screens/my-account/AppearanceSettings";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Pressable,
    Text,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function MyAccountScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        fullName: "",
        currency: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const {
        theme,
        updateTheme,
    } = usePreferences();

    const profileInitials = useMemo(() => {
        if (!profile.fullName) return "U";
        const nameParts = profile.fullName.trim().split(/\s+/);
        const initials = nameParts
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "");
        return initials.join("") || "U";
    }, [profile.fullName]);

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [userData, userPrefs] = await Promise.all([
                getUser(DEFAULT_USER_ID),
                getUserPreferences(DEFAULT_USER_ID),
            ]);

            if (userData) {
                const nameFromFirstLast = [
                    userData.firstName,
                    userData.lastName,
                ]
                    .filter(Boolean)
                    .join(" ");
                const fullName =
                    nameFromFirstLast || userData.username || "User";

                setProfile({
                    fullName,
                    currency: userPrefs?.currency || "INR",
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [fetchUserData])
    );

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-background'>
                <Text className="text-foreground">Loading...</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-background'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1}}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                            Settings
                        </Text>
                        <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                            My Account
                        </Text>
                    </View>

                    <ProfileCard 
                        fullName={profile.fullName}
                        profileInitials={profileInitials}
                        currency={profile.currency}
                    />

                    <AppearanceSettings 
                        theme={theme}
                        updateTheme={updateTheme}
                    />
                </CardContent>
            </KeyboardAwareScrollView>

            <Pressable
                onPress={() => router.push("/my-account/edit")}
                className='absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40 active:opacity-90 active:scale-95'
                style={{ elevation: 8 }}
            >
                <Pencil size={24} color='#ffffff' />
            </Pressable>
        </View>
    );
}
