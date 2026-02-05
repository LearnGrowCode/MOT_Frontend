import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useColorScheme } from "nativewind";

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
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    // Explicit HSL strings matching global.css variables since props don't resolve CSS vars
    const placeholderColor = isDark ? "hsl(240 5% 64.9%)" : "hsl(240 3.8% 46.1%)";

    return (
        <View className='w-full mb-4'>
            {label ? (
                <Text className='mb-1.5 text-sm font-medium text-foreground/70'>{label}</Text>
            ) : null}
            <TextInput
                {...props}
                className={`w-full rounded-xl border border-input px-4 py-3 text-base bg-muted/50 text-foreground ${className ?? ""}`}
                placeholderTextColor={placeholderColor}
            />
            {error ? (
                <Text className='mt-1.5 text-xs font-medium text-destructive'>{error}</Text>
            ) : null}
        </View>
    );
}


