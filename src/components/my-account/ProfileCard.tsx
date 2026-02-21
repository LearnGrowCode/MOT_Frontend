import React from "react";
import { View, Text } from "react-native";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";

interface ProfileCardProps {
    fullName: string;
    profileInitials: string;
    currency: string;
}

export default function ProfileCard({ fullName, profileInitials, currency }: ProfileCardProps) {
    return (
        <View className='mb-6 px-4'>
            <View className='rounded-3xl border border-primary/20 px-6 py-6 pb-8'>
                <View className='flex-row items-center mb-6'>
                    <Avatar
                        className='h-20 w-20 border-4 border-background bg-card shadow-lg'
                        alt={fullName || "User avatar"}
                    >
                        <AvatarFallback className='bg-background'>
                            <Text className='text-2xl font-black text-primary'>
                                {profileInitials}
                            </Text>
                        </AvatarFallback>
                    </Avatar>
                    <View className='ml-6 flex-1'>
                        <Text className='text-foreground text-2xl font-black tracking-tight'>
                            {fullName || "Add your name"}
                        </Text>
                    </View>
                </View>
                
                <View className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                    <Text className='text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-4'>
                        Personal info
                    </Text>
                    <View className='flex-row items-center justify-between'>
                        <View>
                            <Text className='text-[10px] uppercase font-bold text-muted-foreground tracking-widest'>
                                Preferred currency
                            </Text>
                            <Text className='mt-1 text-lg font-bold text-foreground'>
                                {currency || "Not set"}
                            </Text>
                        </View>
                        <View className='rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20'>
                            <Text className='text-primary text-[10px] font-bold uppercase tracking-wider'>
                                {currency ? "Active" : "Set now"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
