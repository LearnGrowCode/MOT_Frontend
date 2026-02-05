import Input from "@/components/form/Input";
import ContactList from "@/components/modals/ContactList";
import { CardContent } from "@/components/ui/card";
import { createBookEntry } from "@/db/models/Book";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { usePermissionStore } from "@/store/usePermissionStore";
import { formatAmountInput, getAmountInWords } from "@/utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const REMINDER_INTERVALS = [
    { label: "1 Day Before", value: "1_day_before" },
    { label: "2 Days Before", value: "2_days_before" },
    { label: "3 Days Before", value: "3_days_before" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Daily", value: "daily" },
];

type BookType = "COLLECT" | "PAY";

interface FormData {
    name: string;
    phone: string;
    amount: string;
    date: string;
    purpose: string;
    dueDate: string;
    reminderInterval: string;
    notificationsEnabled: boolean;
}

interface AddRecordScreenProps {
    type: BookType;
}

export default function AddRecordScreen({ type }: AddRecordScreenProps) {
    const router = useRouter();
    const { updateContactsGranted, contacts } = usePermissionStore();
    const { currency } = useUserCurrency();

    useEffect(() => {
        updateContactsGranted();
    }, [updateContactsGranted]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            phone: "",
            amount: "",
            date: new Date().toISOString(),
            purpose: "",
            dueDate: new Date().toISOString(),
            reminderInterval: "1_day_before",
            notificationsEnabled: true,
        },
    });

    const [contactsVisible, setContactsVisible] = useState(false);
    const [contactSearch, setContactSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDueDate, setSelectedDueDate] = useState<Date>(new Date());
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    const amountValue = watch("amount");
    const dateValue = watch("date");

    useEffect(() => {
        if (dateValue) {
            const parsed = new Date(dateValue);
            if (!Number.isNaN(parsed.getTime())) {
                setSelectedDate(parsed);
            }
        }
    }, [dateValue]);

    const dueDateValue = watch("dueDate");
    useEffect(() => {
        if (dueDateValue) {
            const parsed = new Date(dueDateValue);
            if (!Number.isNaN(parsed.getTime())) {
                setSelectedDueDate(parsed);
            }
        }
    }, [dueDateValue]);

    // Debounce search input to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(contactSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [contactSearch]);

    const filteredContacts = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return contacts;

        const searchTerms = q.split(" ").filter((term) => term.length > 0);

        return contacts.filter((c) => {
            const searchName = c.searchName || (c.name || "").toLowerCase();
            const searchPhone = c.searchPhone || (c.phone || "").toLowerCase();

            return searchTerms.every(
                (term) =>
                    searchName.includes(term) || searchPhone.includes(term)
            );
        });
    }, [contacts, debouncedSearch]);

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    const handleContactSelect = useCallback(
        (name: string, phone: string) => {
            setValue("name", name);
            const sanitizedPhone = phone.replace(/[^\d+]/g, "");
            setValue("phone", sanitizedPhone);
            setContactsVisible(false);
        },
        [setValue]
    );

    // Dynamic labels and colors based on type
    const isCollect = type === "COLLECT";
    const bookTypeLabel = isCollect ? "Collect Book" : "Pay Book";
    const amountLabel = isCollect ? "Amount to Collect" : "Amount to Pay";
    const nameLabel = isCollect ? "Borrower's Name" : "Receiver's Name";
    const dateLabel = isCollect ? "Lent Date" : "Borrowed Date";
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = useCallback(
        async (data: FormData) => {
            setIsSubmitting(true);
            const dateTimestamp = selectedDate.getTime();

            try {
                await createBookEntry({
                    type: type,
                    userId: "1",
                    counterparty: data.name,
                    date: dateTimestamp,
                    description: data.purpose,
                    principalAmount: Number(data.amount.replace(/,/g, "")),
                    currency: currency,
                    mobileNumber: data.phone,
                    dueDate: selectedDueDate.getTime(),
                    reminderInterval: data.reminderInterval,
                    notificationsEnabled: data.notificationsEnabled,
                });

                reset({
                    name: "",
                    phone: "",
                    amount: "",
                    date: new Date().toISOString(),
                    purpose: "",
                    dueDate: new Date().toISOString(),
                    reminderInterval: "1_day_before",
                    notificationsEnabled: true,
                });
                setSelectedDate(new Date());
                setSelectedDueDate(new Date());
                router.back();
            } catch (error) {
                console.error("❌ Error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [reset, router, selectedDate, selectedDueDate, currency, type]
    );

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
                            {bookTypeLabel}
                        </Text>
                        <Text className='mt-1 text-3xl font-bold text-foreground'>
                            Add Record
                        </Text>
                    </View>

                    <View className='mb-6 px-4'>
                        <View className='rounded-2xl border border-border bg-card px-4 py-4 shadow-sm'>
                            <Text className='text-xs font-semibold uppercase tracking-[1px] text-muted-foreground'>
                                Record details
                            </Text>
                            <View className='mt-2'>
                                <Pressable
                                    onPress={() => {
                                        setContactsVisible(true);
                                    }}
                                    className='mb-6 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 items-center justify-center active:opacity-80'
                                >
                                    <Text className='text-primary font-bold'>
                                        👤 Import Contact
                                    </Text>
                                </Pressable>

                                <Controller
                                    control={control}
                                    name='name'
                                    rules={{
                                        required: "Name is required",
                                        maxLength: {
                                            value: 50,
                                            message:
                                                "Name must be 50 characters or less",
                                        },
                                    }}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
                                        <Input
                                            label={nameLabel}
                                            placeholder='Enter name'
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.name?.message}
                                            autoCapitalize='words'
                                            returnKeyType='next'
                                            maxLength={50}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='phone'
                                    rules={{
                                        maxLength: {
                                            value: 15,
                                            message:
                                                "Phone number must be 15 characters or less",
                                        },
                                    }}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
                                        <Input
                                            label='Phone Number'
                                            placeholder='Phone Number (Optional)'
                                            value={value}
                                            onChangeText={(text) =>
                                                onChange(
                                                    text.replace(/[^\d+]/g, "")
                                                )
                                            }
                                            keyboardType='phone-pad'
                                            error={errors.phone?.message}
                                            returnKeyType='next'
                                            maxLength={15}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='amount'
                                    rules={{
                                        required: "Amount is required",
                                        validate: (value) => {
                                            const numValue = Number(
                                                value.replace(/,/g, "")
                                            );
                                            if (
                                                isNaN(numValue) ||
                                                numValue <= 0
                                            ) {
                                                return "Amount must be greater than 0";
                                            }
                                            if (numValue > 999999999.99) {
                                                return "Amount must be less than 1,000,000,000";
                                            }
                                            return true;
                                        },
                                    }}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
                                        <View>
                                            <Input
                                                label={amountLabel}
                                                placeholder='0.00'
                                                value={value}
                                                onChangeText={(val) =>
                                                    onChange(formatAmount(val))
                                                }
                                                keyboardType='numeric'
                                                error={errors.amount?.message}
                                                returnKeyType='next'
                                            />
                                            {amountValue && (
                                                <Text className='mt-2 text-xs text-primary font-medium capitalize'>
                                                    {getAmountInWords(
                                                        amountValue || "",
                                                        currency
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                />

                                <View className='mb-1'>
                                    <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                        {dateLabel}
                                    </Text>
                                    <Controller
                                        control={control}
                                        name='date'
                                        rules={{
                                            required: "Date is required",
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <View>
                                                <Pressable
                                                    onPress={() => {
                                                        setShowDatePicker(true);
                                                    }}
                                                    className='w-full flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3 active:bg-accent'
                                                >
                                                    <Text className='text-base text-foreground'>
                                                        {selectedDate.toLocaleDateString()}
                                                    </Text>
                                                    <Text className='text-muted-foreground'>
                                                        📅
                                                    </Text>
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
                                                                onChange(date.toISOString());
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </View>
                                        )}
                                    />
                                    {errors.date && (
                                        <Text className='text-destructive text-xs mt-1'>
                                            {errors.date.message}
                                        </Text>
                                    )}
                                </View>

                                <Controller
                                    control={control}
                                    name='purpose'
                                    rules={{
                                        required: "Purpose is required",
                                        maxLength: {
                                            value: 100,
                                            message:
                                                "Purpose must be 100 characters or less",
                                        },
                                    }}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
                                        <Input
                                            label='Purpose'
                                            placeholder='Enter purpose'
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.purpose?.message}
                                            returnKeyType='done'
                                            maxLength={100}
                                        />
                                    )}
                                />

                                <View className='mb-6 mt-2'>
                                    <View className='flex-row items-center justify-between bg-accent/5 dark:bg-accent/10 p-3 rounded-2xl border border-accent/20'>
                                        <View>
                                            <Text className='font-bold text-foreground'>Enable Notifications</Text>
                                            <Text className='text-xs text-muted-foreground'>Get reminders for this record</Text>
                                        </View>
                                        <Controller
                                            control={control}
                                            name='notificationsEnabled'
                                            render={({ field: { value, onChange } }) => (
                                                <Switch
                                                    value={value}
                                                    onValueChange={onChange}
                                                    trackColor={{ false: "hsl(var(--secondary-400))", true: "hsl(var(--primary))" }}
                                                    thumbColor={value ? "hsl(var(--primary-50))" : "hsl(var(--secondary-100))"}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>

                                {watch("notificationsEnabled") && (
                                    <View className='gap-4 mb-4'>
                                        <View>
                                            <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                                Due Date (Expected Collection/Payment)
                                            </Text>
                                            <Controller
                                                control={control}
                                                name='dueDate'
                                                render={({ field: { onChange } }) => (
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
                                                                        onChange(date.toISOString());
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </View>
                                                )}
                                            />
                                        </View>

                                        <View>
                                            <Text className='mb-1.5 text-sm font-medium text-foreground/70'>
                                                Reminder Interval
                                            </Text>
                                            <Controller
                                                control={control}
                                                name='reminderInterval'
                                                render={({ field: { value, onChange } }) => (
                                                    <ScrollView 
                                                        horizontal 
                                                        showsHorizontalScrollIndicator={false}
                                                        contentContainerStyle={{ gap: 8 }}
                                                    >
                                                        {REMINDER_INTERVALS.map((interval) => (
                                                            <Pressable
                                                                key={interval.value}
                                                                onPress={() => onChange(interval.value)}
                                                                className={`px-4 py-2 rounded-full border ${
                                                                    value === interval.value 
                                                                    ? "bg-primary border-primary" 
                                                                    : "bg-card border-border"
                                                                }`}
                                                            >
                                                                <Text className={`text-xs font-semibold ${
                                                                    value === interval.value ? "text-primary-foreground" : "text-foreground"
                                                                }`}>
                                                                    {interval.label}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </ScrollView>
                                                )}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </CardContent>
            </KeyboardAwareScrollView>

            <View className='border-t border-border bg-card px-4 py-4 shadow-lg'>
                <View className='flex-row gap-3'>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                        className={`flex-1 items-center justify-center rounded-xl border border-border px-4 py-3.5 bg-background ${isSubmitting ? "opacity-60" : "active:opacity-80"
                            }`}
                    >
                        <Text className='text-base font-bold text-foreground'>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className={`flex-1 items-center justify-center rounded-xl px-4 py-3.5 bg-primary ${isSubmitting
                            ? "opacity-60"
                            : "active:opacity-90"
                            }`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size='small' color='hsl(var(--primary-foreground))' />
                        ) : (
                            <Text className='text-base font-bold text-primary-foreground'>
                                Add Record
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>

            <ContactList
                contactsVisible={contactsVisible}
                contacts={contacts}
                contactSearch={contactSearch}
                setContactSearch={setContactSearch}
                filteredContacts={filteredContacts}
                onContactSelect={handleContactSelect}
                setContactsVisible={setContactsVisible}
            />
        </View>
    );
}
