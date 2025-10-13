import { Button, Text, View } from "react-native";
import "../global.css";
import { useNavigation } from "@react-navigation/native";
export default function HomeScreen() {
    const navigation = useNavigation();
    return (
        <View className='flex-1 items-center justify-center bg-white'>
            <Text className='text-2xl font-bold text-blue-500'>
                Welcome to Nativewind!
            </Text>
            <Button
                title='Auth'
                onPress={() => {
                    // Navigate to the auth group's to-pay screen
                    navigation.navigate("(auth)" as never);
                }}
            />
        </View>
    );
}
