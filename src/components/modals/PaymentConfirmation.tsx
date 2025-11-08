import React, { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { PaymentRecord } from "../../type/interface";
import {
    formatCurrency,
    getAmountInWords,
    formatAmountInput,
} from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

interface PaymentConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirmPayment: (amount: number, payer: string) => void;
    record: PaymentRecord | null;
}

export default function PaymentConfirmation({
    visible,
    onClose,
    onConfirmPayment,
    record,
}: PaymentConfirmationProps) {
    const [receivedAmount, setReceivedAmount] = useState("");
    const [payer] = useState(record?.name || "");
    const { currency } = useUserCurrency();

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    const handleConfirm = () => {
        const amount = parseFloat(receivedAmount) || 0;
        onConfirmPayment(amount, payer);
        setReceivedAmount("");
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
                            <Text className='text-blue-600 text-xl mr-2'>
                                💳
                            </Text>
                            <CardTitle className='text-lg font-semibold'>
                                Payment Confirmation
                            </CardTitle>
                        </View>

                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        {/* Payment Record Brief Info */}
                        <View className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                            <View className='flex-row items-center mb-2'>
                                <Text className='text-blue-600 text-lg mr-2'>
                                    👤
                                </Text>
                                <Text className='text-lg font-semibold text-blue-800'>
                                    {record?.name}
                                </Text>
                            </View>
                            <View>
                                <Text className='text-sm text-blue-600 font-medium'>
                                    Remaining
                                </Text>
                                <Text className='text-xl font-bold text-blue-800'>
                                    {formatCurrency(
                                        record?.remaining ?? 0,
                                        currency,
                                        2
                                    )}
                                </Text>
                            </View>
                        </View>

                        {/* Enter Received Amount */}
                        <View>
                            <Text className='mb-2 text-sm text-gray-600'>
                                Enter the received amount
                            </Text>
                            <View className='flex-row items-center'>
                                <View className='flex-1'>
                                    <Input
                                        placeholder='0'
                                        value={receivedAmount}
                                        onChangeText={(value) =>
                                            setReceivedAmount(
                                                formatAmount(value)
                                            )
                                        }
                                        keyboardType='numeric'
                                        className='text-2xl font-bold text-center'
                                    />
                                </View>
                            </View>
                            <Text className='mt-1 text-xs text-gray-500 text-center'>
                                {getAmountInWords(receivedAmount, currency)}
                            </Text>
                        </View>

                        {/* Paid By */}
                        <View className='flex-row items-center justify-center'>
                            <View className='flex-row items-center bg-green-100 px-3 py-2 rounded-full'>
                                <View className='w-2 h-2 bg-green-500 rounded-full mr-2'></View>
                                <Text className='text-sm text-green-700'>
                                    Paid by {payer}
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
                            className='flex-1 py-3 px-4 bg-blue-600 rounded-md items-center'
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
