import { useUserCurrency } from "@/hooks/useUserCurrency";
import { formatCurrency } from "@/utils/utils";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { CollectionRecord } from "../../type/interface";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    const { currency } = useUserCurrency();

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
                <Card className='w-full max-w-md bg-card border-border'>
                    <CardHeader className='flex-row items-center justify-between border-b border-border mb-4'>
                        <View className='flex-row items-center'>
                            <Text className='text-destructive text-xl mr-2'>
                                ⚠️
                            </Text>
                            <CardTitle className='text-lg font-semibold text-foreground'>
                                Delete Collection Record
                            </CardTitle>
                        </View>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-muted-foreground'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        <Text className='text-muted-foreground text-center'>
                            Are you sure you want to delete this collection
                            record?
                        </Text>

                        {/* Record Details */}
                        <View className='bg-muted p-4 rounded-lg border border-border'>
                            <View className='flex-row items-center mb-2'>
                                <Text className='text-muted-foreground text-lg mr-2'>
                                    👤
                                </Text>
                                <Text className='text-lg font-semibold text-foreground'>
                                    {record.name}
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <View>
                                    <Text className='text-sm text-muted-foreground font-medium'>
                                        Amount
                                    </Text>
                                    <Text className='text-lg font-bold text-foreground'>
                                        {formatCurrency(
                                            record.amount,
                                            currency,
                                            2
                                        )}
                                    </Text>
                                </View>
                                <View className='items-end'>
                                    <Text className='text-sm text-muted-foreground font-medium'>
                                        Category
                                    </Text>
                                    <Text className='text-sm font-semibold text-foreground'>
                                        {record.category}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text className='text-sm text-destructive text-center font-medium'>
                            This action cannot be undone.
                        </Text>
                    </CardContent>

                    {/* Action Buttons */}
                    <View className='flex-row gap-3 p-6 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-border rounded-md items-center'
                        >
                            <Text className='text-muted-foreground font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            className='flex-1 py-3 px-4 bg-destructive rounded-md items-center'
                        >
                            <Text className='text-destructive-foreground font-medium'>
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
