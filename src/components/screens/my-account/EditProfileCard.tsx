import React from "react";
import { View, Text, Pressable } from "react-native";
import Input from "@/components/form/Input";

interface EditProfileCardProps {
    draftFullName: string;
    setDraftFullName: (text: string) => void;
    draftCurrency: string;
    selectedCurrencyLabel: string;
    onOpenCurrencyModal: () => void;
}

export default function EditProfileCard({
    draftFullName,
    setDraftFullName,
    draftCurrency,
    selectedCurrencyLabel,
    onOpenCurrencyModal,
}: EditProfileCardProps) {
    return (
        <View className='mb-6 px-4'>
            <View className='rounded-2xl border border-border bg-card px-5 py-6 shadow-sm'>
                <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                    Personal details
                </Text>
                <View className='mt-2'>
                    <Input
                        label='Full Name'
                        placeholder='Enter your name'
                        value={draftFullName}
                        onChangeText={setDraftFullName}
                        autoCapitalize='words'
                        returnKeyType='next'
                    />
                    <View className='w-full mb-1'>
                        <Text className='mb-1.5 text-sm font-bold text-muted-foreground uppercase tracking-wider'>
                            Preferred Currency
                        </Text>
                        <Pressable
                            onPress={onOpenCurrencyModal}
                            className='w-full flex-row items-center justify-between rounded-xl border border-input bg-background px-4 py-4 active:bg-accent'
                            accessibilityRole='button'
                            accessibilityLabel='Select currency'
                            accessibilityHint='Opens currency selection modal'
                        >
                            <Text
                                className={`text-base font-medium ${
                                    draftCurrency ? "text-foreground" : "text-muted-foreground"
                                }`}
                            >
                                {selectedCurrencyLabel}
                            </Text>
                            <Text className='text-slate-400'>▼</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}
