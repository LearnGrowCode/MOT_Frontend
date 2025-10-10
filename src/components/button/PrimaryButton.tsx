import React from "react";
import { Pressable, Text, ActivityIndicator, ViewStyle } from "react-native";
import { cn } from "../../lib/utils";

type PrimaryButtonProps = {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: ViewStyle;
};

export default function PrimaryButton({
    title,
    onPress,
    disabled,
    loading,
    className,
    style,
}: PrimaryButtonProps) {
    return (
        <Pressable
            accessibilityRole='button'
            onPress={onPress}
            disabled={disabled || loading}
            style={style}
            className={cn(
                "w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3",
                disabled || loading ? "opacity-60" : "active:opacity-90",
                className
            )}
        >
            {loading ? (
                <ActivityIndicator color={"#FFFFFF"} />
            ) : (
                <Text className='text-base font-semibold text-white'>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}


