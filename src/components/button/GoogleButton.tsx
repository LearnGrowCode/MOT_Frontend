import React from "react";
import { Image, Pressable, Text, View } from "react-native";
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
                "w-full flex-row items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3",
                disabled ? "opacity-60" : "active:opacity-90",
                className
            )}
        >
            <Image
                source={{
                    uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
                }}
                accessibilityIgnoresInvertColors
                style={{ width: 18, height: 18 }}
            />
            <Text className='text-base font-semibold text-gray-800'>
                {title}
            </Text>
        </Pressable>
    );
}


