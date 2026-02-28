import Input from "@/components/form/Input";
import { CardContent } from "@/components/ui/card";
import {
    deleteSettlement,
    getBookEntry,
    updateBookEntryWithPrincipal,
} from "@/db/models/Book";
import { schedulePaymentReminder, cancelNotification } from "@/services/notification-service";
import { REMINDER_INTERVALS } from "@/utils/utils";
import {
    getPayBookEntries,
    getCollectBookEntries
} from "@/services/book/book-entry.service";
import { BaseBookRecord } from "@/modules/book.module";
import {
    formatAmountInput,
    formatCurrency,
    formatDate,
} from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type BookType = "COLLECT" | "PAY";

interface EditRecordScreenProps {
    type: BookType;
}

export default function EditRecordScreen({ type }: EditRecordScreenProps) {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [record, setRecord] = useState<BaseBookRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        purpose: "",
        dueDate: new Date().toISOString(),
        reminderInterval: "1_day_before",
        notificationsEnabled: true,
    });
    const [selectedDueDate, setSelectedDueDate] = useState<Date>(new Date());
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingSettlementDeletes, setPendingSettlementDeletes] = useState<
        Set<string>
    >(new Set());

    const isPay = type === "PAY";

    const loadRecord = useCallback(async () => {
        if (!id) {
            router.back();
            return;
        }
        try {
            setIsLoading(true);
            const records = isPay ? await getPayBookEntries() : await getCollectBookEntries();
            const foundRecord = records.find((r) => r.id === id);
            if (foundRecord) {
                setRecord(foundRecord as BaseBookRecord);
                setFormData({
                    name: foundRecord.name,
                    amount: foundRecord.amount.toString(),
                    purpose: foundRecord.purpose ?? "",
                    dueDate: foundRecord.dueDate ? new Date(foundRecord.dueDate).toISOString() : new Date().toISOString(),
                    reminderInterval: foundRecord.reminderInterval ?? "1_day_before",
                    notificationsEnabled: foundRecord.notificationsEnabled ?? true,
                });
                if (foundRecord.dueDate) {
                    setSelectedDueDate(new Date(foundRecord.dueDate));
                }
            } else {
                router.back();
            }
        } catch (error) {
            console.error("Error loading record:", error);
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [id, router, isPay]);

    useEffect(() => {
        loadRecord();
    }, [loadRecord]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (typeof field === 'string' && errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const term = isPay ? "Payer" : "Borrower";

        if (!formData.name.trim())
            newErrors.name = `${term} name is required`;
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
            
            // Standardizing the "remaining" logic: it should be principal - settlements.
            // But since bookEntry handles principalAmount, let's stick to the model update.
            // The remaining amount in the view usually comes from the model.
            
            if (pendingSettlementDeletes.size > 0) {
                for (const settlementId of Array.from(
                    pendingSettlementDeletes
                )) {
                    await deleteSettlement(settlementId);
                }
            }

            // Handle Notification lifecycle
            if (record.notificationId) {
                await cancelNotification(record.notificationId);
            }

            let newNotificationId: string | null = null;
            if (formData.notificationsEnabled) {
                const entry = await getBookEntry(record.id);
                if (entry) {
                    newNotificationId = (await schedulePaymentReminder({
                        ...entry,
                        counterparty: formData.name.trim(),
                        principalAmount: newAmount,
                        description: formData.purpose.trim(),
                        dueDate: selectedDueDate.getTime(),
                        reminderInterval: formData.reminderInterval,
                        notificationsEnabled: true,
                    })) || null;
                }
            }

            await updateBookEntryWithPrincipal({
                id: record.id,
                counterparty: formData.name.trim(),
                principalAmount: newAmount,
                currency: record.category,
                description: formData.purpose.trim() || null,
                dueDate: selectedDueDate.getTime(),
                reminderInterval: formData.reminderInterval,
                notificationsEnabled: formData.notificationsEnabled,
                notificationId: newNotificationId,
            });

            router.back();
        } catch (error) {
            console.error("Error saving record:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-background'>
                <ActivityIndicator size='large' color='hsl(var(--primary))' />
            </View>
        );
    }

    if (!record) return null;

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
                            {isPay ? "Pay Book" : "Collect Book"}
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
                                    label={isPay ? "Payer Name" : "Borrower Name"}
                                    placeholder={`Enter ${isPay ? "payer's" : "borrower's"} name`}
                                    value={formData.name}
                                    onChangeText={(value) =>
                                        handleInputChange("name", value)
                                    }
                                    error={errors.name}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                />
                                <Input
                                    label={isPay ? "Amount to Pay" : "Amount to Collect"}
                                    placeholder='0.00'
                                    value={formData.amount}
                                    onChangeText={(value) =>
                                        handleInputChange(
                                            "amount",
                                            formatAmountInput(value)
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

                                <View className='mb-6 mt-2'>
                                    <View className='flex-row items-center justify-between bg-accent/5 dark:bg-accent/10 p-3 rounded-2xl border border-accent/20'>
                                        <View>
                                            <Text className='font-bold text-foreground'>Enable Notifications</Text>
                                            <Text className='text-xs text-muted-foreground'>Get reminders for this record</Text>
                                        </View>
                                        <Switch
                                            value={formData.notificationsEnabled}
                                            onValueChange={(val) => handleInputChange("notificationsEnabled", val)}
                                            trackColor={{ false: "#767577", true: "hsl(var(--primary))" }}
                                            thumbColor={formData.notificationsEnabled ? "#ffffff" : "#f4f3f4"}
                                        />
                                    </View>
                                </View>

                                {formData.notificationsEnabled && (
                                    <View className='gap-4 mb-4'>
                                        <View>
                                            <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                                Due Date (Expected {isPay ? "Payment" : "Collection"})
                                            </Text>
                                            <View>
                                                <Pressable
                                                    onPress={() => setShowDueDatePicker(true)}
                                                    className='w-full flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3 active:bg-accent'
                                                >
                                                    <Text className='text-base text-foreground'>
                                                        {selectedDueDate.toLocaleDateString()}
                                                    </Text>
                                                    <Text className='text-muted-foreground'>📅</Text>
                                                </Pressable>
                                                {showDueDatePicker && (
                                                    <DateTimePicker
                                                        value={selectedDueDate}
                                                        mode="date"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={(event, date) => {
                                                            setShowDueDatePicker(Platform.OS === 'ios');
                                                            if (event.type === "set" && date) {
                                                                setSelectedDueDate(date);
                                                                handleInputChange("dueDate", date.toISOString());
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </View>
                                        </View>

                                        <View>
                                            <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                                Reminder Interval
                                            </Text>
                                            <ScrollView 
                                                horizontal 
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{ gap: 8 }}
                                            >
                                                {REMINDER_INTERVALS.map((interval) => (
                                                    <Pressable
                                                        key={interval.value}
                                                        onPress={() => handleInputChange("reminderInterval", interval.value)}
                                                        className={`px-4 py-2 rounded-full border ${
                                                            formData.reminderInterval === interval.value 
                                                            ? "bg-primary border-primary" 
                                                            : "bg-card border-border"
                                                        }`}
                                                    >
                                                        <Text className={`text-xs font-semibold ${
                                                            formData.reminderInterval === interval.value ? "text-primary-foreground" : "text-foreground"
                                                        }`}>
                                                            {interval.label}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}
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
                                            Delete {isPay ? "payments" : "settlements"}
                                        </Text>
                                        <Text className='text-xs text-destructive/80 mt-1'>
                                            Tap a {isPay ? "payment" : "settlement"} below to mark it for
                                            deletion. Nothing is removed until you save.
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
                                        {pendingSettlementDeletes.size} {isPay ? "payment" : "settlement"}
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
