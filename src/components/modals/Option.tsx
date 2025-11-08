import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card, CardContent } from "../ui/card";
import { PaymentRecord } from "../../type/interface";
import BottomModal from "../ui/BottomModal";
import { formatCurrency } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

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
                    <View className='mb-3 px-4 py-2 bg-gray-50 rounded-lg'>
                        <Text className='text-lg font-semibold text-gray-800'>
                            {record.name}
                        </Text>
                        <Text className='text-sm text-gray-600'>
                            {formatCurrency(record.amount, currency, 0)} •{" "}
                            {record.category}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className='flex-row gap-2'>
                        {/* Edit Button */}
                        <Pressable
                            onPress={handleEdit}
                            className='flex-row items-center px-4 py-2  w-1/2 bg-blue-100 rounded-lg'
                        >
                            <View className='w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3'>
                                <Text className='text-blue-700 text-lg'>
                                    ✏️
                                </Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-md font-semibold text-blue-800'>
                                    Edit
                                </Text>
                            </View>
                            <Text className='text-blue-400 text-lg'>›</Text>
                        </Pressable>

                        {/* Delete Button */}
                        <Pressable
                            onPress={handleDelete}
                            className='flex-row items-center px-4 py-2 w-1/2 bg-red-100 rounded-lg'
                        >
                            <View className='w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3'>
                                <Text className='text-red-800 text-lg'>🗑️</Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-md font-semibold text-red-800 '>
                                    Delete
                                </Text>
                            </View>
                            <Text className='text-red-400 text-lg'>›</Text>
                        </Pressable>
                    </View>
                </CardContent>
            </Card>
        </BottomModal>
    );
}
