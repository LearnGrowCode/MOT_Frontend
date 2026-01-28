import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { PaymentRecord } from "../../type/interface";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
                <Card className='w-full max-w-md bg-card border-border'>
                    <CardHeader className='flex-row items-center justify-between border-b border-border'>
                        <View className='flex-row items-center'>
                            <Text className='text-destructive text-xl mr-2'>
                                ⚠️
                            </Text>
                            <CardTitle className='text-lg font-semibold text-destructive'>
                                Delete Record
                            </CardTitle>
                        </View>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-muted-foreground'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='items-center py-6'>
                        {/* Warning Icon */}
                        <View className='w-20 h-20 bg-destructive/10 rounded-full items-center justify-center mb-4'>
                            <Text className='text-4xl'>🗑️</Text>
                        </View>

                        {/* Warning Message */}
                        <Text className='text-lg font-semibold text-center mb-2 text-foreground'>
                            Are you sure you want to delete this record?
                        </Text>

                        <Text className='text-sm text-muted-foreground text-center leading-5'>
                            This action cannot be undone. The record will be
                            permanently removed from your account.
                        </Text>
                    </CardContent>

                    {/* Action Buttons */}
                    <View className='flex-row gap-3 p-6 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-border rounded-md items-center'
                        >
                            <Text className='text-foreground font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            className='flex-1 py-3 px-4 bg-destructive rounded-md items-center'
                        >
                            <Text className='text-destructive-foreground font-medium'>
                                Delete Record
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
