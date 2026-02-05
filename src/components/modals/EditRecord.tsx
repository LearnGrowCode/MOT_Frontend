import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { PaymentRecord } from "../../type/interface";
import { formatAmountInput, formatCurrency, formatDate } from "@/utils/utils";

interface EditRecordProps {
    visible: boolean;
    onClose: () => void;
    onSaveRecord: (
        record: PaymentRecord,
        options?: { deleteSettlementIds?: string[] }
    ) => void;
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
    const [pendingSettlementDeletes, setPendingSettlementDeletes] = useState<
        Set<string>
    >(new Set());

    useEffect(() => {
        if (record) {
            setFormData({
                name: record.name,
                amount: record.amount.toString(),
                purpose: record.purpose ?? "",
            });
            setPendingSettlementDeletes(new Set());
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
            purpose: formData.purpose.trim(),
            remaining: newRemaining,
        };

        const deleteSettlementIds = Array.from(pendingSettlementDeletes);
        onSaveRecord(
            updatedRecord,
            deleteSettlementIds.length
                ? { deleteSettlementIds }
                : undefined
        );
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
            <View className='flex-1 bg-black/40 justify-center items-center px-4'>
                <Card className='w-full max-w-md max-h-[90%]'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-semibold'>
                            Edit Record
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-muted-foreground'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='gap-4'>
                            {/* Payer Name */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-muted-foreground mr-2'>
                                        👤
                                    </Text>
                                    <Text className='text-sm text-muted-foreground'>
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
                                    maxLength={30}
                                />
                            </View>

                            {/* Amount to Collect */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-sm text-muted-foreground'>
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
                                    maxLength={12}
                                    keyboardType='numeric'
                                    error={errors.amount}
                                />
                            </View>

                            {/* Purpose */}
                            <View>
                                <View className='flex-row items-center mb-1'>
                                    <Text className='text-muted-foreground mr-2'>
                                        📄
                                    </Text>
                                    <Text className='text-sm text-muted-foreground'>
                                        Purpose
                                    </Text>
                                </View>
                                <Input
                                    placeholder='Enter purpose'
                                    value={formData.purpose}
                                    onChangeText={(value) =>
                                        handleInputChange("purpose", value)
                                    }
                                    maxLength={30}
                                    error={errors.purpose}
                                />
                            </View>

                            {/* Payment Management */}
                            <View className='bg-destructive/10 border border-destructive/20 rounded-xl p-4 gap-3'>
                                <View className='flex-row items-center gap-2'>
                                    <Text className='text-lg'>⚠️</Text>
                                    <View className='flex-1'>
                                        <Text className='text-sm font-semibold text-destructive'>
                                            Delete payments
                                        </Text>
                                        <Text className='text-xs text-destructive mt-1'>
                                            Tap a payment below to mark it for
                                            deletion. Nothing is removed until
                                            you save.
                                        </Text>
                                    </View>
                                </View>
                                {record.trx_history?.length ? (
                                    record.trx_history.map((item) => {
                                        const isMarked =
                                            pendingSettlementDeletes.has(
                                                item.id
                                            );
                                        return (
                                            <Pressable
                                                key={item.id}
                                                onPress={() =>
                                                    setPendingSettlementDeletes(
                                                        (prev) => {
                                                            const next =
                                                                new Set(prev);
                                                            if (
                                                                next.has(
                                                                    item.id
                                                                )
                                                            ) {
                                                                next.delete(
                                                                    item.id
                                                                );
                                                            } else {
                                                                next.add(
                                                                    item.id
                                                                );
                                                            }
                                                            return next;
                                                        }
                                                    )
                                                }
                                                className={`flex-row items-center justify-between px-3 py-2 rounded-lg border ${
                                                    isMarked
                                                        ? "border-destructive/40 bg-card"
                                                        : "border-transparent"
                                                }`}
                                            >
                                                <View>
                                                    <Text className='text-sm font-semibold text-foreground'>
                                                        {formatCurrency(
                                                            item.amount,
                                                            record.category,
                                                            2
                                                        )}
                                                    </Text>
                                                    <Text className='text-xs text-muted-foreground'>
                                                        {formatDate(item.date)}
                                                    </Text>
                                                </View>
                                                <Text
                                                    className={`text-xs font-semibold ${
                                                        isMarked
                                                            ? "text-destructive"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {isMarked
                                                        ? "Will delete"
                                                        : "Tap to remove"}
                                                </Text>
                                            </Pressable>
                                        );
                                    })
                                ) : (
                                    <Text className='text-xs text-muted-foreground'>
                                        No payments to manage yet.
                                    </Text>
                                )}
                                {pendingSettlementDeletes.size > 0 && (
                                    <Text className='text-xs text-destructive'>
                                        {pendingSettlementDeletes.size} payment
                                        {pendingSettlementDeletes.size > 1
                                            ? "s"
                                            : ""}{" "}
                                        will be deleted once you save.
                                    </Text>
                                )}
                            </View>
                        </CardContent>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className='flex-row gap-3 p-6 pt-0'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-border rounded-md items-center'
                        >
                            <Text className='text-foreground font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            className='flex-1 py-3 px-4 bg-primary rounded-md items-center'
                        >
                            <Text className='text-primary-foreground font-medium'>
                                Save Changes
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
