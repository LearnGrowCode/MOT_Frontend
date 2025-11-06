import {
    View,
    Text,
    Alert,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useEffect, useState } from "react";
import Input from "../../components/form/Input";
import PrimaryButton from "../../components/button/PrimaryButton";
import GoogleButton from "../../components/button/GoogleButton";
import { useRouter } from "expo-router";
import { Card } from "../../components/ui/card";
import { SignInFormData } from "../../type/interface";
import { useForm } from "react-hook-form";
import { useProfileStore } from "@/store/useProfileStore";
import { login } from "@/api/Authentication";
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
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { updateToken, checkAuthentication } = useProfileStore();

    const email = watch("email");
    const password = watch("password");

    const onSubmit = async (data: SignInFormData) => {
        setLoading(true);
        try {
            const response = await login(data.email, data.password);
            console.log(response);
            console.log(response.success);
            if (response.success) {
                console.log(response.data);
                updateToken(
                    response.data.refresh_token,
                    response.data.access_token
                );
                router.replace("/(auth)");
            } else {
                Alert.alert("Sign in failed");
            }
        } catch (error) {
            console.log("error", error);
            Alert.alert("Sign in failed", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onGoogle = async () => {
        // TODO: integrate Google auth (e.g., expo-auth-session)
        Alert.alert("Google", "Google sign-in pressed");
    };

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await checkAuthentication();
            if (isAuthenticated) {
                router.replace("/(auth)");
            }
        };
        checkAuth();
    }, [checkAuthentication, router]);
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
                            Welcome Back
                        </Text>
                        <Text className='text-gray-600 mb-5'>
                            Sign in to continue
                        </Text>

                        <Input
                            label='Email'
                            value={email}
                            onChangeText={(text) => setValue("email", text)}
                            autoCapitalize='none'
                            keyboardType='email-address'
                            placeholder='you@example.com'
                            error={errors.email?.message}
                            className='mb-3'
                        />

                        <Input
                            label='Password'
                            value={password}
                            onChangeText={(text) => setValue("password", text)}
                            secureTextEntry
                            placeholder='your password'
                            error={errors.password?.message}
                            className='mb-4'
                        />

                        <PrimaryButton
                            title='Sign in'
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
                            <TouchableOpacity
                                onPress={() =>
                                    router.push("/forget-password" as any)
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
                                    onPress={() => router.push("/sign-up")}
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
