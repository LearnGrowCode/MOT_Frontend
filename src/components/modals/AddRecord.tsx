import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, Alert } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import PrimaryButton from "../button/PrimaryButton";
import { PaymentRecord } from "../../type/interface";

interface AddRecordProps {
    visible: boolean;
    onClose: () => void;
    onAddRecord: (record: Omit<PaymentRecord, "id">) => void;
}

export default function AddRecord({
    visible,
    onClose,
    onAddRecord,
}: AddRecordProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        amount: "",
        borrowedDate: "",
        purpose: "",
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

        if (!formData.name.trim()) newErrors.name = "Payer name is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.borrowedDate.trim())
            newErrors.borrowedDate = "Borrowed date is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const newRecord: Omit<PaymentRecord, "id"> = {
            name: formData.name.trim(),
            amount: parseFloat(formData.amount) || 0,
            borrowedDate: formData.borrowedDate,
            category: formData.purpose,
            status: "unpaid",
            remaining: parseFloat(formData.amount) || 0,
        };

        onAddRecord(newRecord);
        setFormData({
            name: "",
            phone: "",
            amount: "",
            borrowedDate: "",
            purpose: "",
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
            <View className='flex-1 justify-end  items-center'>
                <Card className='w-full  max-h-[90%] rounded-t-2xl bg-white '>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-semibold'>
                            Add New Record
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='space-y-4'>
                            {/* Payer's Name */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Payer&apos;s Name
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder="Enter payer's name"
                                        value={formData.name}
                                        onChangeText={(value) =>
                                            handleInputChange("name", value)
                                        }
                                        className='flex-1'
                                        error={errors.name}
                                    />
                                    <View className='ml-2 p-2 bg-gray-100 rounded-md'>
                                        <Text className='text-gray-600'>
                                            👤
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Phone Number */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-sm text-gray-600'>
                                        Phone Number
                                    </Text>
                                    <Text className='ml-1 text-xs text-gray-400'>
                                        eg. +91 XXXXXXXXXX
                                    </Text>
                                </View>
                                <Input
                                    placeholder='Phone Number'
                                    value={formData.phone}
                                    onChangeText={(value) =>
                                        handleInputChange("phone", value)
                                    }
                                    keyboardType='phone-pad'
                                    error={errors.phone}
                                />
                            </View>

                            {/* Payer Icon */}
                            <View>
                                <Text className='mb-2 text-sm text-gray-600'>
                                    Payer Icon
                                </Text>
                                <Pressable className='flex-row items-center p-3 border border-gray-300 rounded-md bg-gray-50'>
                                    <View className='w-12 h-12 bg-gray-200 rounded-full items-center justify-center'>
                                        <Text className='text-gray-500'>
                                            📷
                                        </Text>
                                    </View>
                                    <Text className='ml-3 text-sm text-gray-600'>
                                        Click on the icon to choose from
                                        available options
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Amount to Collect */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Amount to Collect
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

                            {/* Borrowed Date */}
                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Borrowed Date (MM/DD/YYYY)
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder='MM/DD/YYYY'
                                        value={formData.borrowedDate}
                                        onChangeText={(value) =>
                                            handleInputChange(
                                                "borrowedDate",
                                                value
                                            )
                                        }
                                        className='flex-1'
                                        error={errors.borrowedDate}
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
                                Add Record
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
