import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/form/Input";
import BottomModal from "@/components/ui/BottomModal";
import { User, Wallet, CheckCircle2, ChevronDown } from "lucide-react-native";
import { upsertUser, upsertUserPreferences } from "@/db/models/User";
import { uuidv4 } from "@/utils/uuid";
import * as SecureStore from "expo-secure-store";

interface FormData {
    fullName: string;
    currency: string;
}

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

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";
const DEFAULT_USER_ID = "1";

export default function OnboardingScreen() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [currentStep, setCurrentStep] = useState<
        "welcome" | "form" | "complete"
    >("welcome");

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            fullName: "",
            currency: "INR",
        },
    });

    const selectedCurrency = watch("currency");
    const selectedCurrencyLabel =
        currencyOptions.find((c) => c.value === selectedCurrency)?.label ||
        "Select currency";

    const handleComplete = useCallback(async () => {
        router.replace("/");
    }, [router]);

    const onSubmit = useCallback(async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const userId = DEFAULT_USER_ID;
            const userPrefsId = uuidv4();

            // Split fullName into firstName and lastName
            const nameParts = data.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Create or update user
            await upsertUser({
                id: userId,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase() || "user"}@mot.local`,
                firstName: firstName,
                lastName: lastName || undefined,
                isActive: 1,
                dateJoined: Date.now(),
            });

            // Create or update user preferences
            await upsertUserPreferences({
                id: userPrefsId,
                userId: userId,
                currency: data.currency,
                language: "en",
                notifications: 1,
                emailNotifications: 1,
                smsNotifications: 1,
                pushNotifications: 1,
            });

            // Mark onboarding as complete
            await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, "true");

            setCurrentStep("complete");
        } catch (error) {
            console.error("Error saving user info:", error);
            // You might want to show an error message here
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    if (currentStep === "welcome") {
        return (
            <View className='flex-1 bg-gradient-to-b from-blue-50 to-white'>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className='flex-1'
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className='flex-1 items-center justify-center px-6 py-12'>
                            <View className='items-center mb-8'>
                                <View className='w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-lg'>
                                    <Wallet size={48} color='white' />
                                </View>
                                <Text className='text-3xl font-bold text-gray-900 text-center mb-3'>
                                    Welcome to Money On Track
                                </Text>
                                <Text className='text-base text-gray-600 text-center max-w-sm'>
                                    Let&apos;s set up your profile to get
                                    started tracking your money
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => setCurrentStep("form")}
                                className='w-full bg-blue-600 rounded-xl py-4 px-6 items-center active:bg-blue-700'
                                accessibilityRole='button'
                                accessibilityLabel='Get started'
                            >
                                <Text className='text-white text-lg font-semibold'>
                                    Get Started
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }

    if (currentStep === "complete") {
        return (
            <View className='flex-1 bg-gradient-to-b from-green-50 to-white'>
                <View className='flex-1 items-center justify-center px-6 py-12'>
                    <View className='items-center mb-8'>
                        <View className='w-24 h-24 bg-green-600 rounded-full items-center justify-center mb-6 shadow-lg'>
                            <CheckCircle2 size={48} color='white' />
                        </View>
                        <Text className='text-3xl font-bold text-gray-900 text-center mb-3'>
                            All Set!
                        </Text>
                        <Text className='text-base text-gray-600 text-center max-w-sm'>
                            Your profile has been set up successfully.
                            You&apos;re ready to start tracking your money.
                        </Text>
                    </View>

                    <Pressable
                        onPress={handleComplete}
                        className='w-full bg-green-600 rounded-xl py-4 px-6 items-center active:bg-green-700'
                        accessibilityRole='button'
                        accessibilityLabel='Continue to app'
                    >
                        <Text className='text-white text-lg font-semibold'>
                            Continue to App
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-gray-50'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View className='flex-1 px-6 py-8'>
                    <View className='mb-6'>
                        <Text className='text-2xl font-bold text-gray-900 mb-2'>
                            Set Up Your Profile
                        </Text>
                        <Text className='text-gray-600'>
                            Tell us a bit about yourself to personalize your
                            experience
                        </Text>
                    </View>

                    <Card className='mb-6'>
                        <CardContent className='p-6'>
                            <View className='mb-6'>
                                <View className='flex-row items-center gap-2 mb-4'>
                                    <User size={20} color='#4b5563' />
                                    <Text className='text-lg font-semibold text-gray-900'>
                                        Personal Information
                                    </Text>
                                </View>

                                <View className='mb-4'>
                                    <Text className='mb-2 text-sm font-medium text-gray-700'>
                                        Full Name
                                    </Text>
                                    <Controller
                                        control={control}
                                        name='fullName'
                                        rules={{
                                            required: "Full name is required",
                                            minLength: {
                                                value: 2,
                                                message:
                                                    "Name must be at least 2 characters",
                                            },
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <Input
                                                placeholder='Enter your full name'
                                                value={value}
                                                onChangeText={onChange}
                                                className='w-full'
                                                error={errors.fullName?.message}
                                                accessibilityLabel='Full name input'
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View className='border-t border-gray-200 pt-6'>
                                <View className='flex-row items-center gap-2 mb-4'>
                                    <Wallet size={20} color='#4b5563' />
                                    <Text className='text-lg font-semibold text-gray-900'>
                                        Currency Preference
                                    </Text>
                                </View>

                                <View className='mb-4'>
                                    <Text className='mb-2 text-sm font-medium text-gray-700'>
                                        Default Currency
                                    </Text>
                                    <Controller
                                        control={control}
                                        name='currency'
                                        rules={{
                                            required: "Currency is required",
                                        }}
                                        render={({ field: { value } }) => (
                                            <>
                                                <Pressable
                                                    onPress={() =>
                                                        setShowCurrencyModal(
                                                            true
                                                        )
                                                    }
                                                    className='w-full flex-row items-center justify-between border border-gray-300 rounded-md px-3 py-3 bg-white'
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Select currency'
                                                    accessibilityHint='Opens currency selection modal'
                                                >
                                                    <Text
                                                        className={`text-base ${
                                                            value
                                                                ? "text-gray-900"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {selectedCurrencyLabel}
                                                    </Text>
                                                    <ChevronDown
                                                        size={20}
                                                        color='#6b7280'
                                                    />
                                                </Pressable>
                                                {errors.currency && (
                                                    <Text className='mt-1 text-xs text-red-500'>
                                                        {
                                                            errors.currency
                                                                .message
                                                        }
                                                    </Text>
                                                )}
                                            </>
                                        )}
                                    />
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className='w-full bg-blue-600 rounded-xl py-4 px-6 items-center active:bg-blue-700 disabled:opacity-50'
                        accessibilityRole='button'
                        accessibilityLabel='Complete setup'
                        accessibilityState={{ disabled: isSubmitting }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color='white' />
                        ) : (
                            <Text className='text-white text-lg font-semibold'>
                                Complete Setup
                            </Text>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={() => router.back()}
                        className='mt-4 items-center'
                        accessibilityRole='button'
                        accessibilityLabel='Go back'
                    >
                        <Text className='text-gray-600 text-base'>
                            I&apos;ll do this later
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAwareScrollView>

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
                                setValue("currency", option.value, {
                                    shouldValidate: true,
                                });
                                setShowCurrencyModal(false);
                            }}
                            className={`px-6 py-4 border-b border-gray-100 active:bg-gray-50 ${
                                selectedCurrency === option.value
                                    ? "bg-blue-50"
                                    : "bg-white"
                            }`}
                            accessibilityRole='button'
                            accessibilityLabel={`Select ${option.label}`}
                            accessibilityState={{
                                selected: selectedCurrency === option.value,
                            }}
                        >
                            <View className='flex-row items-center justify-between'>
                                <View className='flex-1'>
                                    <Text
                                        className={`text-base font-medium ${
                                            selectedCurrency === option.value
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
                                {selectedCurrency === option.value && (
                                    <CheckCircle2 size={20} color='#2563eb' />
                                )}
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </BottomModal>
        </View>
    );
}
