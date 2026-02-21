import { useUserCurrency } from "@/hooks/useUserCurrency";
import { formatCurrency } from "@/utils/utils";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Pencil, Trash2, Info } from "lucide-react-native";
import { Icon } from "../ui/icon";
import { PaymentRecord } from "../../type/interface";
import BottomModal from "../ui/BottomModal";
import { Card, CardContent } from "../ui/card";

interface OptionProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: PaymentRecord | null;
}

export default function Option({
    visible,
    onClose,
    onEdit,
    onDelete,
    record,
}: OptionProps) {
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();
    const handleEdit = () => {
        onEdit();
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    if (!record) return null;

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title='Options'
            showCloseButton={true}
            maxHeight={0.8}
        >
            <Card className='border-0'>
                <CardContent className="p-0">
                    {/* Record Info */}
                    <View className='mb-6 p-4 bg-secondary/50 dark:bg-card border border-primary/10 rounded-[24px] relative overflow-hidden'>
                        {colorScheme === "dark" && (
                            <View 
                                className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-[35px]"
                                pointerEvents="none"
                            />
                        )}
                        <View className="flex-row items-center gap-2 mb-1.5">
                            <Icon as={Info} size={12} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                            <Text className='text-[9px] font-black uppercase tracking-[2px] text-primary/80'>
                                Record Details
                            </Text>
                        </View>
                        <View className="flex-row items-baseline justify-between">
                            <Text className='text-2xl font-black text-foreground tracking-tight flex-1 mr-2' numberOfLines={1}>
                                {record.name}
                            </Text>
                            <Text className='text-xs font-black text-muted-foreground uppercase tracking-widest'>
                                {record.category}
                            </Text>
                        </View>
                        <Text className='text-lg font-black text-primary mt-0.5'>
                            {formatCurrency(record.amount, currency, 0)}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className='flex-row gap-3'>
                        {/* Edit Button */}
                        <Pressable
                            onPress={handleEdit}
                            className='flex-1 p-4 bg-paid/10 rounded-[20px] border-2 border-paid/20 items-center justify-center active:bg-paid/20'
                        >
                            <View className='w-12 h-12 bg-paid rounded-2xl items-center justify-center mb-2 shadow-md shadow-paid/20'>
                                <Icon as={Pencil} size={20} color="white" />
                            </View>
                            <Text className='text-sm font-black text-paid tracking-wide uppercase'>
                                Edit
                            </Text>
                        </Pressable>

                        {/* Delete Button */}
                        <Pressable
                            onPress={handleDelete}
                            className='flex-1 p-4 bg-destructive/10 rounded-[20px] border-2 border-destructive/20 items-center justify-center active:bg-destructive/20'
                        >
                            <View className='w-12 h-12 bg-destructive rounded-2xl items-center justify-center mb-2 shadow-md shadow-destructive/20'>
                                <Icon as={Trash2} size={20} color="white" />
                            </View>
                            <Text className='text-sm font-black text-destructive tracking-wide uppercase'>
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </CardContent>
            </Card>
        </BottomModal>
    );
}
