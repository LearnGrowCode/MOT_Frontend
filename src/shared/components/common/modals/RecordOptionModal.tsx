import { useUserCurrency } from "@/shared/hooks/useUserCurrency";
import { formatCurrency } from "@/shared/utils/utils";
import React from "react";
import { TouchableOpacity, Text, View, ScrollView, SafeAreaView } from "react-native";
import { useColorScheme } from "nativewind";
import { Pencil, Trash2, Info } from "lucide-react-native";
import { BaseBookRecord } from "@/features/books/types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Icon } from "@/shared/components/ui/icon";

interface RecordOptionModalProps {
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: BaseBookRecord | null;
    extraActions?: React.ReactNode;
}

export default function RecordOptionModal({
    onClose,
    onEdit,
    onDelete,
    record,
    extraActions,
}: RecordOptionModalProps) {
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();
    
    const handleEdit = () => {
        onEdit();
    };

    const handleDelete = () => {
        onDelete();
    };

    if (!record) return null;

    return (
        <View className="flex-1 bg-white dark:bg-zinc-950">
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Card className="border-0 p-0 h-fit bg-transparent shadow-none">
                    <CardContent className="px-0" >
                        {/* Record Info */}
                        <View className='mb-6 p-6 bg-secondary/30 dark:bg-card border border-border/10 rounded-[28px] relative overflow-hidden'>
                            {colorScheme === "dark" && (
                                <View 
                                    className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-[35px]"
                                    pointerEvents="none"
                                />
                            )}
                            <View className="flex-row items-center gap-2 mb-2">
                                <Icon as={Info} size={14} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                <Text className='text-[13px] font-black text-primary/80 uppercase tracking-widest'>
                                    Record Details
                                </Text>
                            </View>
                            <View className="flex-row items-baseline justify-between">
                                <Text className='text-3xl font-black text-foreground tracking-tight flex-1 mr-2' numberOfLines={1}>
                                    {record.name}
                                </Text>
                            </View>
                            <Text className='text-xl font-black text-primary mt-1'>
                                {formatCurrency(record.amount, currency, 0)}
                            </Text>
                        </View>

                        <View className='gap-4'>
                            {/* Extra Actions Slot (e.g., Send Reminder) */}
                            {extraActions}

                            {/* Standard Action Buttons */}
                            <View className='flex-row gap-4'>
                                {/* Edit Button */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleEdit}
                                    className='flex-1 p-5 bg-paid/5 rounded-[24px] border-2 border-paid/10 items-center justify-center'
                                >
                                    <View className='w-14 h-14 bg-paid rounded-2xl items-center justify-center mb-3 shadow-lg shadow-paid/20'>
                                        <Icon as={Pencil} size={24} color="white" />
                                    </View>
                                    <Text className='text-sm font-black text-paid tracking-widest uppercase'>
                                        Edit
                                    </Text>
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleDelete}
                                    className='flex-1 p-5 bg-destructive/5 rounded-[24px] border-2 border-destructive/10 items-center justify-center'
                                >
                                    <View className='w-14 h-14 bg-destructive rounded-2xl items-center justify-center mb-3 shadow-lg shadow-destructive/20'>
                                        <Icon as={Trash2} size={24} color="white" />
                                    </View>
                                    <Text className='text-sm font-black text-destructive tracking-widest uppercase'>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CardContent>
                </Card>
            </ScrollView>
            <SafeAreaView />
        </View>
    );
}
