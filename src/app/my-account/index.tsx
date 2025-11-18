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
import { useFocusEffect, useRouter } from "expo-router";
import Input from "@/components/form/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { CardContent } from "@/components/ui/card";
import BottomModal from "@/components/ui/BottomModal";
import { CheckCircle2, RefreshCw, User } from "lucide-react-native";
import {
    getUser,
    getUserPreferences,
    upsertUser,
    upsertUserPreferences,
} from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import { uuidv4 } from "@/utils/uuid";
import { useCurrency } from "@/context/CurrencyContext";
import * as SecureStore from "expo-secure-store";
import { resetAppData } from "@/utils/db-utils";
import { login, signup } from "@/services/api/auth.service";
import {
    buildSyncTablesFromLocal,
    syncPull,
    syncPush,
    SyncPullCursor,
    applySyncPull,
} from "@/services/api/sync.service";

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
    const router = useRouter();
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        mobileNumber: "",
        currency: "",
    });
    const [draft, setDraft] = useState(profile);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupUsername, setSignupUsername] = useState("");
    const [signupMobile, setSignupMobile] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);
    const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
    const [syncCursor, setSyncCursor] = useState<SyncPullCursor | null>(null);
    const { updateCurrency, refetch: refetchCurrency } = useCurrency();

    const checkLoginStatus = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync("token");
            setIsLoggedIn(!!token);
        } catch (error) {
            console.error("Error checking login status:", error);
            setIsLoggedIn(false);
        }
    }, []);

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
                    email: userData.email || "",
                    mobileNumber: "", // Mobile number not stored in user table yet
                    currency: userPrefs?.currency || "INR",
                });
                setDraft({
                    fullName,
                    email: userData.email || "",
                    mobileNumber: "",
                    currency: userPrefs?.currency || "INR",
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Prefill signup form with onboarding data when modal opens
    useEffect(() => {
        if (showSignupModal) {
            const prefillSignupForm = async () => {
                try {
                    const userData = await getUser(DEFAULT_USER_ID);

                    if (userData) {
                        // Prefill username from firstName or fullName
                        const firstName = userData.firstName || "";
                        const fullName = [userData.firstName, userData.lastName]
                            .filter(Boolean)
                            .join(" ");
                        const username =
                            userData.username || firstName || fullName || "";

                        // Prefill email from database (from onboarding)
                        const email = userData.email || "";

                        // Mobile number is not collected in onboarding, so leave empty
                        // Mobile can stay empty as it's optional

                        // Only prefill if fields are currently empty
                        setSignupUsername((prev) => prev || username);
                        setSignupEmail((prev) => prev || email);
                        // Mobile can stay empty as it's optional
                    }
                } catch (error) {
                    console.error("Error prefilling signup form:", error);
                }
            };

            prefillSignupForm();
        }
    }, [showSignupModal]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
            checkLoginStatus();
        }, [fetchUserData, checkLoginStatus])
    );

    useEffect(() => {
        fetchUserData();
        checkLoginStatus();
    }, [fetchUserData, checkLoginStatus]);

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

    const handleLogin = async () => {
        if (!loginEmail.trim() || !loginPassword.trim()) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setIsLoggingIn(true);
        try {
            const response = await login(loginEmail.trim(), loginPassword);
            if (response.success) {
                setIsLoggedIn(true);
                setShowLoginModal(false);
                setLoginEmail("");
                setLoginPassword("");

                // Save user data from login response to local database
                try {
                    const userData = response.data?.user;
                    if (userData) {
                        // Extract username from response (could be username or split from email)
                        const username =
                            userData.username ||
                            userData.email?.split("@")[0] ||
                            "";
                        const email = userData.email || loginEmail.trim();
                        const remoteId = userData.id?.toString() || null;
                        const currency = userData.currency;

                        // Update local user record with server data
                        await upsertUser({
                            id: DEFAULT_USER_ID,
                            username: username,
                            email: email,
                            remoteId: remoteId,
                            isActive: 1,
                            lastLogin: Date.now(),
                        });

                        // Update user preferences with currency if provided
                        if (currency) {
                            const existingPrefs =
                                await getUserPreferences(DEFAULT_USER_ID);
                            const prefsId = existingPrefs?.id || uuidv4();

                            await upsertUserPreferences({
                                id: prefsId,
                                userId: DEFAULT_USER_ID,
                                currency: currency,
                                language: existingPrefs?.language || "en",
                                notifications:
                                    existingPrefs?.notifications ?? 1,
                                emailNotifications:
                                    existingPrefs?.emailNotifications ?? 1,
                                smsNotifications:
                                    existingPrefs?.smsNotifications ?? 1,
                                pushNotifications:
                                    existingPrefs?.pushNotifications ?? 1,
                            });

                            // Update currency in context
                            updateCurrency(currency);
                        }
                    }
                } catch (userSaveError) {
                    console.error(
                        "Error saving user data from login:",
                        userSaveError
                    );
                }

                // Pull and apply user data from server after login
                try {
                    const pullResponse = await syncPull({
                        limit: 100,
                    });
                    await applySyncPull(pullResponse);
                    setSyncCursor(pullResponse.next_cursor ?? null);

                    // Refresh user data display
                    await fetchUserData();

                    Alert.alert(
                        "Success",
                        "Logged in successfully! Your data has been synced."
                    );
                } catch (syncError) {
                    console.error("Sync after login failed:", syncError);
                    Alert.alert(
                        "Success",
                        "Logged in successfully! Sync is now available. You may need to sync manually."
                    );
                }
            } else {
                Alert.alert(
                    "Error",
                    "Login failed. Please check your credentials."
                );
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Login failed. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSignup = async () => {
        if (
            !signupEmail.trim() ||
            !signupPassword.trim() ||
            !signupUsername.trim()
        ) {
            Alert.alert(
                "Error",
                "Please fill in all required fields (email, password, username)"
            );
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (signupPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setIsSigningUp(true);
        try {
            // Use current user's currency preference if available
            const currencyPref = profile.currency || draft.currency || "USD";

            const response = await signup(
                signupEmail.trim(),
                signupPassword,
                signupUsername.trim(),
                signupMobile.trim() || undefined,
                currencyPref
            );

            if (response.success) {
                setIsLoggedIn(true);
                setShowSignupModal(false);
                setSignupEmail("");
                setSignupPassword("");
                setSignupConfirmPassword("");
                setSignupUsername("");
                setSignupMobile("");

                // Save user data from signup response to local database
                try {
                    const userData = response.data?.user;
                    if (userData) {
                        const username =
                            userData.username || signupUsername.trim();
                        const email = userData.email || signupEmail.trim();
                        const remoteId = userData.id?.toString() || null;
                        const currency = userData.currency || currencyPref;

                        // Update local user record with server data
                        await upsertUser({
                            id: DEFAULT_USER_ID,
                            username: username,
                            email: email,
                            remoteId: remoteId,
                            isActive: 1,
                            dateJoined: Date.now(),
                            lastLogin: Date.now(),
                        });

                        // Update user preferences with currency
                        const existingPrefs =
                            await getUserPreferences(DEFAULT_USER_ID);
                        const prefsId = existingPrefs?.id || uuidv4();

                        await upsertUserPreferences({
                            id: prefsId,
                            userId: DEFAULT_USER_ID,
                            currency: currency,
                            language: existingPrefs?.language || "en",
                            notifications: existingPrefs?.notifications ?? 1,
                            emailNotifications:
                                existingPrefs?.emailNotifications ?? 1,
                            smsNotifications:
                                existingPrefs?.smsNotifications ?? 1,
                            pushNotifications:
                                existingPrefs?.pushNotifications ?? 1,
                        });

                        // Update currency in context
                        updateCurrency(currency);
                    }
                } catch (userSaveError) {
                    console.error(
                        "Error saving user data from signup:",
                        userSaveError
                    );
                }

                // Push local data to server after signup (before pulling)
                try {
                    const requestId = uuidv4();
                    const syncTables = await buildSyncTablesFromLocal();
                    const pushResponse = await syncPush({
                        device_id: "dev-device",
                        request_id: requestId,
                        tables: {
                            pay_book: syncTables.pay_book,
                            collect_book: syncTables.collect_book,
                            settlements: syncTables.settlements,
                        },
                    });

                    console.log(
                        `Pushed ${pushResponse.processed_ids?.length ?? 0} entries to server after signup`
                    );
                } catch (pushError) {
                    console.error(
                        "Error pushing local data after signup:",
                        pushError
                    );
                    // Continue even if push fails - user can sync manually later
                }

                // Pull and apply user data from server after signup
                try {
                    const pullResponse = await syncPull({
                        limit: 100,
                    });
                    await applySyncPull(pullResponse);
                    setSyncCursor(pullResponse.next_cursor ?? null);

                    // Refresh user data display
                    await fetchUserData();

                    Alert.alert(
                        "Success",
                        "Account created successfully! Your local data has been synced to your new account."
                    );
                } catch (syncError) {
                    console.error("Sync after signup failed:", syncError);
                    Alert.alert(
                        "Success",
                        "Account created successfully! Sync is now available. You may need to sync manually."
                    );
                }
            } else {
                Alert.alert(
                    "Error",
                    "Signup failed. Please check your information and try again."
                );
            }
        } catch (error) {
            console.error("Signup error:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Signup failed. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSigningUp(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout? All local data will be cleared and you will be redirected to onboarding.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Delete token
                            await SecureStore.deleteItemAsync("token");

                            // Clear all database data and reset app state
                            await resetAppData();

                            // Reset local state
                            setIsLoggedIn(false);
                            setLastSyncResult(null);
                            setLastSyncAt(null);
                            setSyncCursor(null);

                            // Reset profile state
                            setProfile({
                                fullName: "",
                                email: "",
                                mobileNumber: "",
                                currency: "",
                            });
                            setDraft({
                                fullName: "",
                                email: "",
                                mobileNumber: "",
                                currency: "",
                            });

                            // Redirect to onboarding
                            router.replace("/onboarding" as any);
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert(
                                "Error",
                                "Failed to logout. Please try again."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleSyncNow = async () => {
        if (isSyncing) {
            return;
        }

        setIsSyncing(true);
        try {
            const requestId = uuidv4();
            const syncTables = await buildSyncTablesFromLocal();
            const pushResponse = await syncPush({
                device_id: "dev-device",
                request_id: requestId,
                tables: {
                    pay_book: syncTables.pay_book,
                    collect_book: syncTables.collect_book,
                    settlements: syncTables.settlements,
                },
            });

            const pullResponse = await syncPull({
                cursor: syncCursor ?? undefined,
                limit: 100,
            });

            // Apply pulled data to database
            await applySyncPull(pullResponse);

            setSyncCursor(pullResponse.next_cursor ?? null);

            const processedCount = pushResponse.processed_ids?.length ?? 0;
            const conflictCount = pushResponse.conflicts?.length ?? 0;
            const payPullCount = (pullResponse.tables.pay_book.upserts ?? [])
                .length;
            const collectPullCount = (
                pullResponse.tables.collect_book.upserts ?? []
            ).length;
            const totalPulled = payPullCount + collectPullCount;

            setLastSyncResult(
                `Processed ${processedCount} ids with ${conflictCount} conflict(s). Pulled ${totalPulled} new/updated entries.`
            );

            const serverIso =
                pullResponse.server_time || pushResponse.server_time;
            if (serverIso) {
                const parsed = new Date(serverIso);
                setLastSyncAt(
                    Number.isNaN(parsed.getTime())
                        ? serverIso
                        : parsed.toLocaleString()
                );
            } else {
                setLastSyncAt(new Date().toLocaleString());
            }

            Alert.alert("Success", "Sync completed successfully!");
        } catch (error) {
            console.error("Sync failed:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unable to complete sync.";
            setLastSyncResult(`Sync failed: ${errorMessage}`);
            setLastSyncAt(new Date().toLocaleString());
            Alert.alert("Sync Failed", errorMessage);
        } finally {
            setIsSyncing(false);
        }
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
                    <>
                        {/* Sync Section - Only show when logged in */}
                        {isLoggedIn ? (
                            <View className='mt-6'>
                                <Text className='px-1 mb-2 text-xs font-medium text-gray-500'>
                                    Sync
                                </Text>
                                <View className='w-full rounded-xl border border-gray-100 bg-white'>
                                    <Pressable
                                        onPress={handleSyncNow}
                                        disabled={isSyncing}
                                        className={`flex-row items-center justify-between px-4 py-3 ${
                                            isSyncing
                                                ? "opacity-60"
                                                : "active:opacity-90"
                                        }`}
                                        accessibilityRole='button'
                                        accessibilityLabel='Sync data with server'
                                    >
                                        <View className='flex-row items-center gap-3'>
                                            <RefreshCw
                                                size={20}
                                                color={
                                                    isSyncing
                                                        ? "#9CA3AF"
                                                        : "#2563eb"
                                                }
                                            />
                                            <Text
                                                className={`text-sm ${
                                                    isSyncing
                                                        ? "text-gray-500"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {isSyncing
                                                    ? "Syncing..."
                                                    : "Sync Now"}
                                            </Text>
                                        </View>
                                        {isSyncing && (
                                            <ActivityIndicator
                                                size='small'
                                                color='#2563eb'
                                            />
                                        )}
                                    </Pressable>
                                    {lastSyncResult && (
                                        <>
                                            <View className='h-px bg-gray-100' />
                                            <View className='px-4 py-3'>
                                                <Text className='text-xs text-gray-600'>
                                                    {lastSyncResult}
                                                </Text>
                                                {lastSyncAt && (
                                                    <Text className='text-[10px] text-gray-500 mt-1'>
                                                        Last sync: {lastSyncAt}
                                                    </Text>
                                                )}
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View className='mt-6'>
                                <Text className='px-1 mb-2 text-xs font-medium text-gray-500'>
                                    Account
                                </Text>
                                <View className='w-full rounded-xl border border-gray-100 bg-white'>
                                    <Pressable
                                        onPress={() => setShowLoginModal(true)}
                                        className='flex-row items-center justify-between px-4 py-3 active:opacity-90 border-b border-gray-100'
                                        accessibilityRole='button'
                                        accessibilityLabel='Login to enable sync'
                                    >
                                        <View className='flex-row items-center gap-3'>
                                            <RefreshCw
                                                size={20}
                                                color='#9CA3AF'
                                            />
                                            <Text className='text-sm text-gray-900'>
                                                Login to enable sync
                                            </Text>
                                        </View>
                                        <Text className='text-blue-600 text-sm font-medium'>
                                            Login
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setShowSignupModal(true)}
                                        className='flex-row items-center justify-between px-4 py-3 active:opacity-90'
                                        accessibilityRole='button'
                                        accessibilityLabel='Sign up to create account'
                                    >
                                        <View className='flex-row items-center gap-3'>
                                            <User size={20} color='#9CA3AF' />
                                            <Text className='text-sm text-gray-900'>
                                                Create new account
                                            </Text>
                                        </View>
                                        <Text className='text-blue-600 text-sm font-medium'>
                                            Sign Up
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {/* Logout Button - Only show when logged in */}
                        {isLoggedIn && (
                            <View className='items-start mt-4'>
                                <Pressable
                                    onPress={handleLogout}
                                    accessibilityRole='button'
                                >
                                    <Text className='text-red-600 font-medium'>
                                        Logout
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </>
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

            {/* Login Modal */}
            <BottomModal
                visible={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setLoginEmail("");
                    setLoginPassword("");
                }}
                title='Login to Enable Sync'
                maxHeight={0.8}
                minHeight={0.3}
            >
                <KeyboardAwareScrollView className='px-4 pb-4'>
                    <Input
                        label='Email'
                        placeholder='you@example.com'
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        returnKeyType='next'
                        editable={!isLoggingIn}
                    />
                    <Input
                        label='Password'
                        placeholder='Enter your password'
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry
                        returnKeyType='done'
                        onSubmitEditing={handleLogin}
                        editable={!isLoggingIn}
                    />
                    <Pressable
                        onPress={handleLogin}
                        disabled={isLoggingIn}
                        className={`mt-4 rounded-md bg-blue-600 px-4 py-3 items-center ${
                            isLoggingIn ? "opacity-60" : "active:opacity-90"
                        }`}
                        accessibilityRole='button'
                        accessibilityLabel='Login button'
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator size='small' color='white' />
                        ) : (
                            <Text className='text-white font-semibold text-base'>
                                Login
                            </Text>
                        )}
                    </Pressable>
                    <View className='mt-4 flex-row items-center justify-center'>
                        <Text className='text-gray-600 text-sm'>
                            Don&apos;t have an account?{" "}
                        </Text>
                        <Pressable
                            onPress={() => {
                                setShowLoginModal(false);
                                setShowSignupModal(true);
                            }}
                            disabled={isLoggingIn}
                        >
                            <Text className='text-blue-600 font-medium text-sm'>
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </BottomModal>

            {/* Signup Modal */}
            <BottomModal
                visible={showSignupModal}
                onClose={() => {
                    setShowSignupModal(false);
                    setSignupEmail("");
                    setSignupPassword("");
                    setSignupConfirmPassword("");
                    setSignupUsername("");
                    setSignupMobile("");
                }}
                title='Create Account'
                maxHeight={0.8}
                minHeight={0.5}
            >
                <KeyboardAwareScrollView className='px-4 pb-4'>
                    <Input
                        label='Username'
                        placeholder='Enter your username'
                        value={signupUsername}
                        onChangeText={setSignupUsername}
                        autoCapitalize='none'
                        returnKeyType='next'
                        editable={!isSigningUp}
                    />
                    <Input
                        label='Email'
                        placeholder='you@example.com'
                        value={signupEmail}
                        onChangeText={setSignupEmail}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        returnKeyType='next'
                        editable={!isSigningUp}
                    />
                    <Input
                        label='Mobile Number (Optional)'
                        placeholder='+1234567890'
                        value={signupMobile}
                        onChangeText={setSignupMobile}
                        keyboardType='phone-pad'
                        returnKeyType='next'
                        editable={!isSigningUp}
                    />
                    <Input
                        label='Password'
                        placeholder='Enter your password (min 6 characters)'
                        value={signupPassword}
                        onChangeText={setSignupPassword}
                        secureTextEntry
                        returnKeyType='next'
                        editable={!isSigningUp}
                    />
                    <Input
                        label='Confirm Password'
                        placeholder='Confirm your password'
                        value={signupConfirmPassword}
                        onChangeText={setSignupConfirmPassword}
                        secureTextEntry
                        returnKeyType='done'
                        onSubmitEditing={handleSignup}
                        editable={!isSigningUp}
                    />
                    <Text className='mt-2 text-xs text-gray-500'>
                        Currency preference:{" "}
                        {profile.currency || draft.currency || "USD"} (from your
                        profile)
                    </Text>
                    <Pressable
                        onPress={handleSignup}
                        disabled={isSigningUp}
                        className={`mt-4 rounded-md bg-blue-600 px-4 py-3 items-center ${
                            isSigningUp ? "opacity-60" : "active:opacity-90"
                        }`}
                        accessibilityRole='button'
                        accessibilityLabel='Sign up button'
                    >
                        {isSigningUp ? (
                            <ActivityIndicator size='small' color='white' />
                        ) : (
                            <Text className='text-white font-semibold text-base'>
                                Sign Up
                            </Text>
                        )}
                    </Pressable>
                    <View className='mt-4 flex-row items-center justify-center'>
                        <Text className='text-gray-600 text-sm'>
                            Already have an account?{" "}
                        </Text>
                        <Pressable
                            onPress={() => {
                                setShowSignupModal(false);
                                setShowLoginModal(true);
                            }}
                            disabled={isSigningUp}
                        >
                            <Text className='text-blue-600 font-medium text-sm'>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </BottomModal>
        </KeyboardAwareScrollView>
    );
}
