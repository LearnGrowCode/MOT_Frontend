import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { MessageSquare, ArrowRight } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

interface SendReminderCardProps {
    onPress: () => void;
}

export default function SendReminderCard({ onPress }: SendReminderCardProps) {
    const { colorScheme } = useColorScheme();

    return (
        <Pressable
            onPress={onPress}
            className="w-full p-5 bg-primary/10 dark:bg-primary/20 rounded-[24px] border border-primary/20 flex-row items-center justify-between active:bg-primary/20"
        >
            <View className="flex-row items-center gap-4 flex-1">
                <View className="w-12 h-12 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20">
                    <Icon as={MessageSquare} size={20} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-black text-foreground tracking-tight">
                        Send Reminder
                    </Text>
                    <Text className="text-xs font-medium text-muted-foreground mt-0.5">
                        Send a friendly nudge via Share
                    </Text>
                </View>
            </View>
            <View className="w-8 h-8 rounded-full bg-secondary/50 items-center justify-center">
                <Icon as={ArrowRight} size={14} className="text-primary" />
            </View>
        </Pressable>
    );
}
