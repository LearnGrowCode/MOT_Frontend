import Input from "@/components/form/Input";
import { CardContent } from "@/components/ui/card";
import {
    deleteSettlement,
    updateBookEntryWithPrincipal,
} from "@/db/models/Book";
import {
    getCollectBookEntries
} from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/type/interface";
import {
    formatAmountInput,
    formatCurrency,
    formatDate,
} from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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

    const loadRecord = React.useCallback(async () => {
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
    }, [id, router]);

    useEffect(() => {
        loadRecord();
    }, [loadRecord]);

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
            <View className='flex-1 items-center justify-center bg-background'>
                <ActivityIndicator size='large' color='hsl(var(--primary))' />
            </View>
        );
    }

    if (!record) {
        return null;
    }

    return (
        <View className='flex-1 bg-background'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-muted-foreground'>
                            Collect Book
                        </Text>
                        <Text className='mt-1 text-3xl font-bold text-foreground'>
                            Edit Record
                        </Text>
                    </View>

                    <View className='mb-6 px-4'>
                        <View className='rounded-2xl border border-border bg-card px-4 py-4 shadow-sm'>
                            <Text className='text-xs font-semibold uppercase tracking-[1px] text-muted-foreground'>
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
                            <View className='rounded-2xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 px-4 py-4 shadow-sm'>
                                <View className='flex-row items-center gap-2 mb-3'>
                                    <Text className='text-lg'>⚠️</Text>
                                    <View className='flex-1'>
                                        <Text className='text-sm font-semibold text-destructive'>
                                            Delete settlements
                                        </Text>
                                        <Text className='text-xs text-destructive/80 mt-1'>
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
                                                className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${isMarked
                                                    ? "border-destructive bg-card"
                                                    : "border-destructive/20 bg-card/50"
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
                                                    <Text className='text-xs text-muted-foreground mt-0.5'>
                                                        {formatDate(item.date)}
                                                    </Text>
                                                </View>
                                                <Text
                                                    className={`text-xs font-semibold ${isMarked
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
                                    })}
                                </View>
                                {pendingSettlementDeletes.size > 0 && (
                                    <Text className='text-xs text-destructive mt-3'>
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

            <View className='border-t border-border bg-card px-4 py-3 shadow-lg'>
                <View className='flex-row'>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSaving}
                        className={`mr-3 flex-1 items-center justify-center rounded-xl border border-border px-4 py-3.5 ${isSaving ? "opacity-60" : "active:bg-accent"
                            }`}
                    >
                        <Text className='text-base font-semibold text-foreground'>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit}
                        disabled={isSaving}
                        className={`flex-1 items-center justify-center rounded-xl px-4 py-3.5 bg-primary ${isSaving
                            ? "opacity-60"
                            : "active:opacity-90"
                            }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator size='small' color='hsl(var(--primary-foreground))' />
                        ) : (
                            <Text className='text-base font-semibold text-primary-foreground'>
                                Save changes
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

