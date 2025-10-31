import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CollectionRecord } from "../../type/interface";

interface DeleteCollectionRecordProps {
    visible: boolean;
    onClose: () => void;
    onDeleteRecord: (recordId: string) => void;
    record: CollectionRecord | null;
}

export default function DeleteCollectionRecord({
    visible,
    onClose,
    onDeleteRecord,
    record,
}: DeleteCollectionRecordProps) {
    const handleDelete = () => {
        if (record) {
            onDeleteRecord(record.id);
        }
        onClose();
    };

    if (!record) return null;

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
                            <Text className='text-red-600 text-xl mr-2'>
                                ⚠️
                            </Text>
                            <CardTitle className='text-lg font-semibold'>
                                Delete Collection Record
                            </CardTitle>
                        </View>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        <Text className='text-gray-600 text-center'>
                            Are you sure you want to delete this collection
                            record?
                        </Text>

                        {/* Record Details */}
                        <View className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                            <View className='flex-row items-center mb-2'>
                                <Text className='text-gray-600 text-lg mr-2'>
                                    👤
                                </Text>
                                <Text className='text-lg font-semibold text-gray-800'>
                                    {record.name}
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <View>
                                    <Text className='text-sm text-gray-600 font-medium'>
                                        Amount
                                    </Text>
                                    <Text className='text-lg font-bold text-gray-800'>
                                        ₹{record.amount.toLocaleString("en-IN")}
                                    </Text>
                                </View>
                                <View className='items-end'>
                                    <Text className='text-sm text-gray-600 font-medium'>
                                        Category
                                    </Text>
                                    <Text className='text-sm font-semibold text-gray-700'>
                                        {record.category}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text className='text-sm text-red-600 text-center'>
                            This action cannot be undone.
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
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
