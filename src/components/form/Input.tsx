import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

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
    return (
        <View className='w-full mb-3'>
            {label ? (
                <Text className='mb-1 text-sm text-gray-600'>{label}</Text>
            ) : null}
            <TextInput
                {...props}
                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-base bg-white ${className ?? ""}`}
                placeholderTextColor={"#9CA3AF"}
            />
            {error ? (
                <Text className='mt-1 text-xs text-red-500'>{error}</Text>
            ) : null}
        </View>
    );
}


