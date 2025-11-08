import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { PaymentRecord } from "../../type/interface";
import { formatAmountInput } from "@/utils/utils";

interface EditRecordProps {
    visible: boolean;
    onClose: () => void;
    onSaveRecord: (record: PaymentRecord) => void;
    record: PaymentRecord | null;
}

export default function EditRecord({
    visible,
    onClose,
    onSaveRecord,
    record,
}: EditRecordProps) {
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        purpose: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (record) {
            setFormData({
                name: record.name,
                amount: record.amount.toString(),
                purpose: record.category,
            });
        }
    }, [record]);

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
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm() || !record) return;

        const newAmount = parseFloat(formData.amount) || 0;
        // Keep total paid constant: newRemaining = oldRemaining + (newAmount - oldAmount)
        const newRemaining = Math.max(
            0,
            record.remaining + (newAmount - record.amount)
        );

        const updatedRecord: PaymentRecord = {
            ...record,
            name: formData.name.trim(),
            amount: newAmount,
            category: formData.purpose,
            remaining: newRemaining,
        };

        onSaveRecord(updatedRecord);
        onClose();
    };

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
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
                <Card className='w-full max-w-md max-h-[90%]'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-semibold'>
                            Edit Record
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='gap-4'>
                            {/* Payer Name */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-gray-600 mr-2'>
                                        👤
                                    </Text>
                                    <Text className='text-sm text-gray-600'>
                                        Payer Name
                                    </Text>
                                </View>
                                <Input
                                    placeholder="Enter payer's name"
                                    value={formData.name}
                                    onChangeText={(value) =>
                                        handleInputChange("name", value)
                                    }
                                    error={errors.name}
                                />
                            </View>

                            {/* Amount to Collect */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-sm text-gray-600'>
                                        Amount to Collect
                                    </Text>
                                </View>
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
                                    error={errors.amount}
                                />
                            </View>

                            {/* Purpose */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-gray-600 mr-2'>
                                        📄
                                    </Text>
                                    <Text className='text-sm text-gray-600'>
                                        Purpose
                                    </Text>
                                </View>
                                <Input
                                    placeholder='Enter purpose'
                                    value={formData.purpose}
                                    onChangeText={(value) =>
                                        handleInputChange("purpose", value)
                                    }
                                    error={errors.purpose}
                                />
                            </View>

                            {/* Additional Details */}
                            <Pressable className='flex-row items-center justify-between p-3 border border-gray-300 rounded-md'>
                                <View className='flex-row items-center'>
                                    <Text className='text-gray-600 mr-2'>
                                        📄
                                    </Text>
                                    <Text className='text-sm text-gray-600'>
                                        Additional Details
                                    </Text>
                                </View>
                                <Text className='text-gray-400'>▼</Text>
                            </Pressable>
                        </CardContent>
                    </ScrollView>

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
                            onPress={handleSubmit}
                            className='flex-1 py-3 px-4 bg-blue-600 rounded-md items-center'
                        >
                            <Text className='text-white font-medium'>
                                Save Changes
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
