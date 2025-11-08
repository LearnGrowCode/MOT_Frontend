import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/form/Input";
import {
    formatNumber,
    getAmountInWords,
    formatAmountInput,
} from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

type TransactionType = "income" | "expense";

export type TransactionRecordPayload = {
    payer: string;
    amount: number;
    purpose: string;
    date: string;
    type: TransactionType;
};

type AddTransactionRecordModalProps = {
    visible: boolean;
    onClose: () => void;
    onAddTransaction: (payload: TransactionRecordPayload) => void;
};

type FormState = {
    payer: string;
    amount: string;
    purpose: string;
    date: string;
    type: TransactionType;
};

const INITIAL_FORM: FormState = {
    payer: "",
    amount: "",
    purpose: "",
    date: "",
    type: "income",
};

const REQUIRED_ERRORS: Record<keyof FormState, string> = {
    payer: "Payer name is required",
    amount: "Amount is required",
    purpose: "Purpose is required",
    date: "Date is required",
    type: "",
};

export default function AddTransactionRecordModal({
    visible,
    onClose,
    onAddTransaction,
}: AddTransactionRecordModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const { currency } = useUserCurrency();

    const amountInWords = useMemo(() => {
        return getAmountInWords(form.amount, currency);
    }, [form.amount, currency]);

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleChangeAmount = (value: string) => {
        const cleaned = formatAmountInput(value);
        handleChange("amount", cleaned);
    };

    const validate = () => {
        const nextErrors: Partial<FormState> = {};
        const fieldsToValidate: (keyof FormState)[] = [
            "payer",
            "amount",
            "purpose",
            "date",
        ];

        fieldsToValidate.forEach((field) => {
            if (!form[field].trim()) {
                nextErrors[field] = REQUIRED_ERRORS[field];
            }
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onAddTransaction({
            payer: form.payer.trim(),
            amount: parseFloat(form.amount) || 0,
            purpose: form.purpose.trim(),
            date: form.date.trim(),
            type: form.type,
        });

        setForm(INITIAL_FORM);
        setErrors({});
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent
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

                    <ScrollView showsVerticalScrollIndicator>
                        <CardContent className='gap-4'>
                            <TransactionTypeToggle
                                type={form.type}
                                onChange={(value) =>
                                    handleChange("type", value)
                                }
                            />

                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    {form.type === "income"
                                        ? "Received From"
                                        : "Paid To"}
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder={`Enter ${
                                            form.type === "income"
                                                ? "payer"
                                                : "receiver"
                                        } name`}
                                        value={form.payer}
                                        onChangeText={(value) =>
                                            handleChange("payer", value)
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

                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Amount
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder='0.00'
                                        value={form.amount}
                                        onChangeText={handleChangeAmount}
                                        keyboardType='numeric'
                                        className='flex-1'
                                        error={errors.amount}
                                    />
                                </View>
                                <Text className='mt-1 text-xs text-gray-500'>
                                    {amountInWords}
                                </Text>
                            </View>

                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Date (MM/DD/YYYY)
                                </Text>
                                <View className='flex-row items-center'>
                                    <Input
                                        placeholder='MM/DD/YYYY'
                                        value={form.date}
                                        onChangeText={(value) =>
                                            handleChange("date", value)
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

                            <View>
                                <Text className='mb-1 text-sm text-gray-600'>
                                    Purpose
                                </Text>
                                <Input
                                    placeholder='Enter purpose'
                                    value={form.purpose}
                                    onChangeText={(value) =>
                                        handleChange("purpose", value)
                                    }
                                    error={errors.purpose}
                                />
                            </View>

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
                                Add Transaction
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}

type TransactionTypeToggleProps = {
    type: TransactionType;
    onChange: (type: TransactionType) => void;
};

function TransactionTypeToggle({ type, onChange }: TransactionTypeToggleProps) {
    return (
        <View>
            <Text className='mb-2 text-sm text-gray-600'>Transaction Type</Text>
            <View className='flex-row gap-2'>
                <TransactionTypeButton
                    label='Income'
                    value='income'
                    isActive={type === "income"}
                    onPress={onChange}
                />
                <TransactionTypeButton
                    label='Expense'
                    value='expense'
                    isActive={type === "expense"}
                    onPress={onChange}
                />
            </View>
        </View>
    );
}

type TransactionTypeButtonProps = {
    label: string;
    value: TransactionType;
    isActive: boolean;
    onPress: (value: TransactionType) => void;
};

function TransactionTypeButton({
    label,
    value,
    isActive,
    onPress,
}: TransactionTypeButtonProps) {
    const activeStyles = isActive
        ? "bg-green-100 border-green-500 text-green-700"
        : "bg-gray-50 border-gray-300 text-gray-600";

    return (
        <Pressable
            onPress={() => onPress(value)}
            className={`flex-1 py-3 px-4 rounded-md border ${activeStyles}`}
        >
            <Text className='text-center font-medium'>{label}</Text>
        </Pressable>
    );
}
