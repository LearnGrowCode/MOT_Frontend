import { View, Text } from "react-native";

export default function AuthIndexScreen() {
    return (
        <View className='flex-1 items-center justify-center bg-white'>
            <Text className='text-2xl font-bold text-blue-500'>
                Welcome to MOT
            </Text>
            <Text className='text-gray-600 mt-2'>
                Choose an option from the menu
            </Text>
        </View>
    );
}
