import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import React from "react";
import Input from "../../components/form/Input";
import PrimaryButton from "../../components/button/PrimaryButton";
import GoogleButton from "../../components/button/GoogleButton";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { SignInFormData } from "../../type/interface";
import { useForm } from "react-hook-form";
import { useProfileStore } from "@/store/useProfileStore";
export default function SignInScreen() {
    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [loading, setLoading] = React.useState(false);
    const navigator = useNavigation();
    const router = useRouter();
    const setAuthenticated = useProfileStore((s) => s.setAuthenticated);
    const setProfile = useProfileStore((s) => s.setProfile);

    const email = watch("email");
    const password = watch("password");

    const onSubmit = async (data: SignInFormData) => {
        setLoading(true);
        try {
            // TODO: replace with real auth API
            await new Promise((res) => setTimeout(res, 800));
            setProfile({
                id: "demo",
                name: data.email.split("@")[0],
                email: data.email,
            });
            setAuthenticated(true);
            router.replace("/(auth)");
        } catch {
            Alert.alert("Sign in failed", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onGoogle = async () => {
        // TODO: integrate Google auth (e.g., expo-auth-session)
        Alert.alert("Google", "Google sign-in pressed");
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
                <CardContent className='flex flex-col items-center gap-3'>
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
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                >
                    <View className='flex-1 px-6 py-8'>
                        <Text className='text-3xl font-bold text-gray-900 mb-3'>
                            Welcome Back
                        </Text>
                        <Text className='text-gray-600 mb-8'>
                            Login to your account to continue
                        </Text>

                        <Input
                            label='Email'
                            value={email}
                            onChangeText={(text) => setValue("email", text)}
                            autoCapitalize='none'
                            keyboardType='email-address'
                            placeholder='you@example.com'
                            error={errors.email?.message}
                            className='mb-4'
                        />

                        <Input
                            label='Password'
                            value={password}
                            onChangeText={(text) => setValue("password", text)}
                            secureTextEntry
                            placeholder='your password'
                            error={errors.password?.message}
                            className='mb-6'
                        />

                        <PrimaryButton
                            title='Sign in'
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

                        <View className='mt-8 flex items-center gap-4'>
                            <TouchableOpacity
                                onPress={() =>
                                    navigator.navigate(
                                        "forgot-password" as never
                                    )
                                }
                                className='hover:opacity-80'
                            >
                                <Text className='text-gray-600 font-medium'>
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>

                            <View className='flex-row items-center'>
                                <Text className='text-gray-600'>
                                    Don&apos;t have an account?
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigator.navigate("sign-up" as never)
                                    }
                                    className='ml-2'
                                >
                                    <Text className='text-blue-600 font-medium'>
                                        Sign up
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
