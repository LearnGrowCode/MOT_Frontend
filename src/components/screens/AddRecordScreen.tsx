import Input from "@/components/form/Input";
import ContactList from "@/components/modals/ContactList";
import { CardContent } from "@/components/ui/card";
import { createBookEntry } from "@/db/models/Book";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { usePermissionStore } from "@/store/usePermissionStore";
import { formatAmountInput, getAmountInWords } from "@/utils/utils";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type BookType = "COLLECT" | "PAY";

interface FormData {
    name: string;
    phone: string;
    amount: string;
    date: string;
    purpose: string;
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
        },
    });

    const [contactsVisible, setContactsVisible] = useState(false);
    const [contactSearch, setContactSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    const nameLabel = isCollect ? "Borrower Name" : "Payer Name";
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
                });

                reset({
                    name: "",
                    phone: "",
                    amount: "",
                    date: new Date().toISOString(),
                    purpose: "",
                });
                setSelectedDate(new Date());
                router.back();
            } catch (error) {
                console.error("❌ Error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [reset, router, selectedDate, currency, type]
    );

    return (
        <View className='flex-1 bg-white'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <CardContent className='flex flex-col px-0 pt-2'>
                    <View className='mb-6 px-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-stone-500'>
                            {bookTypeLabel}
                        </Text>
                        <Text className='mt-1 text-3xl font-bold text-stone-900'>
                            Add Record
                        </Text>
                    </View>

                    <View className='mb-6 px-4'>
                        <View className='rounded-2xl border border-[#e3e9f5] bg-white px-4 py-4 shadow-sm'>
                            <Text className='text-xs font-semibold uppercase tracking-[1px] text-stone-500'>
                                Record details
                            </Text>
                            <View className='mt-2'>
                                <Pressable
                                    onPress={() => {
                                        setContactsVisible(true);
                                    }}
                                    className='mb-4 rounded-xl border border-[#dbe4ff] bg-[#eef3ff] px-4 py-3 items-center justify-center'
                                >
                                    <Text className='text-[#2563eb] font-semibold'>
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
                                                <Text className='mt-2 text-xs text-[#3b82f6] capitalize'>
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
                                    <Text className='mb-1 text-sm text-gray-600'>
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
                                            <Pressable
                                                onPress={() => {
                                                    DateTimePickerAndroid.open({
                                                        value: selectedDate,
                                                        onChange: (
                                                            event,
                                                            date
                                                        ) => {
                                                            if (
                                                                event.type ===
                                                                "set" &&
                                                                date
                                                            ) {
                                                                setSelectedDate(
                                                                    date
                                                                );
                                                                onChange(
                                                                    date.toISOString()
                                                                );
                                                            }
                                                        },
                                                        mode: "date",
                                                    });
                                                }}
                                                className='w-full flex-row items-center justify-between rounded-xl border border-[#dbe4ff] bg-white px-4 py-3'
                                            >
                                                <Text className='text-base text-gray-900'>
                                                    {selectedDate.toLocaleDateString()}
                                                </Text>
                                                <Text className='text-slate-400'>
                                                    📅
                                                </Text>
                                            </Pressable>
                                        )}
                                    />
                                    {errors.date && (
                                        <Text className='text-red-500 text-xs mt-1'>
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
                            </View>
                        </View>
                    </View>
                </CardContent>
            </KeyboardAwareScrollView>

            <View className='border-t border-[#e3e9f5] bg-white px-4 py-3 shadow-lg shadow-black/5'>
                <View className='flex-row'>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                        className={`mr-3 flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 ${isSubmitting ? "opacity-60" : "active:opacity-80"
                            }`}
                    >
                        <Text className='text-base font-semibold text-slate-700'>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className={`flex-1 items-center justify-center rounded-xl px-4 py-3 ${isSubmitting
                                ? "bg-[#93c5fd]"
                                : "bg-[#2563eb] active:bg-[#1d4ed8]"
                            }`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size='small' color='white' />
                        ) : (
                            <Text className='text-base font-semibold text-white'>
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
