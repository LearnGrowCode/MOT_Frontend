import Input from "@/shared/components/form/Input";
import { CardContent } from "@/shared/components/ui/card";
import {
    deleteSettlement,
    getBookEntry,
    updateBookEntryWithPrincipal,
} from "@/db/models/Book";
import { schedulePaymentReminder, cancelNotification } from "@/shared/services/notification-service";
import { BaseBookRecord } from "@/features/books/types";
import {
    formatAmountInput,
    formatCurrency,
    formatDate,
    REMINDER_INTERVALS,
    getAmountInWords
} from "@/shared/utils/utils";
import { useUserCurrency } from "@/shared/hooks/useUserCurrency";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Platform, Pressable, Switch, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type BookType = "COLLECT" | "PAY";

interface EditRecordScreenProps {
    type: BookType;
}

export default function EditRecordScreen({ type }: EditRecordScreenProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { currency } = useUserCurrency();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [record, setRecord] = useState<BaseBookRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        amount: "",
        date: new Date().toISOString(),
        purpose: "",
        dueDate: new Date().toISOString(),
        reminderInterval: "1_day_before",
        notificationsEnabled: true,
    });
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
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
            const entry = await getBookEntry(id);
            if (entry) {
                setRecord({
                    ...entry,
                    category: entry.currency,
                    remaining: entry.remainingAmount,
                    trx_history: [], // Will be loaded by another mechanism if needed, or keep existing
                } as any);
                setFormData({
                    name: entry.counterparty,
                    phone: entry.mobileNumber ?? "",
                    amount: entry.principalAmount.toString(),
                    purpose: entry.description ?? "",
                    date: new Date(entry.date).toISOString(),
                    dueDate: entry.dueDate ? new Date(entry.dueDate).toISOString() : new Date().toISOString(),
                    reminderInterval: entry.reminderInterval ?? "1_day_before",
                    notificationsEnabled: entry.notificationsEnabled ?? true,
                });
                setSelectedDate(new Date(entry.date));
                if (entry.dueDate) {
                    setSelectedDueDate(new Date(entry.dueDate));
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
    }, [id, router]);

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
            const newAmount = parseFloat(formData.amount.replace(/,/g, "")) || 0;
            
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
                mobileNumber: formData.phone.trim() || null,
                principalAmount: newAmount,
                currency: record.category,
                description: formData.purpose.trim() || null,
                date: selectedDate.getTime(),
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

    const isCollect = type === "COLLECT";
    const dateLabel = isCollect ? "Lent Date" : "Borrowed Date";

    return (
        <View className='flex-1 bg-background'>
            {/* Header / Nav */}
            <View className="flex-row items-center px-4 pt-6 pb-2">
                <Pressable
                    onPress={() => router.back()}
                    className="p-3 bg-secondary/50 rounded-2xl active:bg-secondary border border-border/30 shadow-sm"
                >
                    <ArrowLeft size={24} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={2.5} />
                </Pressable>
            </View>

            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1 }}
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
                                    label='Phone Number'
                                    placeholder='Phone Number (Optional)'
                                    value={formData.phone}
                                    onChangeText={(text) =>
                                        handleInputChange("phone", text.replace(/[^\d+]/g, ""))
                                    }
                                    keyboardType='phone-pad'
                                    error={errors.phone}
                                    returnKeyType='next'
                                    maxLength={15}
                                />

                                <View className='relative mb-4'>
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
                                    {formData.amount && (
                                        <Text className="text-xs text-primary font-medium capitalize absolute -bottom-1 left-2">
                                            {getAmountInWords(formData.amount, currency)}
                                        </Text>
                                    )}
                                </View>

                                <View className='mb-4'>
                                    <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                        {dateLabel}
                                    </Text>
                                    <View>
                                        <Pressable
                                            onPress={() => setShowDatePicker(true)}
                                            className='w-full flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3 active:bg-accent'
                                        >
                                            <Text className='text-base text-foreground'>
                                                {selectedDate.toLocaleDateString()}
                                            </Text>
                                            <Text className='text-muted-foreground'>📅</Text>
                                        </Pressable>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={selectedDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={(event, date) => {
                                                    setShowDatePicker(Platform.OS === 'ios');
                                                    if (event.type === "set" && date) {
                                                        setSelectedDate(date);
                                                        handleInputChange("date", date.toISOString());
                                                    }
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>

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
                                    <View className='flex-row items-center justify-between bg-accent/5 dark:bg-accent/10 py-3 rounded-2xl border border-accent/20'>
                                        <View>
                                            <Text className='font-bold text-foreground'>Enable Notifications</Text>
                                            <Text className='text-xs text-muted-foreground'>Get reminders for this record</Text>
                                        </View>
                                        <Switch
                                            value={formData.notificationsEnabled}
                                            onValueChange={(val) => handleInputChange("notificationsEnabled", val)}
                                            trackColor={{ false: "hsl(var(--secondary-400))", true: "hsl(var(--primary))" }}
                                            thumbColor={formData.notificationsEnabled ? "hsl(var(--primary-50))" : "hsl(var(--secondary-100))"}
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
                                            <View className='flex-row flex-wrap gap-2'>
                                                {REMINDER_INTERVALS.map((interval) => {
                                                    const isSelected = formData.reminderInterval === interval.value;
                                                    return (
                                                        <Pressable
                                                            key={interval.value}
                                                            onPress={() => handleInputChange("reminderInterval", interval.value)}
                                                            className={`w-[48.5%] px-3 py-3 rounded-2xl border-2 transition-all ${
                                                                isSelected
                                                                    ? "bg-primary/10 border-primary"
                                                                    : "bg-card border-border/50"
                                                            }`}
                                                        >
                                                            <View className="flex-row items-center justify-between">
                                                                <Text 
                                                                    className={`text-[13px] font-bold ${
                                                                        isSelected ? "text-primary" : "text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {interval.label}
                                                                </Text>
                                                                {isSelected && (
                                                                    <View className="w-2 h-2 rounded-full bg-primary" />
                                                                )}
                                                            </View>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
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

            <View className='border-t border-border bg-card px-4 py-4 shadow-lg'>
                <View className='flex-row gap-3'>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSaving}
                        className={`flex-1 items-center justify-center rounded-xl border border-border px-4 py-3.5 bg-background ${isSaving ? "opacity-60" : "active:opacity-80"
                            }`}
                    >
                        <Text className='text-base font-bold text-foreground'>
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
                            <Text className='text-base font-bold text-primary-foreground'>
                                Save changes
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
