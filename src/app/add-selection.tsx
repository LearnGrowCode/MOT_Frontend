import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react-native";

export default function AddSelectionScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-background items-center justify-center px-6">
            <Text className="text-2xl font-bold mb-8 text-foreground">Add New Record</Text>
            
            <View className="flex-row gap-6">
                <Pressable 
                    onPress={() => router.push("/collect-book/add-record")}
                    className="flex-1 bg-primary p-6 rounded-3xl items-center justify-center shadow-lg active:opacity-80"
                >
                    <ArrowDownCircle size={32} color="white" />
                    <Text className="text-white font-bold mt-2">Collect</Text>
                </Pressable>

                <Pressable 
                    onPress={() => router.push("/pay-book/add-record")}
                    className="flex-1 bg-tertiary-500 p-6 rounded-3xl items-center justify-center shadow-lg active:opacity-80"
                >
                    <ArrowUpCircle size={32} color="white" />
                    <Text className="text-white font-bold mt-2">Pay</Text>
                </Pressable>
            </View>

            <Pressable 
                onPress={() => router.back()}
                className="mt-12"
            >
                <Text className="text-muted-foreground font-medium">Cancel</Text>
            </Pressable>
        </View>
    );
}
