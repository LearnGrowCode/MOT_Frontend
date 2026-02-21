import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { getAmountInWords, formatAmountInput } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { useColorScheme } from "nativewind";
import { X, User, Banknote, Calendar, FileText } from "lucide-react-native";

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
    const [errors, setErrors] = useState<Partial<Omit<FormState, "type">>>({});
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();

    const amountInWords = useMemo(() => {
        return getAmountInWords(form.amount, currency);
    }, [form.amount, currency]);

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field !== "type" && errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleChangeAmount = (value: string) => {
        const cleaned = formatAmountInput(value);
        handleChange("amount", cleaned);
    };

    const validate = () => {
        const nextErrors: Partial<Omit<FormState, "type">> = {};
        const fieldsToValidate: (keyof Omit<FormState, "type">)[] = [
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
            <View className='flex-1 bg-black/60 justify-center items-center px-4'>
                <View className="w-full max-w-md relative overflow-hidden">
                    {/* Decorative Background for Dark Mode */}
                    {colorScheme === "dark" && (
                        <View 
                            className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"
                            pointerEvents="none"
                        />
                    )}
                    <Card className='w-full rounded-[32px] bg-card border border-border/40 shadow-2xl shadow-black/40'>
                        <CardHeader className='flex-row items-center justify-between py-6 px-8 border-b border-border/30'>
                            <CardTitle className='text-2xl font-black tracking-tight text-foreground'>
                                New Record
                            </CardTitle>
                            <Pressable 
                                onPress={onClose} 
                                className='p-3 bg-secondary/50 rounded-2xl active:bg-secondary'
                            >
                                <X size={20} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={3} />
                            </Pressable>
                        </CardHeader>

                    <ScrollView showsVerticalScrollIndicator>
                        <CardContent className='gap-8 py-8'>
                            <TransactionTypeToggle
                                type={form.type}
                                onChange={(value) =>
                                    handleChange("type", value)
                                }
                            />

                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                                        <User size={16} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[2px]'>
                                        {form.type === "income"
                                            ? "Received From"
                                            : "Paid To"}
                                    </Text>
                                </View>
                                <Input
                                    placeholder={`Enter name`}
                                    value={form.payer}
                                    onChangeText={(value) =>
                                        handleChange("payer", value)
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    error={errors.payer}
                                />
                            </View>

                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-tertiary-500/10 items-center justify-center border border-tertiary-500/20">
                                        <Banknote size={16} color={colorScheme === "dark" ? "#EBC12A" : "#B58E0D"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px]'>
                                        Amount
                                    </Text>
                                </View>
                                <Input
                                    placeholder='0.00'
                                    value={form.amount}
                                    onChangeText={handleChangeAmount}
                                    keyboardType='numeric'
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    error={errors.amount}
                                />
                                {amountInWords && (
                                    <Text className='mt-3 text-xs font-black text-primary/60 italic ml-2'>
                                        {amountInWords}
                                    </Text>
                                )}
                            </View>

                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20">
                                        <Calendar size={16} color={colorScheme === "dark" ? "#818cf8" : "#4f46e5"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px]'>
                                        Date
                                    </Text>
                                </View>
                                <Input
                                    placeholder='MM/DD/YYYY'
                                    value={form.date}
                                    onChangeText={(value) =>
                                        handleChange("date", value)
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    error={errors.date}
                                />
                            </View>

                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-secondary items-center justify-center border border-border/50">
                                        <FileText size={16} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px]'>
                                        Purpose
                                    </Text>
                                </View>
                                <Input
                                    placeholder='Enter purpose'
                                    value={form.purpose}
                                    onChangeText={(value) =>
                                        handleChange("purpose", value)
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    error={errors.purpose}
                                />
                            </View>
                        </CardContent>
                    </ScrollView>

                    <View className='flex-row gap-4 p-8 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-5 rounded-[20px] bg-secondary/50 items-center active:bg-secondary'
                        >
                            <Text className='text-foreground font-black tracking-tight text-lg'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            className='flex-2 py-5 bg-primary rounded-[20px] items-center active:opacity-90 shadow-lg shadow-primary/20'
                        >
                            <Text className='text-primary-foreground font-black tracking-wide text-lg'>
                                Add Transaction
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
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
            <Text className='mb-4 text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-2'>Transaction Type</Text>
            <View className='flex-row gap-3'>
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
        ? "bg-primary border-primary shadow-lg shadow-primary/20"
        : "bg-secondary/30 border-border/50";
    
    const textStyles = isActive
        ? "text-primary-foreground"
        : "text-muted-foreground";

    return (
        <Pressable
            onPress={() => onPress(value)}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 ${activeStyles}`}
        >
            <Text className={`text-center font-black tracking-tight ${textStyles}`}>{label}</Text>
        </Pressable>
    );
}
