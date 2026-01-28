import { useUserCurrency } from "@/hooks/useUserCurrency";
import { BaseBookRecord } from "@/type/interface";
import { formatAmountInput, getAmountInWords } from "@/utils/utils";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import RecordInfoCard from "../common/RecordInfoCard";
import Input from "../form/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
                <Card className='w-full max-w-md bg-card border-border'>
                    <CardHeader className='flex-row items-center justify-between border-b border-border mb-4'>
                        <View className='flex-row items-center'>
                            <Text className='text-primary text-xl mr-2'>
                                💳
                            </Text>
                            <CardTitle className='text-lg font-semibold text-foreground'>
                                {title}
                            </CardTitle>
                        </View>

                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-muted-foreground'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <CardContent className='gap-4'>
                        {/* Record Brief Info */}
                        <RecordInfoCard record={record} variant={variant} />

                        {/* Enter Amount */}
                        <View>
                            <Text className='mb-2 text-sm text-muted-foreground'>
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
                                        className='text-2xl font-bold text-center text-foreground'
                                    />
                                </View>
                            </View>
                            <Text className='mt-1 text-xs text-muted-foreground text-center capitalize'>
                                {getAmountInWords(amount, currency)}
                            </Text>
                        </View>
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
                            onPress={handleConfirm}
                            className={`flex-1 py-3 px-4 rounded-md items-center ${isCollection ? 'bg-paid' : 'bg-primary'}`}
                        >
                            <Text className={`${isCollection ? 'text-paid-foreground' : 'text-primary-foreground'} font-medium`}>
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
