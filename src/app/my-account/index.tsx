import { CardContent } from "@/components/ui/card";
import { usePreferences } from "@/context/PreferencesContext";
import {
    getUser,
    getUserPreferences,
    upsertUser,
    upsertUserPreferences,
} from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import { getDeviceLocale } from "@/utils/currency-locale";
import { uuidv4 } from "@/utils/uuid";
import { useFocusEffect } from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
    Pencil,
    ArrowLeft,
} from "lucide-react-native";

import ProfileCard from "@/components/my-account/ProfileCard";
import EditProfileCard from "@/components/my-account/EditProfileCard";
import AppearanceSettings from "@/components/my-account/AppearanceSettings";
import CurrencySelectionModal from "@/components/my-account/CurrencySelectionModal";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Pressable,
    Text,
    View,
    Alert,
} from "react-native";
// SafeAreaView import removed
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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

export default function MyAccountScreen() {
    const [profile, setProfile] = useState({
        fullName: "",
        currency: "",
    });
    const [draft, setDraft] = useState(profile);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const {
        theme,
        updateTheme,
        updateCurrency,
        updateLocale,
        refetch: refetchCurrency,
    } = usePreferences();
    const { colorScheme } = useColorScheme();

    const profileInitials = useMemo(() => {
        if (!profile.fullName) return "U";
        const nameParts = profile.fullName.trim().split(/\s+/);
        const initials = nameParts
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "");
        return initials.join("") || "U";
    }, [profile.fullName]);

    const isDirty = useMemo(() => {
        return (
            profile.fullName !== draft.fullName ||
            profile.currency !== draft.currency
        );
    }, [profile, draft]);

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [userData, userPrefs] = await Promise.all([
                getUser(DEFAULT_USER_ID),
                getUserPreferences(DEFAULT_USER_ID),
            ]);

            if (userData) {
                // Build fullName from firstName/lastName, or fallback to username
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
                setDraft({
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const userId = DEFAULT_USER_ID;
            const nameParts = draft.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Update user
            await upsertUser({
                id: userId,
                firstName: firstName,
                lastName: lastName || undefined,
                isActive: 1,
            });

            // Get existing preferences or create new
            const existingPrefs = await getUserPreferences(userId);
            const prefsId = existingPrefs?.id || uuidv4();

            // Get device locale as default if no locale is set
            const deviceLocale = getDeviceLocale();
            const localeToSave = existingPrefs?.locale ?? deviceLocale;

            // Update user preferences with currency and locale
            await upsertUserPreferences({
                id: prefsId,
                userId: userId,
                currency: draft.currency,
                locale: localeToSave,
                language: existingPrefs?.language || "en",
                notifications: existingPrefs?.notifications ?? 1,
                emailNotifications: existingPrefs?.emailNotifications ?? 1,
                smsNotifications: existingPrefs?.smsNotifications ?? 1,
                pushNotifications: existingPrefs?.pushNotifications ?? 1,
            });

            setProfile(draft);
            setIsEditing(false);

            // Update currency and locale in context immediately
            if (draft.currency) {
                updateCurrency(draft.currency);
            }
            updateLocale(localeToSave);

            // Refetch from database to ensure sync
            await refetchCurrency();

            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = () => {
        setDraft(profile);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setDraft(profile);
        setIsEditing(false);
    };

    const selectedCurrencyLabel =
        currencyOptions.find((c) => c.value === draft.currency)?.label ||
        "Select currency";

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center'>
                {/* <ActivityIndicator size='large' color='#2563eb' /> */}
                <Text className="text-foreground">Loading...</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-background'>
            <Tabs.Screen options={{ tabBarStyle: isEditing && { display: "none" } }} />
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1}}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                {/* Header / Nav for Edit mode */}
                {isEditing && (
                    <View className="flex-row items-center px-4 pt-6 pb-2">
                        <Pressable
                            onPress={handleCancelEdit}
                            className="p-3 bg-secondary/50 rounded-2xl active:bg-secondary border border-border/30 shadow-sm"
                        >
                            <ArrowLeft size={24} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={2.5} />
                        </Pressable>
                    </View>
                )}

                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                            Settings
                        </Text>
                        <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                            My Account
                        </Text>
                    </View>

                    {isEditing ? (
                        <EditProfileCard 
                            draftFullName={draft.fullName}
                            setDraftFullName={(text) => setDraft((p) => ({ ...p, fullName: text }))}
                            draftCurrency={draft.currency}
                            selectedCurrencyLabel={selectedCurrencyLabel}
                            onOpenCurrencyModal={() => setShowCurrencyModal(true)}
                        />
                    ) : (
                        <ProfileCard 
                            fullName={profile.fullName}
                            profileInitials={profileInitials}
                            currency={profile.currency}
                        />
                    )}

                    {!isEditing && (
                        <AppearanceSettings 
                            theme={theme}
                            updateTheme={updateTheme}
                        />
                    )}
                </CardContent>
            </KeyboardAwareScrollView>

            {!isEditing && (
                <Pressable
                    onPress={startEdit}
                    className='absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40 active:opacity-90 active:scale-95'
                    style={{ elevation: 8 }}
                >
                    <Pencil size={24} color='#ffffff' />
                </Pressable>
            )}

            {isEditing && (
                <View className='border-t border-border bg-card px-4 py-5 shadow-lg'>
                    <View className='flex-row'>
                        <Pressable
                            onPress={handleCancelEdit}
                            disabled={saving}
                            className={`mr-3 flex-1 items-center justify-center rounded-xl border border-border px-4 py-3 ${saving ? "opacity-60" : "active:bg-accent"
                                }`}
                        >
                            <Text className='text-base font-semibold text-foreground'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSave}
                            disabled={saving || !isDirty}
                            className={`flex-1 items-center justify-center rounded-xl px-4 py-3 ${saving || !isDirty
                                    ? "bg-muted"
                                    : "bg-primary active:opacity-90"
                                }`}
                        >
                            <Text className={`text-base font-semibold ${
                                saving || !isDirty ? "text-muted-foreground" : "text-primary-foreground"
                            }`}>
                                {saving ? "Saving..." : "Save changes"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <CurrencySelectionModal 
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
                draftCurrency={draft.currency}
                onSelectCurrency={(currency) => {
                    setDraft((p) => ({ ...p, currency }));
                    setShowCurrencyModal(false);
                }}
            />
        </View>
    );
}
