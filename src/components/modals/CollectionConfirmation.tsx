import React, { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { CollectionRecord } from "../../type/interface";
import {
    formatCurrency,
    getAmountInWords,
    formatAmountInput,
} from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

interface CollectionConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirmCollection: (amount: number, collector: string) => void;
    record: CollectionRecord | null;
}

export default function CollectionConfirmation({
    visible,
    onClose,
    onConfirmCollection,
    record,
}: CollectionConfirmationProps) {
    const [collectedAmount, setCollectedAmount] = useState("");
    const [collector, setCollector] = useState(record?.name || "");
    const { currency } = useUserCurrency();

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    const handleConfirm = () => {
        const amount = parseFloat(collectedAmount) || 0;
        onConfirmCollection(amount, collector);
        setCollectedAmount("");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent
            presentationStyle='overFullScreen'
            onRequestClose={onClose}
        >
            <View className='flex-1 bg-black/50 justify-center items-center px-4'>
                <Card className='w-full max-w-md'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <View className='flex-row items-center'>
                            <Text className='text-green-600 text-xl mr-2'>
                                💰
                            </Text>
                            <CardTitle className='text-lg font-semibold'>
                                Collection Confirmation
                            </CardTitle>
                        </View>

                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        {/* Collection Record Brief Info */}
                        <View className='bg-green-50 p-4 rounded-lg border border-green-200'>
                            <View className='flex-row items-center mb-2'>
                                <Text className='text-green-600 text-lg mr-2'>
                                    👤
                                </Text>
                                <Text className='text-lg font-semibold text-green-800'>
                                    {record?.name}
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <View>
                                    <Text className='text-sm text-green-600 font-medium'>
                                        Amount to Collect
                                    </Text>
                                    <Text className='text-xl font-bold text-green-800'>
                                        {formatCurrency(
                                            record?.amount ?? 0,
                                            currency,
                                            2
                                        )}
                                    </Text>
                                    {record?.remaining &&
                                        record.remaining > 0 && (
                                            <Text className='text-xs text-orange-600 font-medium'>
                                                Remaining:{" "}
                                                {formatCurrency(
                                                    record.remaining,
                                                    currency,
                                                    2
                                                )}
                                            </Text>
                                        )}
                                </View>
                                <View className='items-end'>
                                    <Text className='text-sm text-green-600 font-medium'>
                                        Category
                                    </Text>
                                    <Text className='text-sm font-semibold text-green-700'>
                                        {record?.category || "General"}
                                    </Text>
                                    <Text className='text-xs text-green-500 mt-1'>
                                        {record?.status?.toUpperCase() ||
                                            "UNPAID"}
                                    </Text>
                                </View>
                            </View>
                            <Text className='text-xs text-green-500 mt-2'>
                                Recording collection for this entry
                            </Text>
                        </View>

                        {/* Enter Collected Amount */}
                        <View>
                            <Text className='mb-2 text-sm text-gray-600'>
                                Enter the collected amount
                            </Text>
                            <View className='flex-row items-center'>
                                <View className='flex-1'>
                                    <Input
                                        placeholder='0'
                                        value={collectedAmount}
                                        onChangeText={(value) =>
                                            setCollectedAmount(
                                                formatAmount(value)
                                            )
                                        }
                                        keyboardType='numeric'
                                        className='text-2xl font-bold text-center'
                                    />
                                </View>
                            </View>
                            <Text className='mt-1 text-xs text-gray-500 text-center'>
                                {getAmountInWords(collectedAmount, currency)}
                            </Text>
                        </View>

                        {/* Collected From */}
                        <View className='flex-row items-center justify-center'>
                            <View className='flex-row items-center bg-green-100 px-3 py-2 rounded-full'>
                                <View className='w-2 h-2 bg-green-500 rounded-full mr-2'></View>
                                <Text className='text-sm text-green-700'>
                                    Collected from {collector}
                                </Text>
                            </View>
                        </View>

                        {/* Advanced Options */}
                        <Pressable className='flex-row items-center justify-between p-3 border border-gray-300 rounded-md'>
                            <View className='flex-row items-center'>
                                <Text className='text-gray-600 mr-2'>📅</Text>
                                <Text className='text-sm text-gray-600'>
                                    Advanced options
                                </Text>
                            </View>
                            <Text className='text-gray-400'>▼</Text>
                        </Pressable>
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
                            onPress={handleConfirm}
                            className='flex-1 py-3 px-4 bg-green-600 rounded-md items-center'
                        >
                            <Text className='text-white font-medium'>
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
