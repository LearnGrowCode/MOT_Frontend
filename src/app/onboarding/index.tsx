import Input from "@/components/form/Input";
import BottomModal from "@/components/ui/BottomModal";
import { Card, CardContent } from "@/components/ui/card";
import { upsertUser, upsertUserPreferences } from "@/db/models/User";
import { uuidv4 } from "@/utils/uuid";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    BanknoteArrowDownIcon,
    BanknoteArrowUpIcon,
    CheckCircle2,
    ChevronDown,
    User,
    Wallet,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
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
// SafeAreaView import removed
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
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [currentStep, setCurrentStep] = useState<
        "welcome" | "roles" | "form" | "complete"
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
            <View className='flex-1 bg-background relative overflow-hidden'>
                {/* Decorative Background Elements for Dark Mode */}
                {colorScheme === "dark" && (
                    <>
                        <View 
                            className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
                            pointerEvents="none"
                        />
                    </>
                )}
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
                                <View className='w-28 h-28 bg-primary rounded-[40px] items-center justify-center mb-10 shadow-2xl shadow-primary/30 transform rotate-6 border-4 border-white/10'>
                                    <Wallet size={56} color={colorScheme === "dark" ? "#000" : "#fff"} />
                                </View>
                                <Text className='text-5xl font-black text-foreground text-center mb-6 tracking-tighter'>
                                    Money On Track
                                </Text>
                                <Text className='text-xl text-muted-foreground text-center max-w-sm leading-8 font-medium'>
                                    Your professional finance companion. Let&apos;s get you started.
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => setCurrentStep("roles")}
                                className='w-full bg-primary rounded-[24px] py-6 px-10 items-center active:bg-primary/90 shadow-2xl shadow-primary/40'
                                accessibilityRole='button'
                                accessibilityLabel='Get started'
                            >
                                <Text className='text-primary-foreground text-2xl font-black tracking-tight'>
                                    Get Started
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }

    if (currentStep === "roles") {
        return (
            <View className='flex-1 bg-background relative overflow-hidden'>
                {/* Decorative Background Elements for Dark Mode */}
                {colorScheme === "dark" && (
                    <>
                        <View 
                            className="absolute -bottom-32 -left-32 w-80 h-80 bg-tertiary-500/10 rounded-full blur-[100px]"
                            pointerEvents="none"
                        />
                    </>
                )}
                <View className='flex-1 px-6 py-12'>
                    <View className='mb-6'>
                        <Text className='text-4xl font-black text-foreground mb-2 tracking-tighter'>
                            The Two Books
                        </Text>
                        <View className='h-1 w-16 bg-primary rounded-full mb-2' />
                        <Text className='text-lg text-muted-foreground leading-7 font-medium'>
                            We organize your finances into two main books for ultimate clarity.
                        </Text>
                    </View>

                    <Card className='mb-8 border-border/40 bg-card/60 backdrop-blur-2xl shadow-xl shadow-black/10'>
                        <CardContent className='p-2 flex-row items-center gap-6'>
                            <View className='w-16 h-16 bg-tertiary-500 rounded-3xl items-center justify-center shadow-2xl shadow-tertiary-500/30 border-4 border-white/10'>
                                <BanknoteArrowUpIcon size={32} color='white' />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-2xl font-black text-foreground mb-2'>Pay Book</Text>
                                <Text className='text-muted-foreground leading-6 font-medium'>
                                    For money you owe others and need to return.
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    <Card className='mb-12 border-border/40 bg-card/60 backdrop-blur-2xl shadow-xl shadow-black/10'>
                        <CardContent className='p-8 flex-row items-center gap-6'>
                            <View className='w-16 h-16 bg-primary rounded-3xl items-center justify-center shadow-2xl shadow-primary/30 border-4 border-white/10'>
                                <BanknoteArrowDownIcon size={32} color='white' />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-2xl font-black text-foreground mb-2'>Collect Book</Text>
                                <Text className='text-muted-foreground leading-6 font-medium'>
                                    For money lent to others that you need to get back.
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    <View className='mt-auto pt-6'>
                        <Pressable
                            onPress={() => setCurrentStep("form")}
                            className='w-full bg-primary rounded-[24px] py-6 px-10 items-center active:bg-primary/90 shadow-2xl shadow-primary/40'
                            accessibilityRole='button'
                            accessibilityLabel='Continue'
                        >
                            <Text className='text-primary-foreground text-2xl font-black tracking-tight'>
                                Got It
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    if (currentStep === "complete") {
        return (
            <View className='flex-1 bg-background relative overflow-hidden'>
                {/* Decorative Background Elements for Dark Mode */}
                {colorScheme === "dark" && (
                    <>
                        <View 
                            className="absolute -top-32 -right-32 w-80 h-80 bg-green-500/10 rounded-full blur-[100px]"
                            pointerEvents="none"
                        />
                        <View 
                            className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
                            pointerEvents="none"
                        />
                    </>
                )}
                <View className='flex-1 items-center justify-center px-6 py-12'>
                    <View className='items-center mb-12'>
                        <View className='w-32 h-32 bg-green-500 rounded-[40px] items-center justify-center mb-10 shadow-2xl shadow-green-500/40 transform -rotate-6 border-4 border-white/10'>
                            <CheckCircle2 size={64} color='white' />
                        </View>
                        <Text className='text-5xl font-black text-foreground text-center mb-6 tracking-tighter'>
                            You&apos;re All Set!
                        </Text>
                        <Text className='text-xl text-muted-foreground text-center max-w-sm leading-8 font-medium'>
                            Your profile is ready. It&apos;s time to take control of your finances.
                        </Text>
                    </View>
                    <Pressable
                        onPress={handleComplete}
                        className='w-full bg-green-500 rounded-[24px] py-6 px-10 items-center active:bg-green-600 shadow-2xl shadow-green-500/40'
                        accessibilityRole='button'
                        accessibilityLabel='Continue to app'
                    >
                        <Text className='text-white text-2xl font-black tracking-tight'>
                            Start Tracking
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
                <View className='flex-1 px-6 py-8 relative overflow-hidden'>
                    {/* Decorative Background Elements for Dark Mode */}
                    {colorScheme === "dark" && (
                        <>
                            <View 
                                className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
                                pointerEvents="none"
                            />
                            <View 
                                className="absolute top-1/2 -left-32 w-64 h-64 bg-tertiary-500/10 rounded-full blur-[120px]"
                                pointerEvents="none"
                            />
                        </>
                    )}
                    
                    <View className='mb-6'>
                        <Text className='text-4xl font-black text-foreground mb-3 tracking-tight'>
                            Set Up Your Profile
                        </Text>
                        <View className='h-1 w-16 bg-primary rounded-full mb-4' />
                        <Text className='text-muted-foreground text-lg leading-7'>
                            Let&apos;s personalize your experience with a few details.
                        </Text>
                    </View>

                    <Card className='mb-8 border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden'>
                        <CardContent className='px-4'>
                            <View>
                                <View className='flex-row items-center gap-4 mb-4'>
                                    <View className='w-14 h-14 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20'>
                                        <User size={28} color={colorScheme === "dark" ? "white" : "black"}  />
                                    </View>
                                    <View>
                                        <Text className='text-2xl font-black text-foreground tracking-tight'>
                                            Personal Info
                                        </Text>
                                        <Text className='text-sm text-muted-foreground font-medium'>How should we call you?</Text>
                                    </View>
                                </View>
                                <View className='mb-4'>
                                    <Text className='mb-3 text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-2'>
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
                                                className='w-full bg-background/40 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                                error={errors.fullName?.message}
                                                accessibilityLabel='Full name input'
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View className='border-t border-border/30'>
                                <View className='flex-row items-center gap-4 mb-4'>
                                    <View className='w-14 h-14 bg-tertiary-500/10 rounded-2xl items-center justify-center border border-tertiary-500/30'>
                                        <Wallet size={28} color={colorScheme === "dark" ? "white" : "black"} className="text-tertiary-600 dark:text-tertiary-400" />
                                    </View>
                                    <View>
                                        <Text className='text-2xl font-black text-foreground tracking-tight'>
                                            Money Config
                                        </Text>
                                        <Text className='text-sm text-muted-foreground font-medium'>Set your primary currency</Text>
                                    </View>
                                </View>
                                <View className='mb-4'>
                                    <Text className='mb-3 text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-2'>
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
                                                    className='w-full flex-row items-center justify-between border-2 border-primary/30 rounded-2xl px-6 py-5 bg-primary/5 active:bg-primary/20 shadow-sm shadow-primary/10'
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Select currency'
                                                    accessibilityHint='Opens currency selection modal'
                                                >
                                                    <View className='flex-row items-center gap-4'>
                                                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                                                            <Text className="text-primary font-black text-lg">
                                                                {value === "INR" ? "₹" : value === "USD" ? "$" : value === "EUR" ? "€" : "¤"}
                                                            </Text>
                                                        </View>
                                                        <View>
                                                            <Text className='text-lg font-black text-foreground'>
                                                                {value}
                                                            </Text>
                                                            <Text className='text-sm text-muted-foreground font-bold'>
                                                                {currencyOptions.find((c) => c.value === value)?.label.split(' - ')[1]}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View className="bg-primary/10 p-2 rounded-xl">
                                                        <ChevronDown
                                                            size={20}
                                                            color={colorScheme === "dark" ? "white" : "black"}
                                                          
                                                        />
                                                    </View>
                                                </Pressable>
                                                {errors.currency && (
                                                    <Text className='mt-3 text-xs font-black text-red-500 ml-2'>
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
                        className='w-full bg-primary rounded-2xl py-6 px-6 items-center active:opacity-90 disabled:opacity-50 shadow-2xl shadow-primary/30 mt-4'
                        accessibilityRole='button'
                        accessibilityLabel='Complete setup'
                        accessibilityState={{ disabled: isSubmitting }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={colorScheme === "dark" ? "#1a1a1a" : "#fff"} />
                        ) : (
                            <Text className='text-primary-foreground text-xl font-black dark:text-white tracking-tight'>
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
                            className={`px-6 py-5 border-b border-border/40 active:bg-primary/10 ${selectedCurrency === option.value
                                ? "bg-primary/5"
                                : "bg-card"
                                }`}
                            accessibilityRole='button'
                            accessibilityLabel={`Select ${option.label}`}
                            accessibilityState={{
                                selected: selectedCurrency === option.value,
                            }}
                        >
                            <View className='flex-row items-center justify-between'>
                                <View className='flex-row items-center gap-4 flex-1'>
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selectedCurrency === option.value ? "bg-primary" : "bg-secondary"}`}>
                                        <Text className={`font-black text-lg ${selectedCurrency === option.value ? "text-primary-foreground" : "text-foreground"}`}>
                                            {option.value === "INR" ? "₹" : option.value === "USD" ? "$" : option.value === "EUR" ? "€" : "¤"}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className={`text-lg font-bold ${selectedCurrency === option.value
                                                ? "text-primary"
                                                : "text-foreground"
                                                }`}
                                        >
                                            {option.label.split(' - ')[1]}
                                        </Text>
                                        <Text className='text-xs text-muted-foreground font-black tracking-widest uppercase'>
                                            {option.value}
                                        </Text>
                                    </View>
                                </View>
                                {selectedCurrency === option.value && (
                                    <View className="bg-primary/20 p-2 rounded-full">
                                        <CheckCircle2 size={20} color={colorScheme === "dark" ? "white" : "black"}  />
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </BottomModal>
        </View>
    );
}
