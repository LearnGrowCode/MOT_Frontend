import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from "react-native";
import React from "react";
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

export default function SignInScreen() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errors, setErrors] = React.useState<{
        email?: string;
        password?: string;
    }>({});
    const [loading, setLoading] = React.useState(false);
    const navigator = useNavigation();
    const validate = () => {
        const next: { email?: string; password?: string } = {};
        if (!email.trim()) next.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            next.email = "Enter a valid email";
        if (!password) next.password = "Password is required";
        if (password && password.length < 6) next.password = "Min 6 characters";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            // TODO: replace with real auth API
            await new Promise((res) => setTimeout(res, 800));
            Alert.alert("Signed in", `Welcome ${email}`);
        } finally {
            setLoading(false);
        }
    };

    const onGoogle = async () => {
        // TODO: integrate Google auth (e.g., expo-auth-session)
        Alert.alert("Google", "Google sign-in pressed");
    };

    return (
        <View className='flex-1 bg-white'>
            <Card className='from-blue-500 to-blue-600 bg-gradient-to-b text-white flex flex-col items-center justify-center'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-white'>Money On Track</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center justify-center'>
                    <Text className='text-white'>Simple Secure Smart</Text>
                    <Text className='text-white'>
                        Easist way to track money you&apos;ve lent or borrowed
                    </Text>
                </CardContent>
            </Card>
            <KeyboardAvoidingView
                className='flex-1 bg-white'
                behavior={Platform.select({
                    ios: "padding",
                    android: undefined,
                })}
            >
                <View className='flex-1 px-6 py-10'>
                    <View className='mt-10' />
                    <Text className='mb-2 text-3xl font-bold text-gray-900'>
                        Welcome Back
                    </Text>
                    <Text className='mb-8 text-gray-600'>
                        Login to your account to continue
                    </Text>

                    <Input
                        label='Email'
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize='none'
                        keyboardType='email-address'
                        placeholder='you@example.com'
                        error={errors.email}
                    />

                    <Input
                        label='Password'
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder='your password'
                        error={errors.password}
                    />

                    <PrimaryButton
                        title='Sign in'
                        onPress={onSubmit}
                        loading={loading}
                        className='mt-2 bg-black '
                    />

                    <View className='my-6 flex-row items-center'>
                        <View className='h-[1px] flex-1 bg-gray-200' />
                        <Text className='mx-3 text-gray-500'>
                            or continue with
                        </Text>
                        <View className='h-[1px] flex-1 bg-gray-200' />
                    </View>

                    <GoogleButton onPress={onGoogle} />
                    <View className='my-6 flex-row items-center'>
                        <View className='h-[1px] flex-1 bg-gray-200' />
                        <Text className='mx-3 text-gray-500'>or</Text>
                        <View className='h-[1px] flex-1 bg-gray-200' />
                    </View>
                    <View className='flex-col items-center justify-center'>
                        <TouchableOpacity
                            onPress={() =>
                                navigator.navigate("/forgot-password")
                            }
                        >
                            <Text className=' text-gray-500 '>
                                Forgot your password?
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigator.navigate("/sign-up")}
                            className='mt-2 flex flex-row items-center justify-center'
                        >
                            <Text className='mx-3 text-gray-500'>
                                {" "}
                                Don&apos;t have an account?
                            </Text>
                            <Text className='text-blue-600'>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
