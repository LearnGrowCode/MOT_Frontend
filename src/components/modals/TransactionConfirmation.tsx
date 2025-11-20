import React, { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { BaseBookRecord } from "@/type/interface";
import { getAmountInWords, formatAmountInput } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import RecordInfoCard from "../common/RecordInfoCard";

type TransactionType = "collection" | "payment";

interface TransactionConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (amount: number, personName: string) => void;
    record: BaseBookRecord | null;
    type: TransactionType;
}

export default function TransactionConfirmation({
    visible,
    onClose,
    onConfirm,
    record,
    type,
}: TransactionConfirmationProps) {
    const [amount, setAmount] = useState("");
    const personName = record?.name || "";
    const { currency } = useUserCurrency();

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    const handleConfirm = () => {
        const parsedAmount = parseFloat(amount) || 0;
        onConfirm(parsedAmount, personName);
        setAmount("");
        onClose();
    };

    const isCollection = type === "collection";
    const variant = isCollection ? "green" : "blue";
    const buttonColor = isCollection ? "bg-green-600" : "bg-blue-600";
    const title = isCollection
        ? "Collection Confirmation"
        : "Payment Confirmation";
    const inputLabel = isCollection
        ? "Enter the collected amount"
        : "Enter the received amount";

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
                                {title}
                            </CardTitle>
                        </View>

                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        {/* Record Brief Info */}
                        <RecordInfoCard record={record} variant={variant} />

                        {/* Enter Amount */}
                        <View>
                            <Text className='mb-2 text-sm text-gray-600'>
                                {inputLabel}
                            </Text>
                            <View className='flex-row items-center'>
                                <View className='flex-1'>
                                    <Input
                                        placeholder='0'
                                        value={amount}
                                        onChangeText={(value) =>
                                            setAmount(formatAmount(value))
                                        }
                                        maxLength={12}
                                        autoFocus
                                        keyboardType='numeric'
                                        className='text-2xl font-bold text-center'
                                    />
                                </View>
                            </View>
                            <Text className='mt-1 text-xs text-gray-500 text-center capitalize'>
                                {getAmountInWords(amount, currency)}
                            </Text>
                        </View>
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
                            className={`flex-1 py-3 px-4 ${buttonColor} rounded-md items-center`}
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
