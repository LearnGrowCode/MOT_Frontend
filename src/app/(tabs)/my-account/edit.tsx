import EditProfileCard from "@/components/screens/my-account/EditProfileCard";
import CurrencySelectionModal from "@/components/screens/my-account/CurrencySelectionModal";
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
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Pressable,
    Text,
    View,
    Alert,
} from "react-native";
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

export default function EditAccountScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        fullName: "",
        currency: "",
    });
    const [draft, setDraft] = useState(profile);
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const {
        updateCurrency,
        updateLocale,
        refetch: refetchCurrency,
    } = usePreferences();
    const { colorScheme } = useColorScheme();

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

            await upsertUser({
                id: userId,
                firstName: firstName,
                lastName: lastName || undefined,
                isActive: 1,
            });

            const existingPrefs = await getUserPreferences(userId);
            const prefsId = existingPrefs?.id || uuidv4();
            const deviceLocale = getDeviceLocale();
            const localeToSave = existingPrefs?.locale ?? deviceLocale;

            await upsertUserPreferences({
                ...existingPrefs,
                id: prefsId,
                userId: userId,
                currency: draft.currency,
                locale: localeToSave,
            });

            setProfile(draft);
            if (draft.currency) {
                updateCurrency(draft.currency);
            }
            updateLocale(localeToSave);
            await refetchCurrency();

            Alert.alert("Success", "Profile updated successfully");
            router.back();
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const selectedCurrencyLabel =
        currencyOptions.find((c) => c.value === draft.currency)?.label ||
        "Select currency";

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
                <View className="flex-row items-center px-4 pt-6 pb-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="p-3 bg-secondary/50 rounded-2xl active:bg-secondary border border-border/30 shadow-sm"
                    >
                        <ArrowLeft size={24} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={2.5} />
                    </Pressable>
                </View>

                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                            Settings
                        </Text>
                        <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                            Edit Account
                        </Text>
                    </View>

                    <EditProfileCard 
                        draftFullName={draft.fullName}
                        setDraftFullName={(text) => setDraft((p) => ({ ...p, fullName: text }))}
                        draftCurrency={draft.currency}
                        selectedCurrencyLabel={selectedCurrencyLabel}
                        onOpenCurrencyModal={() => setShowCurrencyModal(true)}
                    />
                </CardContent>
            </KeyboardAwareScrollView>

            <View className='border-t border-border bg-card px-4 py-5 shadow-lg'>
                <View className='flex-row'>
                    <Pressable
                        onPress={() => router.back()}
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
