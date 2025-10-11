import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../components/form/Input";
import PrimaryButton from "../../components/button/PrimaryButton";
import GoogleButton from "../../components/button/GoogleButton";
import { useNavigation } from "@react-navigation/native";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";

import { SignUpFormData } from "../../type/interface";

export default function SignUpScreen() {
    const [loading, setLoading] = React.useState(false);
    const navigator = useNavigation();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignUpFormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    const onSubmit = async (data: SignUpFormData) => {
        setLoading(true);
        try {
            // TODO: replace with real auth API
            await new Promise((res) => setTimeout(res, 800));
            Alert.alert(
                "Account created",
                `Welcome ${data.name}! Your account has been created successfully.`
            );
        } finally {
            setLoading(false);
        }
    };

    const onGoogle = async () => {
        // TODO: integrate Google auth (e.g., expo-auth-session)
        Alert.alert("Google", "Google sign-up pressed");
    };

    return (
        <ScrollView className=' bg-slate-50'>
            <Card className='bg-gradient-to-br from-blue-500 to-blue-700 p-8 shadow-xl rounded-2xl mt-3 mx-3'>
                <View className='flex items-center justify-center mb-6'>
                    <View className='bg-white rounded-full w-24 h-24 shadow-lg flex items-center justify-center'>
                        <View className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-full w-20 h-20 flex items-center justify-center'>
                            <Text className='text-white font-bold text-3xl'>
                                MOT
                            </Text>
                        </View>
                    </View>
                </View>
                <CardHeader className='text-center pb-4'>
                    <CardTitle className='text-white font-bold text-4xl tracking-tight text-center'>
                        Money On Track
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center space-y-3'>
                    <Text className='text-white text-xl font-semibold tracking-wide'>
                        Simple • Secure • Smart
                    </Text>
                    <Text className='text-blue-100 text-center text-lg'>
                        The easiest way to track money you&apos;ve lent or
                        borrowed
                    </Text>
                </CardContent>
            </Card>
            <Card className='bg-white p-8 shadow-xl rounded-2xl my-3 mx-3'>
                <KeyboardAvoidingView
                    className='flex-1'
                    behavior={Platform.select({
                        ios: "padding",
                        android: undefined,
                    })}
                >
                    <View className='flex-1 px-6 py-8'>
                        <Text className='text-3xl font-bold text-gray-900 mb-3'>
                            Create Account
                        </Text>
                        <Text className='text-gray-600 mb-8'>
                            Sign up to start tracking your money
                        </Text>

                        <Controller
                            control={control}
                            name='name'
                            rules={{
                                required: "Name is required",
                                minLength: {
                                    value: 2,
                                    message:
                                        "Name must be at least 2 characters",
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <Input
                                    label='Full Name'
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize='words'
                                    placeholder='John Doe'
                                    error={errors.name?.message}
                                    className='mb-4'
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name='email'
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email",
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <Input
                                    label='Email'
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize='none'
                                    keyboardType='email-address'
                                    placeholder='you@example.com'
                                    error={errors.email?.message}
                                    className='mb-4'
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name='password'
                            rules={{
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <Input
                                    label='Password'
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry
                                    placeholder='your password'
                                    error={errors.password?.message}
                                    className='mb-4'
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name='confirmPassword'
                            rules={{
                                required: "Confirm password is required",
                                validate: (value) =>
                                    value === password ||
                                    "Passwords do not match",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <Input
                                    label='Confirm Password'
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry
                                    placeholder='confirm your password'
                                    error={errors.confirmPassword?.message}
                                    className='mb-6'
                                />
                            )}
                        />

                        <PrimaryButton
                            title='Sign up'
                            onPress={handleSubmit(onSubmit)}
                            loading={loading}
                            className='bg-blue-600 hover:bg-blue-700'
                        />

                        <View className='my-8 flex-row items-center'>
                            <View className='h-[1px] flex-1 bg-gray-200' />
                            <Text className='mx-4 text-gray-500 font-medium'>
                                or continue with
                            </Text>
                            <View className='h-[1px] flex-1 bg-gray-200' />
                        </View>

                        <GoogleButton
                            onPress={onGoogle}
                            className='shadow-sm'
                        />

                        <View className='mt-8 flex items-center space-y-4'>
                            <View className='flex-row items-center'>
                                <Text className='text-gray-600'>
                                    Already have an account?
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigator.navigate("sign-in" as never)
                                    }
                                    className='ml-2'
                                >
                                    <Text className='text-blue-600 font-medium'>
                                        Sign in
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Card>
        </ScrollView>
    );
}
