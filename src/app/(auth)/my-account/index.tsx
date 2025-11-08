import React, { useState } from "react";
import {
    View,
    Text,
    Platform,
    Pressable,
    Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";  
import Input from "@/components/form/Input";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Option } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";

const currencyOptions = [
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "USD - US Dollar", value: "USD" },
];

export default function MyAccountScreen() {
    const [profile, setProfile] = useState({
        fullName: "John Doe",
        email: "john@example.com",
        mobileNumber: "+1 555 123 4567",
        currency: { value: "USD", label: "USD - US Dollar" } as
            | Option
            | undefined,
        imageUri: undefined as string | undefined,
    });
    const [draft, setDraft] = useState(profile);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Persist profile info here
            setProfile(draft);
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handlePickImage = async () => {
        // Integrate an image picker if available; for now this is a placeholder
        // setImageUri(pickedUri);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "You have pressed logout.");
    };

    const startEdit = () => {
        setDraft(profile);
        setIsEditing(true);
    };

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
                    <Avatar alt='Profile image' className='size-28'>
                        {isEditing ? (
                            draft.imageUri ? (
                                <AvatarImage source={{ uri: draft.imageUri }} />
                            ) : (
                                <AvatarFallback>
                                    <Text className='text-lg font-semibold'>
                                        IMG
                                    </Text>
                                </AvatarFallback>
                            )
                        ) : profile.imageUri ? (
                            <AvatarImage source={{ uri: profile.imageUri }} />
                        ) : (
                            <AvatarFallback>
                                <Text className='text-lg font-semibold'>
                                    IMG
                                </Text>
                            </AvatarFallback>
                        )}
                    </Avatar>
                    {isEditing ? (
                        <Pressable
                            onPress={handlePickImage}
                            className='absolute -bottom-1 -right-1 rounded-full bg-white p-2 border border-gray-200'
                        >
                            <Text className='text-blue-600 text-xs'>📷</Text>
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
                                    {profile.currency?.value || "—"}
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
                    <View className='w-full mb-3 z-50'>
                        <Text className='mb-1 text-sm text-gray-600'>
                            Preferred Currency
                        </Text>
                        <Select
                            value={draft.currency}
                            onValueChange={(v: Option) =>
                                setDraft((p) => ({ ...p, currency: v }))
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select currency' />
                            </SelectTrigger>
                            <SelectContent position='item-aligned'>
                                {currencyOptions.map((c) => (
                                    <SelectItem
                                        key={c.value}
                                        value={c.value}
                                        label={c.label}
                                    >
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </View>
                    {null}
                </>
            )}
            {!isEditing ? (
                <View className=' items-start mt-4'>
                    <Pressable
                        onPress={handleLogout}
                        accessibilityRole='button'
                    >
                        <Text className='text-red-600 font-medium'>Logout</Text>
                        </Pressable>
                    </View>
                ) : null}
            </CardContent>
        </KeyboardAwareScrollView>
    );
}
