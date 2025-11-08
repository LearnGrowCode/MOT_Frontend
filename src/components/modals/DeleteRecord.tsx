import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PaymentRecord } from "../../type/interface";

interface DeleteRecordProps {
    visible: boolean;
    onClose: () => void;
    onDeleteRecord: (recordId: string) => void;
    record: PaymentRecord | null;
}

export default function DeleteRecord({
    visible,
    onClose,
    onDeleteRecord,
    record,
}: DeleteRecordProps) {
    const handleDelete = () => {
        if (record) {
            onDeleteRecord(record.id);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={onClose}
        >
            <View className='flex-1 bg-black/50 justify-center items-center px-4'>
                <Card className='w-full max-w-md'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <View className='flex-row items-center'>
                            <Text className='text-red-500 text-xl mr-2'>
                                ⚠️
                            </Text>
                            <CardTitle className='text-lg font-semibold text-red-600'>
                                Delete Record
                            </CardTitle>
                        </View>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='items-center py-6'>
                        {/* Warning Icon */}
                        <View className='w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4'>
                            <Text className='text-4xl'>🗑️</Text>
                        </View>

                        {/* Warning Message */}
                        <Text className='text-lg font-semibold text-center mb-2'>
                            Are you sure you want to delete this record?
                        </Text>

                        <Text className='text-sm text-gray-600 text-center leading-5'>
                            This action cannot be undone. The record will be
                            permanently removed from your account.
                        </Text>
                    </CardContent>

                    {/* Action Buttons */}
                    <View className='flex-row gap-3 p-6 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-gray-300 rounded-md items-center'
                        >
                            <Text className='text-gray-700 font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            className='flex-1 py-3 px-4 bg-red-600 rounded-md items-center'
                        >
                            <Text className='text-white font-medium'>
                                Delete Record
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
