import React from "react";
import { View, Text, Image } from "react-native";
import { cn } from "@/lib/utils";

interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: "sm" | "md" | "lg";
    showStatus?: boolean;
    statusColor?: "green" | "orange" | "red" | "gray";
    className?: string;
}

export default function Avatar({
    name,
    imageUrl,
    size = "md",
    showStatus = false,
    statusColor = "green",
    className,
}: AvatarProps) {
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "w-8 h-8";
            case "md":
                return "w-10 h-10";
            case "lg":
                return "w-12 h-12";
            default:
                return "w-10 h-10";
        }
    };

    const getTextSize = () => {
        switch (size) {
            case "sm":
                return "text-xs";
            case "md":
                return "text-sm";
            case "lg":
                return "text-lg";
            default:
                return "text-sm";
        }
    };

    const getStatusColor = () => {
        switch (statusColor) {
            case "green":
                return "bg-green-500";
            case "orange":
                return "bg-orange-500";
            case "red":
                return "bg-red-500";
            case "gray":
                return "bg-gray-500";
            default:
                return "bg-green-500";
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View className={cn("relative", className)}>
            <View
                className={cn(
                    "rounded-full items-center justify-center bg-gray-300",
                    getSizeClasses()
                )}
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        className={cn("rounded-full", getSizeClasses())}
                        resizeMode='cover'
                    />
                ) : (
                    <Text
                        className={cn(
                            "text-gray-600 font-medium",
                            getTextSize()
                        )}
                    >
                        {getInitials(name)}
                    </Text>
                )}
            </View>

            {showStatus && (
                <View
                    className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                        getStatusColor()
                    )}
                />
            )}
        </View>
    );
}
