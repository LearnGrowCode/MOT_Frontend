import React, { useRef } from "react";
import { Text, View, Pressable, Animated, Easing } from "react-native";

import { useRouter } from "expo-router";
import {
    BanknoteArrowDownIcon,
    User,
    BarChart3,
    BanknoteArrowUpIcon,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";


export default function HomeScreen() {
    const router = useRouter();


    

    const Tile = ({
        title,
        bgClass,
        Icon,
        onPress,
    }: {
        title: string;
        bgClass: string;
        Icon: any;
        onPress: () => void;
    }) => {
        const scale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Haptics.selectionAsync();
            Animated.timing(scale, {
                toValue: 0.96,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                friction: 5,
                tension: 120,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Pressable
                className={`flex-1 h-40 rounded-2xl ${bgClass} items-center justify-center shadow-lg shadow-black/10`}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View className='items-center justify-center gap-2 px-2'>
                        <Icon size={32} color='white' />
                        <Text className='text-white text-base font-semibold'>
                            {title}
                        </Text>
                    </View>
                </Animated.View>
            </Pressable>
        );
    };

    return (
        <View className='flex-1 bg-gray-50 px-6 py-8'>
            <View className='flex-1 items-center justify-center'>
                <View className='items-center justify-center mb-8'>
                    <Text className='text-3xl font-bold text-gray-900'>
                        Money On Track
                    </Text>
                    <Text className='text-gray-600 text-center mt-1'>
                        The easiest way to track money you&apos;ve lent or
                        borrowed
                    </Text>
                </View>

                <View className='w-full max-w-md gap-4'>
                    <View className='flex-row gap-4'>
                        <Tile
                            title='Pay Book'
                            bgClass='bg-blue-600'
                            Icon={BanknoteArrowUpIcon}
                            onPress={() => router.push("/pay-book")}
                        />
                        <Tile
                            title='Collect Book'
                            bgClass='bg-green-600'
                            Icon={BanknoteArrowDownIcon}
                            onPress={() => router.push("/collect-book")}
                        />
                    </View>

                    <View className='flex-row gap-4'>
                        <Tile
                            title='Analysis'
                            bgClass='bg-purple-600'
                            Icon={BarChart3}
                            onPress={() => router.push("/analysis")}
                        />
                        <Tile
                            title='Account'
                            bgClass='bg-gray-800'
                            Icon={User}
                            onPress={() => router.push("/my-account")}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}
