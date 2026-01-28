import React from "react";
import { Text, TextInput, TextInputProps, useColorScheme, View } from "react-native";

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
};

export default function Input({
    label,
    error,
    className,
    ...props
}: InputProps) {
    const isDark = useColorScheme() === 'dark';

    return (
        <View className='w-full mb-4'>
            {label ? (
                <Text className='mb-1.5 text-sm font-medium text-foreground/70'>{label}</Text>
            ) : null}
            <TextInput
                {...props}
                className={`w-full rounded-xl border border-input px-4 py-3 text-base bg-background text-foreground ${className ?? ""}`}
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            />
            {error ? (
                <Text className='mt-1.5 text-xs font-medium text-destructive'>{error}</Text>
            ) : null}
        </View>
    );
}


