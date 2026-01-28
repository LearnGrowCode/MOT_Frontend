import { useUserCurrency } from "@/hooks/useUserCurrency";
import { formatCurrency } from "@/utils/utils";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
                <CardContent>
                    {/* Record Info */}
                    <View className='mb-3 px-4 py-2 bg-muted rounded-lg'>
                        <Text className='text-lg font-semibold text-foreground'>
                            {record.name}
                        </Text>
                        <Text className='text-sm text-muted-foreground'>
                            {formatCurrency(record.amount, currency, 0)} •{" "}
                            {record.category}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className='flex-row gap-2'>
                        {/* Edit Button */}
                        <Pressable
                            onPress={handleEdit}
                            className='flex-row items-center px-4 py-2  w-1/2 bg-paid/10 dark:bg-paid/20 rounded-lg'
                        >
                            <View className='w-10 h-10 bg-paid/10 rounded-full items-center justify-center mr-3'>
                                <Text className='text-paid-foreground text-lg'>
                                    ✏️
                                </Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-md font-semibold text-paid-foreground'>
                                    Edit
                                </Text>
                            </View>
                            <Text className='text-paid-foreground/50 text-lg'>›</Text>
                        </Pressable>

                        {/* Delete Button */}
                        <Pressable
                            onPress={handleDelete}
                            className='flex-row items-center px-4 py-2 w-1/2 bg-overdue/10 dark:bg-overdue/20 rounded-lg'
                        >
                            <View className='w-10 h-10 bg-overdue/10 rounded-full items-center justify-center mr-3'>
                                <Text className='text-overdue-foreground text-lg'>🗑️</Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-md font-semibold text-overdue-foreground '>
                                    Delete
                                </Text>
                            </View>
                            <Text className='text-overdue-foreground/50 text-lg'>›</Text>
                        </Pressable>
                    </View>
                </CardContent>
            </Card>
        </BottomModal>
    );
}
