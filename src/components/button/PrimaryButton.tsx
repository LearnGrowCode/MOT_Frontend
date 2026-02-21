import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
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
                "w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5",
                disabled || loading ? "opacity-60" : "active:opacity-90",
                className
            )}
        >
            {loading ? (
                <ActivityIndicator color={"hsl(var(--primary-foreground))"} />
            ) : (
                <Text className='text-base font-bold text-primary-foreground dark:text-white'>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}


