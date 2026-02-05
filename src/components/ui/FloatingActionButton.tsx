import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
    onPress?: () => void;
    icon?: string;
    size?: "sm" | "md" | "lg";
    color?: "blue" | "green" | "red" | "purple" | "indigo" | "orange";
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    className?: string;
}

export default function FloatingActionButton({
    onPress,
    icon = "+",
    size = "md",
    color = "blue",
    position = "bottom-right",
    className,
}: FloatingActionButtonProps) {
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "w-12 h-12";
            case "md":
                return "w-14 h-14";
            case "lg":
                return "w-16 h-16";
            default:
                return "w-14 h-14";
        }
    };

    const getTextSize = () => {
        switch (size) {
            case "sm":
                return "text-xl";
            case "md":
                return "text-2xl";
            case "lg":
                return "text-3xl";
            default:
                return "text-2xl";
        }
    };

    const getColorClasses = () => {
        switch (color) {
            case "blue":
            case "indigo":
                return "bg-primary";
            case "green":
                return "bg-success-500";
            case "red":
                return "bg-error-500";
            case "purple":
                return "bg-secondary-800";
            case "orange":
                return "bg-tertiary-500";
            default:
                return "bg-primary";
        }
    };

    const getPositionClasses = () => {
        switch (position) {
            case "bottom-right":
                return "absolute bottom-8 right-6 z-50";
            case "bottom-left":
                return "absolute bottom-8 left-6 z-50";
            case "top-right":
                return "absolute top-6 right-6 z-50";
            case "top-left":
                return "absolute top-6 left-6 z-50";
            default:
                return "absolute bottom-8 right-6 z-50";
        }
    };

    return (
        <Pressable
            onPress={onPress || (() => {})}
            className={cn(
                getPositionClasses(),
                getSizeClasses(),
                getColorClasses(),
                "rounded-full items-center justify-center shadow-lg",
                className
            )}
        >
            <Text className={cn("text-primary-foreground font-bold", getTextSize())}>
                {icon}
            </Text>
        </Pressable>
    );
}
