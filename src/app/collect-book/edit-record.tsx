import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CardContent } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { CollectionRecord } from "@/type/interface";
import {
    formatAmountInput,
    formatCurrency,
    formatDate,
} from "@/utils/utils";
import {
    getCollectBookEntries,
    getTotalCollectRemaining,
} from "@/services/book/book-entry.service";
import {
    updateBookEntryWithPrincipal,
    deleteSettlement,
} from "@/db/models/Book";

export default function EditCollectRecordScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [record, setRecord] = useState<CollectionRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
        loadRecord();
    }, [id]);

    const loadRecord = async () => {
        if (!id) {
            router.back();
            return;
        }
        try {
            setIsLoading(true);
            const records = await getCollectBookEntries();
            const foundRecord = records.find((r) => r.id === id);
            if (foundRecord) {
                setRecord(foundRecord);
                setFormData({
                    name: foundRecord.name,
                    amount: foundRecord.amount.toString(),
                    purpose: foundRecord.purpose ?? "",
                });
            } else {
                router.back();
            }
        } catch (error) {
            console.error("Error loading record:", error);
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim())
            newErrors.name = "Borrower name is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !record) return;

        setIsSaving(true);
        try {
            const newAmount = parseFloat(formData.amount) || 0;

            const updatedRecord: CollectionRecord = {
                ...record,
                name: formData.name.trim(),
                amount: newAmount,
                purpose: formData.purpose.trim(),
                remaining: newAmount,
            };

            if (pendingSettlementDeletes.size > 0) {
                for (const settlementId of Array.from(
                    pendingSettlementDeletes
                )) {
                    await deleteSettlement(settlementId);
                }
            }

            await updateBookEntryWithPrincipal({
                id: updatedRecord.id,
                counterparty: updatedRecord.name,
                principalAmount: updatedRecord.amount,
                currency: updatedRecord.category,
                description: updatedRecord.purpose ?? null,
            });

            router.back();
        } catch (error) {
            console.error("Error saving record:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#f2f6fc]'>
                <ActivityIndicator size='large' color='#2563eb' />
            </View>
        );
    }

    if (!record) {
        return null;
    }

    return (
        <View className='flex-1 bg-[#f2f6fc]'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-stone-500'>
                            Collect Book
                        </Text>
                        <Text className='mt-1 text-3xl font-bold text-stone-900'>
                            Edit Record
                        </Text>
                    </View>

                    <View className='mb-6 px-4'>
                        <View className='rounded-2xl border border-[#e3e9f5] bg-white px-4 py-4 shadow-sm'>
                            <Text className='text-xs font-semibold uppercase tracking-[1px] text-stone-500'>
                                Record details
                            </Text>
                            <View className='mt-2'>
                                <Input
                                    label='Borrower Name'
                                    placeholder="Enter borrower's name"
                                    value={formData.name}
                                    onChangeText={(value) =>
                                        handleInputChange("name", value)
                                    }
                                    error={errors.name}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                />
                                <Input
                                    label='Amount to Collect'
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
                                    returnKeyType='next'
                                />
                                <Input
                                    label='Purpose'
                                    placeholder='Enter purpose'
                                    value={formData.purpose}
                                    onChangeText={(value) =>
                                        handleInputChange("purpose", value)
                                    }
                                    error={errors.purpose}
                                    returnKeyType='done'
                                />
                            </View>
                        </View>
                    </View>

                    {record.trx_history && record.trx_history.length > 0 && (
                        <View className='mb-6 px-4'>
                            <View className='rounded-2xl border border-[#fee2e2] bg-[#fef2f2] px-4 py-4 shadow-sm'>
                                <View className='flex-row items-center gap-2 mb-3'>
                                    <Text className='text-lg'>⚠️</Text>
                                    <View className='flex-1'>
                                        <Text className='text-sm font-semibold text-red-700'>
                                            Delete settlements
                                        </Text>
                                        <Text className='text-xs text-red-600 mt-1'>
                                            Tap a settlement below to mark it
                                            for deletion. Nothing is removed
                                            until you save.
                                        </Text>
                                    </View>
                                </View>
                                <View className='gap-2'>
                                    {record.trx_history.map((item) => {
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
                                                            if (next.has(item.id)) {
                                                                next.delete(
                                                                    item.id
                                                                );
                                                            } else {
                                                                next.add(item.id);
                                                            }
                                                            return next;
                                                        }
                                                    )
                                                }
                                                className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
                                                    isMarked
                                                        ? "border-red-400 bg-white"
                                                        : "border-red-200 bg-white/50"
                                                }`}
                                            >
                                                <View>
                                                    <Text className='text-sm font-semibold text-gray-800'>
                                                        {formatCurrency(
                                                            item.amount,
                                                            record.category,
                                                            2
                                                        )}
                                                    </Text>
                                                    <Text className='text-xs text-gray-500 mt-0.5'>
                                                        {formatDate(item.date)}
                                                    </Text>
                                                </View>
                                                <Text
                                                    className={`text-xs font-semibold ${
                                                        isMarked
                                                            ? "text-red-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {isMarked
                                                        ? "Will delete"
                                                        : "Tap to remove"}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                {pendingSettlementDeletes.size > 0 && (
                                    <Text className='text-xs text-red-500 mt-3'>
                                        {pendingSettlementDeletes.size}{" "}
                                        settlement
                                        {pendingSettlementDeletes.size > 1
                                            ? "s"
                                            : ""}{" "}
                                        will be deleted once you save.
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </CardContent>
            </KeyboardAwareScrollView>

            <View className='border-t border-[#e3e9f5] bg-white px-4 py-3 shadow-lg shadow-black/5'>
                <View className='flex-row'>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSaving}
                        className={`mr-3 flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 ${
                            isSaving ? "opacity-60" : "active:opacity-80"
                        }`}
                    >
                        <Text className='text-base font-semibold text-slate-700'>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit}
                        disabled={isSaving}
                        className={`flex-1 items-center justify-center rounded-xl px-4 py-3 ${
                            isSaving
                                ? "bg-[#93c5fd]"
                                : "bg-[#2563eb] active:bg-[#1d4ed8]"
                        }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator size='small' color='white' />
                        ) : (
                            <Text className='text-base font-semibold text-white'>
                                Save changes
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

