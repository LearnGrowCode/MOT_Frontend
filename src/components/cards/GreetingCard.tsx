import { View, Text } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface GreetingCardProps {
    userName: string;
    userAvatar: string | null;
    greet: string;
    subGreet: string;
}

export default function GreetingCard({
    userName,
    userAvatar,
    greet,
    subGreet,
}: GreetingCardProps) {
    return (
        <View className='flex-row items-center  gap-3'>
            <Avatar alt={userName} className='w-14 h-14'>
                {userAvatar && <AvatarImage source={{ uri: userAvatar }} />}
                <AvatarFallback>
                    <Text className='text-xl font-regular '>
                        {userName.charAt(0)}
                    </Text>
                </AvatarFallback>
            </Avatar>

            <View>
                <Text className='text-2xl font-bold text-gray-900'>
                    {greet}
                </Text>
                <Text className='text-gray-600'>{subGreet}</Text>
            </View>
        </View>
    );
}
