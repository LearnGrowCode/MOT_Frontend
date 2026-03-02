import { useUserCurrency } from "@/hooks/useUserCurrency";
import { formatCurrency } from "@/utils/utils";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Pencil, Trash2, Info } from "lucide-react-native";
import { BaseBookRecord } from "@/modules/book.module";
import BottomModal from "@/components/ui/BottomModal";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface RecordOptionModalProps {
    visible?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: BaseBookRecord | null;
    extraActions?: React.ReactNode;
    isScreen?: boolean;
}

export default function RecordOptionModal({
    visible,
    onClose,
    onEdit,
    onDelete,
    record,
    extraActions,
    isScreen = false,
}: RecordOptionModalProps) {
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();
    
    const handleEdit = () => {
        onEdit();
        if (!isScreen) onClose();
    };

    const handleDelete = () => {
        onDelete();
        if (!isScreen) onClose();
    };

    if (!record) return null;

    const content = (
        <Card className={`border-0 py-0 ${isScreen ? 'bg-transparent' : ''}`}>
            <CardContent className="px-0" >
                {/* Record Info */}
                <View className='mb-2 p-4 bg-secondary/50 dark:bg-card border border-primary/10 rounded-[24px] relative overflow-hidden'>
                    {colorScheme === "dark" && (
                        <View 
                            className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-[35px]"
                            pointerEvents="none"
                        />
                    )}
                    <View className="flex-row items-center gap-2 mb-1.5">
                        <Icon as={Info} size={12} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                        <Text className='text-[12px] font-black text-primary/80'>
                            Record Details
                        </Text>
                    </View>
                    <View className="flex-row items-baseline justify-between">
                        <Text className='text-2xl font-black text-foreground tracking-tight flex-1 mr-2' numberOfLines={1}>
                            {record.name}
                        </Text>
                    </View>
                    <Text className='text-lg font-black text-primary mt-0.5'>
                        {formatCurrency(record.amount, currency, 0)}
                    </Text>
                </View>

                <View className='gap-3'>
                    {/* Extra Actions Slot (e.g., Send Reminder) */}
                    {extraActions}

                    {/* Standard Action Buttons */}
                    <View className='flex-row gap-3'>
                        {/* Edit Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleEdit}
                            className='flex-1 p-4 bg-paid/10 rounded-[20px] border-2 border-paid/20 items-center justify-center'
                        >
                            <View className='w-12 h-12 bg-paid rounded-2xl items-center justify-center mb-2 shadow-md shadow-paid/20'>
                                <Icon as={Pencil} size={20} color="white" />
                            </View>
                            <Text className='text-sm font-black text-paid tracking-wide uppercase'>
                                Edit
                            </Text>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleDelete}
                            className='flex-1 p-4 bg-destructive/10 rounded-[20px] border-2 border-destructive/20 items-center justify-center'
                        >
                            <View className='w-12 h-12 bg-destructive rounded-2xl items-center justify-center mb-2 shadow-md shadow-destructive/20'>
                                <Icon as={Trash2} size={20} color="white" />
                            </View>
                            <Text className='text-sm font-black text-destructive tracking-wide uppercase'>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CardContent>
        </Card>
    );

    if (isScreen) {
        return <View className="flex-1 px-4 pt-4 bg-background">{content}</View>;
    }

    return (
        <BottomModal
            visible={visible ?? false}
            onClose={onClose}
            title='Options'
            showCloseButton={true}
            maxHeight={0.8}
        >
            {content}
        </BottomModal>
    );
}
