import Input from "@/components/form/Input";
import BottomModal from "@/components/ui/BottomModal";
import { Card, CardContent } from "@/components/ui/card";
import { upsertUser, upsertUserPreferences } from "@/db/models/User";
import { uuidv4 } from "@/utils/uuid";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { CheckCircle2, ChevronDown, User, Wallet } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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
            <View className='flex-1 bg-background'>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className='flex-1'
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className='flex-1 items-center justify-center px-6 py-12'>
                            <View className='items-center mb-10'>
                                <View className='w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-8 shadow-xl shadow-primary/20 transform rotate-3'>
                                    <Wallet size={48} color='hsl(var(--primary-foreground))' />
                                </View>
                                <Text className='text-4xl font-black text-foreground text-center mb-4 tracking-tight'>
                                    Money On Track
                                </Text>
                                <Text className='text-lg text-muted-foreground text-center max-w-sm leading-6'>
                                    Your personal finance companion. Let&apos;s set up your profile to start tracking.
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => setCurrentStep("form")}
                                className='w-full bg-primary rounded-2xl py-5 px-6 items-center active:opacity-90 shadow-lg shadow-primary/20'
                                accessibilityRole='button'
                                accessibilityLabel='Get started'
                            >
                                <Text className='text-primary-foreground text-xl font-bold'>
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
            <View className='flex-1 bg-background'>
                <View className='flex-1 items-center justify-center px-6 py-12'>
                    <View className='items-center mb-8'>
                        <View className='w-24 h-24 bg-green-500 rounded-3xl items-center justify-center mb-8 shadow-xl shadow-green-500/20 transform -rotate-3'>
                            <CheckCircle2 size={48} color='white' />
                        </View>
                        <Text className='text-4xl font-black text-foreground text-center mb-4 tracking-tight'>
                            All Set!
                        </Text>
                        <Text className='text-lg text-muted-foreground text-center max-w-sm leading-6'>
                            Your profile is ready. You&apos;re now set to take control of your finances.
                        </Text>
                    </View>
                    <Pressable
                        onPress={handleComplete}
                        className='w-full bg-green-500 rounded-2xl py-5 px-6 items-center active:opacity-90 shadow-lg shadow-green-500/20'
                        accessibilityRole='button'
                        accessibilityLabel='Continue to app'
                    >
                        <Text className='text-white text-xl font-bold'>
                            Continue to App
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-background'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View className='flex-1 px-6 py-8'>
                    <View className='mb-8'>
                        <Text className='text-3xl font-black text-foreground mb-2 tracking-tight'>
                            Set Up Your Profile
                        </Text>
                        <Text className='text-muted-foreground text-lg leading-6'>
                            Let&apos;s personalize your experience with a few details.
                        </Text>
                    </View>
                    <Card className='mb-8 border-border bg-card shadow-sm'>
                        <CardContent className='p-6'>
                            <View className='mb-8'>
                                <View className='flex-row items-center gap-3 mb-6'>
                                    <View className='p-2 bg-primary/10 rounded-lg'>
                                        <User size={20} className="text-primary" />
                                    </View>
                                    <Text className='text-xl font-bold text-foreground'>
                                        Personal Information
                                    </Text>
                                </View>
                                <View className='mb-4'>
                                    <Text className='mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wider'>
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

                            <View className='border-t border-border pt-8'>
                                <View className='flex-row items-center gap-3 mb-6'>
                                    <View className='p-2 bg-primary/10 rounded-lg'>
                                        <Wallet size={20} className="text-primary" />
                                    </View>
                                    <Text className='text-xl font-bold text-foreground'>
                                        Currency Preference
                                    </Text>
                                </View>
                                <View className='mb-4'>
                                    <Text className='mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wider'>
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
                                                    className='w-full flex-row items-center justify-between border border-input rounded-xl px-4 py-4 bg-background active:bg-accent'
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Select currency'
                                                    accessibilityHint='Opens currency selection modal'
                                                >
                                                    <Text
                                                        className={`text-base font-medium ${value
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {selectedCurrencyLabel}
                                                    </Text>
                                                    <ChevronDown
                                                        size={20}
                                                        className="text-muted-foreground"
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
                        className='w-full bg-primary rounded-2xl py-5 px-6 items-center active:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20'
                        accessibilityRole='button'
                        accessibilityLabel='Complete setup'
                        accessibilityState={{ disabled: isSubmitting }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color='hsl(var(--primary-foreground))' />
                        ) : (
                            <Text className='text-primary-foreground text-xl font-bold'>
                                Complete Setup
                            </Text>
                        )}
                    </Pressable>

                </View>
            </KeyboardAwareScrollView>

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
                            className={`px-6 py-4 border-b border-border active:bg-accent ${selectedCurrency === option.value
                                ? "bg-accent"
                                : "bg-card"
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
                                        className={`text-base font-medium ${selectedCurrency === option.value
                                            ? "text-primary"
                                            : "text-foreground"
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text className='text-sm text-muted-foreground mt-0.5'>
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
