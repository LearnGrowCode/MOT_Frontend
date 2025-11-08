import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    Alert,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useFocusEffect } from "expo-router";
import Input from "@/components/form/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { CardContent } from "@/components/ui/card";
import BottomModal from "@/components/ui/BottomModal";
import { CheckCircle2 } from "lucide-react-native";
import {
    getUser,
    getUserPreferences,
    upsertUser,
    upsertUserPreferences,
} from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import { uuidv4 } from "@/utils/uuid";
import { useCurrency } from "@/context/CurrencyContext";

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
        email: "",
        mobileNumber: "",
        currency: "",
        imageUri: undefined as string | undefined,
    });
    const [draft, setDraft] = useState(profile);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const { updateCurrency, refetch: refetchCurrency } = useCurrency();

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [userData, userPrefs] = await Promise.all([
                getUser(DEFAULT_USER_ID),
                getUserPreferences(DEFAULT_USER_ID),
            ]);

            if (userData) {
                const fullName =
                    [userData.firstName, userData.lastName]
                        .filter(Boolean)
                        .join(" ") || "User";
                setProfile({
                    fullName,
                    email: userData.email || "",
                    mobileNumber: "", // Mobile number not stored in user table yet
                    currency: userPrefs?.currency || "USD",
                    imageUri: undefined,
                });
                setDraft({
                    fullName,
                    email: userData.email || "",
                    mobileNumber: "",
                    currency: userPrefs?.currency || "USD",
                    imageUri: undefined,
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
                email:
                    draft.email ||
                    `${firstName.toLowerCase()}.${lastName.toLowerCase() || "user"}@mot.local`,
                firstName: firstName,
                lastName: lastName || undefined,
                isActive: 1,
            });

            // Get existing preferences or create new
            const existingPrefs = await getUserPreferences(userId);
            const prefsId = existingPrefs?.id || uuidv4();

            // Update user preferences with currency
            await upsertUserPreferences({
                id: prefsId,
                userId: userId,
                currency: draft.currency,
                language: existingPrefs?.language || "en",
                notifications: existingPrefs?.notifications ?? 1,
                emailNotifications: existingPrefs?.emailNotifications ?? 1,
                smsNotifications: existingPrefs?.smsNotifications ?? 1,
                pushNotifications: existingPrefs?.pushNotifications ?? 1,
            });

            setProfile(draft);
            setIsEditing(false);

            // Update currency in context immediately
            if (draft.currency) {
                updateCurrency(draft.currency);
            }

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

    const handlePickImage = async () => {
        // Integrate an image picker if available; for now this is a placeholder
        // setImageUri(pickedUri);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "You have pressed logout.");
    };

    const startEdit = () => {
        setDraft(profile);
        setIsEditing(true);
    };

    const selectedCurrencyLabel =
        currencyOptions.find((c) => c.value === draft.currency)?.label ||
        "Select currency";

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size='large' color='#2563eb' />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
        >
            <CardContent className='flex flex-col p-4'>
                <View className='mb-4 flex-row items-center justify-between'>
                    <Text className='text-2xl font-bold text-blue-600'>
                        My Account
                    </Text>
                    {!isEditing ? (
                        <Pressable
                            accessibilityRole='button'
                            onPress={startEdit}
                            className='rounded-md border border-gray-300 px-3 py-1.5'
                        >
                            <Text className='text-sm font-medium text-gray-700'>
                                Edit
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            accessibilityRole='button'
                            onPress={handleSave}
                            disabled={saving}
                            className={`rounded-md border px-3 py-1.5 ${saving ? "opacity-60" : "active:opacity-90"} border-blue-600`}
                        >
                            <Text className='text-sm font-medium text-blue-600'>
                                {saving ? "Saving..." : "Save"}
                            </Text>
                        </Pressable>
                    )}
                </View>

                <View className='mb-6 rounded-2xl bg-blue-50 px-4 py-6 items-center'>
                    <View className='relative'>
                        <Avatar alt='Profile image' className='size-28'>
                            {isEditing ? (
                                draft.imageUri ? (
                                    <AvatarImage
                                        source={{ uri: draft.imageUri }}
                                    />
                                ) : (
                                    <AvatarFallback>
                                        <Text className='text-lg font-semibold'>
                                            IMG
                                        </Text>
                                    </AvatarFallback>
                                )
                            ) : profile.imageUri ? (
                                <AvatarImage
                                    source={{ uri: profile.imageUri }}
                                />
                            ) : (
                                <AvatarFallback>
                                    <Text className='text-lg font-semibold'>
                                        IMG
                                    </Text>
                                </AvatarFallback>
                            )}
                        </Avatar>
                        {isEditing ? (
                            <Pressable
                                onPress={handlePickImage}
                                className='absolute -bottom-1 -right-1 rounded-full bg-white p-2 border border-gray-200'
                            >
                                <Text className='text-blue-600 text-xs'>
                                    📷
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                    <Text className='mt-4 text-xl font-semibold text-gray-900'>
                        {profile.fullName}
                    </Text>
                    <Text className='mt-1 text-sm text-gray-600'>
                        {profile.email}
                    </Text>
                </View>

                {!isEditing ? (
                    <>
                        <Text className='px-1 mb-2 text-xs font-medium text-gray-500'>
                            Personal info
                        </Text>
                        <View className='w-full rounded-xl border border-gray-100 bg-white'>
                            <View className='flex-row items-center justify-between px-4 py-3'>
                                <View className='flex-row items-center gap-3'>
                                    <Text className='text-gray-500'>📞</Text>
                                    <Text className='text-gray-500 text-sm'>
                                        Mobile
                                    </Text>
                                </View>
                                <Text className='text-gray-900 text-sm'>
                                    {profile.mobileNumber || "—"}
                                </Text>
                            </View>
                            <View className='h-px bg-gray-100' />
                            <View className='flex-row items-center justify-between px-4 py-3'>
                                <View className='flex-row items-center gap-3'>
                                    <Text className='text-gray-500'>🌐</Text>
                                    <Text className='text-gray-500 text-sm'>
                                        Currency
                                    </Text>
                                </View>
                                <View className='rounded-full bg-blue-50 px-2.5 py-1'>
                                    <Text className='text-blue-600 text-xs font-medium'>
                                        {profile.currency || "—"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Input
                            label='Full Name'
                            placeholder='Enter your name'
                            value={draft.fullName}
                            onChangeText={(t) =>
                                setDraft((p) => ({ ...p, fullName: t }))
                            }
                            autoCapitalize='words'
                            returnKeyType='next'
                        />
                        <Input
                            label='Email'
                            placeholder='you@example.com'
                            value={draft.email}
                            onChangeText={(t) =>
                                setDraft((p) => ({ ...p, email: t }))
                            }
                            keyboardType='email-address'
                            autoCapitalize='none'
                            returnKeyType='next'
                        />
                        <Input
                            label='Mobile Number'
                            placeholder='e.g. +1 555 123 4567'
                            value={draft.mobileNumber}
                            onChangeText={(t) =>
                                setDraft((p) => ({ ...p, mobileNumber: t }))
                            }
                            keyboardType='phone-pad'
                            returnKeyType='done'
                        />
                        <View className='w-full mb-3'>
                            <Text className='mb-1 text-sm text-gray-600'>
                                Preferred Currency
                            </Text>
                            <Pressable
                                onPress={() => setShowCurrencyModal(true)}
                                className='w-full px-4 py-3 border border-gray-300 rounded-md bg-white flex-row items-center justify-between'
                                accessibilityRole='button'
                                accessibilityLabel='Select currency'
                                accessibilityHint='Opens currency selection modal'
                            >
                                <Text
                                    className={`text-base ${
                                        draft.currency
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {selectedCurrencyLabel}
                                </Text>
                                <Text className='text-gray-400'>▼</Text>
                            </Pressable>
                        </View>
                        {null}
                    </>
                )}
                {!isEditing ? (
                    <View className=' items-start mt-4'>
                        <Pressable
                            onPress={handleLogout}
                            accessibilityRole='button'
                        >
                            <Text className='text-red-600 font-medium'>
                                Logout
                            </Text>
                        </Pressable>
                    </View>
                ) : null}
            </CardContent>

            {/* Currency Selection Modal */}
            <BottomModal
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
                title='Select Currency'
                maxHeight={0.7}
                minHeight={0.3}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className='flex-1'
                >
                    {currencyOptions.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => {
                                setDraft((p) => ({
                                    ...p,
                                    currency: option.value,
                                }));
                                setShowCurrencyModal(false);
                            }}
                            className={`px-6 py-4 border-b border-gray-100 active:bg-gray-50 ${
                                draft.currency === option.value
                                    ? "bg-blue-50"
                                    : "bg-white"
                            }`}
                            accessibilityRole='button'
                            accessibilityLabel={`Select ${option.label}`}
                            accessibilityState={{
                                selected: draft.currency === option.value,
                            }}
                        >
                            <View className='flex-row items-center justify-between'>
                                <View className='flex-1'>
                                    <Text
                                        className={`text-base font-medium ${
                                            draft.currency === option.value
                                                ? "text-blue-600"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text className='text-sm text-gray-500 mt-0.5'>
                                        {option.value}
                                    </Text>
                                </View>
                                {draft.currency === option.value && (
                                    <CheckCircle2 size={20} color='#2563eb' />
                                )}
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </BottomModal>
        </KeyboardAwareScrollView>
    );
}
