import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card, CardContent } from "../ui/card";
import { CollectionRecord } from "../../type/interface";
import BottomModal from "../ui/BottomModal";
import { formatCurrency } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

interface CollectionOptionProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSendReminder: () => void;
    record: CollectionRecord | null;
}

export default function CollectionOption({
    visible,
    onClose,
    onEdit,
    onDelete,
    onSendReminder,
    record,
}: CollectionOptionProps) {
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

                    <View className='gap-3'>
                        {/* Send Reminder */}
                        <Pressable
                            onPress={() => {
                                onSendReminder();
                                onClose();
                            }}
                            className='flex-row items-center px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100'
                        >
                            <View className='w-10 h-10 bg-white rounded-full items-center justify-center mr-3 border border-indigo-100'>
                                <Text className='text-xl'>📨</Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-base font-semibold text-indigo-900'>
                                    Send reminder
                                </Text>
                                <Text className='text-xs text-indigo-600 mt-0.5'>
                                    Share a friendly nudge to pay the due amount
                                </Text>
                            </View>
                            <Text className='text-indigo-400 text-lg'>›</Text>
                        </Pressable>

                        {/* Action Buttons */}
                        <View className='flex-row gap-2'>
                        {/* Edit Button */}
                        <Pressable
                            onPress={handleEdit}
                            className='flex-row items-center px-4 py-2  w-1/2 bg-green-100 rounded-lg'
                        >
                            <View className='w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3'>
                                <Text className='text-green-700 text-lg'>
                                    ✏️
                                </Text>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-md font-semibold text-green-800'>
                                    Edit
                                </Text>
                            </View>
                            <Text className='text-green-400 text-lg'>›</Text>
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
                    </View>
                </CardContent>
            </Card>
        </BottomModal>
    );
}
