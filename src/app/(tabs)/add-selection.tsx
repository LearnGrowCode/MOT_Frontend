import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeft, Banknote } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddSelectionScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    
    // Determine colors based on dark/light mode
    const isDark = colorScheme === "dark";

    return (
        <SafeAreaView className="flex-1 bg-background relative overflow-hidden h-full">
            {/* Decorative Background Elements */}
            {isDark && (
                <>
                    <View 
                        className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"
                        pointerEvents="none"
                    />
                    <View 
                        className="absolute -bottom-32 -right-32 w-80 h-80 bg-tertiary-500/10 rounded-full blur-[100px]"
                        pointerEvents="none"
                    />
                </>
            )}

            {/* Header / Nav */}
            <View className="flex-row items-center px-6 pt-6 pb-2">
                <Pressable
                    onPress={() => router.back()}
                    className="p-3 bg-secondary/50 rounded-2xl active:bg-secondary border border-border/30 shadow-sm"
                >
                    <ArrowLeft size={24} color={isDark ? "#94a3b8" : "#64748b"} strokeWidth={2.5} />
                </Pressable>
            </View>

            <View className="px-6 flex-1 justify-center mt-[-60px]">
                <View className="mb-12 items-center">
                    <View className="w-20 h-20 bg-primary/10 rounded-[28px] items-center justify-center mb-6 border border-primary/20 shadow-sm relative">
                        <Banknote size={40} color={isDark ? "#6B93F2" : "#2251D1"} strokeWidth={2} />
                        <View className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background items-center justify-center border-2 border-primary/20">
                            <Text className="text-primary text-xs font-black">+</Text>
                        </View>
                    </View>
                    <Text className="text-4xl font-black text-foreground tracking-tight mb-4 text-center">
                        Add Record
                    </Text>
                    <Text className="text-lg text-muted-foreground font-medium text-center leading-6 max-w-[280px]">
                        What kind of transaction would you like to add?
                    </Text>
                </View>

                <View className="flex-col gap-6 w-full">
                    {/* Collect Card */}
                    <Pressable 
                        onPress={() => router.push("/collect-book/add-record")}
                        className="bg-card w-full p-6 rounded-[32px] border-2 border-border/40 flex-row items-center shadow-lg active:scale-[0.98] shadow-primary/5 transition-all"
                    >
                        <View className="w-16 h-16 rounded-[22px] bg-primary items-center justify-center shadow-md shadow-primary/30 mr-5">
                            <ArrowDownCircle size={32} color="white" strokeWidth={2} />
                        </View>
                        <View className="flex-1 pr-1">
                            <Text className="text-2xl font-black text-foreground mb-1 tracking-tight">Collect Book</Text>
                            <Text className="text-[13px] font-semibold text-muted-foreground leading-5 pr-2">
                                Money you lent to someone. You will receive it.
                            </Text>
                        </View>
                    </Pressable>

                    {/* Pay Card */}
                    <Pressable 
                        onPress={() => router.push("/pay-book/add-record")}
                        className="bg-card w-full p-6 rounded-[32px] border-2 border-border/40 flex-row items-center shadow-lg active:scale-[0.98] shadow-tertiary-500/5 transition-all"
                    >
                        <View className="w-16 h-16 rounded-[22px] bg-tertiary-500 items-center justify-center shadow-md shadow-tertiary-500/30 mr-5">
                            <ArrowUpCircle size={32} color="white" strokeWidth={2} />
                        </View>
                        <View className="flex-1 pr-1">
                            <Text className="text-2xl font-black text-foreground mb-1 tracking-tight">Pay Book</Text>
                            <Text className="text-[13px] font-semibold text-muted-foreground leading-5 pr-2">
                                Money you borrowed. You need to pay it back.
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
