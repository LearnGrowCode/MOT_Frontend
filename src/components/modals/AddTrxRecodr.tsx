import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";

interface AddTrxRecodrProps {
    visible: boolean;
    onClose: () => void;
    onAddTransaction: (transaction: {
        payer: string;
        amount: number;
        purpose: string;
        date: string;
        type: "income" | "expense";
    }) => void;
}

export default function AddTrxRecodr({
    visible,
    onClose,
    onAddTransaction,
}: AddTrxRecodrProps) {
    const [formData, setFormData] = useState({
        payer: "",
        amount: "",
        purpose: "",
        date: "",
        type: "income" as "income" | "expense",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.payer.trim()) newErrors.payer = "Payer name is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
        if (!formData.date.trim()) newErrors.date = "Date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        onAddTransaction({
            payer: formData.payer.trim(),
            amount: parseFloat(formData.amount) || 0,
            purpose: formData.purpose.trim(),
            date: formData.date,
            type: formData.type,
        });

        setFormData({
            payer: "",
            amount: "",
            purpose: "",
            date: "",
            type: "income",
        });
        setErrors({});
        onClose();
    };

    const formatAmount = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, "");
        return numericValue;
    };

    const getAmountInWords = (amount: string) => {
        const num = parseFloat(amount) || 0;
        if (num === 0) return "Zero Rupees Only";
        return `${num} Rupees Only`;
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={onClose}
        >
            <View className='flex-1 bg-black/50 justify-center items-center px-4'>
                <Card className='w-full max-w-md max-h-[90%]'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-semibold'>
                            Add Transaction Record
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='space-y-4'>
                            {/* Transaction Type */}
                            <View>
                                <Text className='mb-2 text-sm text-gray-600'>
                                    Transaction Type
                                </Text>
                                <View className='flex-row space-x-2'>
                                    <Pressable
                                        onPress={() =>
                                            handleInputChange("type", "income")
                                        }
                                        className={`flex-1 py-3 px-4 rounded-md border ${
                                            formData.type === "income"
                                                ? "bg-green-100 border-green-500"
                                                : "bg-gray-50 border-gray-300"
                                        }`}
                                    >
                                        <Text
                                            className={`text-center font-medium ${
                                                formData.type === "income"
                                                    ? "text-green-700"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            Income
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() =>
                                            handleInputChange("type", "expense")
                                        }
                                        className={`flex-1 py-3 px-4 rounded-md border ${
                                            formData.type === "expense"
                                                ? "bg-red-100 border-red-500"
                                                : "bg-gray-50 border-gray-300"
                                        }`}
                                    >
                                        <Text
                                            className={`text-center font-medium ${
                                                formData.type === "expense"
                                                    ? "text-red-700"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            Expense
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Payer/Receiver Name */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    {formData.type === "income"
                                        ? "Received From"
                                        : "Paid To"}
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder={`Enter ${formData.type === "income" ? "payer" : "receiver"} name`}
                                        value={formData.payer}
                                        onChangeText={(value) =>
                                            handleInputChange("payer", value)
                                        }
                                        className='flex-1'
                                        error={errors.payer}
                                    />
                                    <View className='ml-2 p-2 bg-gray-100 rounded-md'>
                                        <Text className='text-gray-600'>
                                            👤
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Amount */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Amount
                                </Text>
                                <View className='flex-row items-center'>
                                    <Text className='text-lg font-semibold mr-2'>
                                        ₹
                                    </Text>
                                    <Input
                                        placeholder='0.00'
                                        value={formData.amount}
                                        onChangeText={(value) =>
                                            handleInputChange(
                                                "amount",
                                                formatAmount(value)
                                            )
                                        }
                                        keyboardType='numeric'
                                        className='flex-1'
                                        error={errors.amount}
                                    />
                                </View>
                                <Text className='mt-1 text-xs text-gray-500'>
                                    {getAmountInWords(formData.amount)}
                                </Text>
                            </View>

                            {/* Date */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Date (MM/DD/YYYY)
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder='MM/DD/YYYY'
                                        value={formData.date}
                                        onChangeText={(value) =>
                                            handleInputChange("date", value)
                                        }
                                        className='flex-1'
                                        error={errors.date}
                                    />
                                    <View className='ml-2 p-2 bg-gray-100 rounded-md'>
                                        <Text className='text-gray-600'>
                                            📅
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Purpose */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Purpose
                                </Text>
                                <Input
                                    placeholder='Enter purpose'
                                    value={formData.purpose}
                                    onChangeText={(value) =>
                                        handleInputChange("purpose", value)
                                    }
                                    error={errors.purpose}
                                />
                            </View>

                            {/* Advanced Options */}
                            <Pressable className='flex-row items-center justify-between p-3 border border-gray-300 rounded-md'>
                                <View className='flex-row items-center'>
                                    <Text className='text-gray-600 mr-2'>
                                        📅
                                    </Text>
                                    <Text className='text-sm text-gray-600'>
                                        Advanced options
                                    </Text>
                                </View>
                                <Text className='text-gray-400'>▼</Text>
                            </Pressable>
                        </CardContent>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className='flex-row space-x-3 p-6 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-gray-300 rounded-md items-center'
                        >
                            <Text className='text-gray-700 font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            className='flex-1 py-3 px-4 bg-blue-600 rounded-md items-center'
                        >
                            <Text className='text-white font-medium'>
                                Add Transaction
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
