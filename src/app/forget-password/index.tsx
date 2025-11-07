import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import Input from "@/components/form/Input";
import PrimaryButton from "@/components/button/PrimaryButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/services/api/auth.service";

export default function ForgetPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const onSubmit = async () => {
        if (!email) {
            Alert.alert("Required", "Please enter your email address.");
            return;
        }
        setLoading(true);
        try {
            const response = await requestPasswordReset(email);
            if (response.success) {
                Alert.alert(
                    "Email sent",
                    "If this email is registered, you will receive reset instructions.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            } else {
                Alert.alert(
                    "Failed",
                    "Unable to process request. Please try again."
                );
            }
        } catch {
            Alert.alert(
                "Error",
                "Something went wrong. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className=' bg-slate-50'>
            <Card className='bg-white p-8 shadow-xl rounded-2xl my-3 mx-3'>
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                >
                    <View className='flex-1 px-6 py-8'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-2xl font-bold text-gray-900'>
                                Forgot Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Text className='text-gray-600 mb-6'>
                                Enter your account email and we will send you
                                instructions to reset your password.
                            </Text>

                            <Input
                                label='Email'
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize='none'
                                keyboardType='email-address'
                                placeholder='you@example.com'
                                className='mb-6'
                            />

                            <PrimaryButton
                                title='Send reset link'
                                onPress={onSubmit}
                                loading={loading}
                                className='bg-blue-600'
                            />

                            <View className='mt-6'>
                                <Text
                                    className='text-blue-600 font-medium'
                                    onPress={() => router.back()}
                                >
                                    Back to sign in
                                </Text>
                            </View>
                        </CardContent>
                    </View>
                </KeyboardAwareScrollView>
            </Card>
        </ScrollView>
    );
}
