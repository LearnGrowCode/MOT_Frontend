import {
    View,
    Text,
    Alert,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../components/form/Input";
import PrimaryButton from "../../components/button/PrimaryButton";
import GoogleButton from "../../components/button/GoogleButton";
import { useRouter } from "expo-router";
import { Card } from "../../components/ui/card";

import { SignUpFormData } from "../../type/interface";
import { useProfileStore } from "@/store/useProfileStore";
import { signup } from "@/api/Authentication";

export default function SignUpScreen() {
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    const { updateToken } = useProfileStore();

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
            const response = await signup(data.email, data.password, data.name);
            console.log(response.success);
            if (response.success) {
                updateToken(
                    response.data.refresh_token,
                    response.data.access_token
                );
                router.replace("/(auth)");
            } else {
                Alert.alert("Sign up failed");
            }
        } catch {
            Alert.alert("Sign up failed", "Please try again.");
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
            <Card className='bg-white p-5 shadow-md rounded-xl my-4 mx-3'>
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                >
                    <View className='flex-1 px-2 py-2'>
                        <View className='items-center mb-3'>
                            <View className='flex-row items-center'>
                                <Image
                                    source={require("../../../assets/images/icon.png")}
                                    className='w-8 h-8 mr-2'
                                />
                                <Text className='text-xl font-bold text-gray-900'>
                                    MOT
                                </Text>
                            </View>
                        </View>
                        <Text className='text-2xl font-bold text-gray-900 mb-1'>
                            Create Account
                        </Text>
                        <Text className='text-gray-600 mb-5'>
                            Sign up to get started
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
                                    className='mb-3'
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
                                    className='mb-3'
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
                                    className='mb-3'
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
                                    className='mb-4'
                                />
                            )}
                        />

                        <PrimaryButton
                            title='Sign up'
                            onPress={handleSubmit(onSubmit)}
                            loading={loading}
                            className='bg-blue-600 hover:bg-blue-700'
                        />

                        <View className='my-4 flex-row items-center'>
                            <View className='h-[1px] flex-1 bg-gray-200' />
                            <Text className='mx-3 text-gray-500 font-medium'>
                                or continue with
                            </Text>
                            <View className='h-[1px] flex-1 bg-gray-200' />
                        </View>

                        <GoogleButton
                            onPress={onGoogle}
                            className='shadow-xs'
                        />

                        <View className='mt-6 flex items-center gap-3'>
                            <View className='flex-row items-center'>
                                <Text className='text-gray-600'>
                                    Already have an account?
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push("/sign-in")}
                                    className='ml-2'
                                >
                                    <Text className='text-blue-600 font-medium'>
                                        Sign in
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </Card>
        </ScrollView>
    );
}
