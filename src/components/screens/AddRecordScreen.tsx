import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import ContactList from "@/components/modals/ContactList";
import { usePermissionStore } from "@/store/usePermissionStore";
import { createBookEntry } from "@/db/models/Book";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { getAmountInWords, formatAmountInput } from "@/utils/utils";

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

    const onSubmit = useCallback(
        async (data: FormData) => {
            const dateTimestamp = selectedDate.getTime();

            try {
                await createBookEntry({
                    type: type,
                    userId: "1",
                    counterparty: data.name,
                    date: dateTimestamp,
                    description: data.purpose,
                    principalAmount: Number(data.amount),
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
            }
        },
        [reset, router, selectedDate, currency, type]
    );

    const handleContactSelect = useCallback(
        (name: string, phone: string) => {
            setValue("name", name);
            setValue("phone", phone);
            setContactsVisible(false);
        },
        [setValue]
    );

    // Dynamic labels and colors based on type
    const isCollect = type === "COLLECT";
    const title = isCollect
        ? "Add Entry to Collect Book"
        : "Add Entry to Pay Book";
    const amountLabel = isCollect ? "Amount to Collect" : "Amount to Pay";
    const dateLabel = isCollect
        ? "Lent Date (DD/MM/YYYY)"
        : "Borrowed Date (DD/MM/YYYY)";
    const buttonColor = isCollect ? "bg-green-600" : "bg-blue-600";

    return (
        <View className='flex-1'>
            <KeyboardAwareScrollView
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <CardContent className='flex flex-col p-4'>
                    <View className='mb-6'>
                        <Text className='text-2xl font-bold text-gray-900'>
                            {title}
                        </Text>
                    </View>

                    <View className='mb-4'>
                        <Pressable
                            onPress={() => {
                                setContactsVisible(true);
                            }}
                            className='p-3 bg-gray-100 rounded-lg items-center justify-center mb-4'
                        >
                            <Text className='text-gray-700 font-medium'>
                                👤 Import Contact
                            </Text>
                        </Pressable>

                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Name
                        </Text>

                        <Controller
                            control={control}
                            name='name'
                            rules={{ required: "Name is required" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder='Enter name'
                                    value={value}
                                    onChangeText={onChange}
                                    className='w-full'
                                    error={errors.name?.message}
                                />
                            )}
                        />
                    </View>

                    <View className='mb-4'>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Phone Number
                        </Text>
                        <Controller
                            control={control}
                            name='phone'
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder='Phone Number'
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType='phone-pad'
                                    className='w-full'
                                />
                            )}
                        />
                    </View>

                    <View className='mb-4'>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            {amountLabel}
                        </Text>
                        <Controller
                            control={control}
                            name='amount'
                            rules={{ required: "Amount is required" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder='0.00'
                                    value={value}
                                    onChangeText={(val) =>
                                        onChange(formatAmount(val))
                                    }
                                    keyboardType='numeric'
                                    className='w-full'
                                    error={errors.amount?.message}
                                />
                            )}
                        />
                        <Text className='mt-2 text-xs text-gray-500 capitalize'>
                            {getAmountInWords(amountValue || "", currency)}
                        </Text>
                    </View>

                    <View className='mb-4'>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            {dateLabel}
                        </Text>
                        <Controller
                            control={control}
                            name='date'
                            rules={{
                                required: "Date is required",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View className='flex-row items-center'>
                                    <View className='flex-1'>
                                        <Text className='text-gray-700'>
                                            {selectedDate.toLocaleDateString()}
                                        </Text>
                                        {errors.date && (
                                            <Text className='text-red-500 text-xs mt-1'>
                                                {errors.date.message}
                                            </Text>
                                        )}
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            DateTimePickerAndroid.open({
                                                value: selectedDate,
                                                onChange: (event, date) => {
                                                    if (
                                                        event.type === "set" &&
                                                        date
                                                    ) {
                                                        setSelectedDate(date);
                                                        onChange(
                                                            date.toISOString()
                                                        );
                                                    }
                                                },
                                                mode: "date",
                                            });
                                        }}
                                        className='ml-3 px-4 py-2 rounded-md border border-gray-300 bg-white'
                                    >
                                        <Text>📅</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>

                    <View className='mb-6'>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Purpose
                        </Text>
                        <Controller
                            control={control}
                            name='purpose'
                            rules={{ required: "Purpose is required" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder='Enter purpose'
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.purpose?.message}
                                />
                            )}
                        />
                    </View>

                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        className={`py-3 px-4 ${buttonColor} rounded-lg items-center`}
                    >
                        <Text className='text-white font-medium'>
                            Add Record
                        </Text>
                    </Pressable>
                </CardContent>
            </KeyboardAwareScrollView>

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
