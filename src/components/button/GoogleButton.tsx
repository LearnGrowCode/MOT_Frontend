import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../../lib/utils";

type GoogleButtonProps = {
    title?: string;
    onPress?: () => void;
    disabled?: boolean;
    className?: string;
};

export default function GoogleButton({
    title = "Continue with Google",
    onPress,
    disabled,
    className,
}: GoogleButtonProps) {
    return (
        <Pressable
            accessibilityRole='button'
            onPress={onPress}
            disabled={disabled}
            className={cn(
                "w-full flex-row items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5",
                disabled ? "opacity-60" : "active:opacity-90",
                className
            )}
        >
            <Text className='text-base font-medium text-gray-900'>{title}</Text>
        </Pressable>
    );
}
