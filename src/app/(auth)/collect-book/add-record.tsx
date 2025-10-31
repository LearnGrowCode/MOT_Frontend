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

interface FormData {
    name: string;
    phone: string;
    amount: string;
    lentDate: string;
    purpose: string;
}

export default function AddRecord() {
    const router = useRouter();
    const { updateContactsGranted, contacts } = usePermissionStore();
    useEffect(() => {
        updateContactsGranted();
    }, [updateContactsGranted]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            phone: "",
            amount: "",
            lentDate: new Date().toLocaleDateString(),
            purpose: "",
        },
    });

    const [contactsVisible, setContactsVisible] = useState(false);
    const [contactSearch, setContactSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(contactSearch);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [contactSearch]);

    const filteredContacts = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return contacts;

        // Pre-compile search terms for better performance
        const searchTerms = q.split(" ").filter((term) => term.length > 0);

        return contacts.filter((c) => {
            // Use pre-computed search fields for better performance
            const searchName = c.searchName || (c.name || "").toLowerCase();
            const searchPhone = c.searchPhone || (c.phone || "").toLowerCase();

            // Check if all search terms are found in name or phone
            return searchTerms.every(
                (term) =>
                    searchName.includes(term) || searchPhone.includes(term)
            );
        });
    }, [contacts, debouncedSearch]);

    const formatAmount = (value: string) => {
        return value.replace(/[^0-9.]/g, "");
    };

    const getAmountInWords = (amount: string, currency: string) => {
        const num = parseFloat(amount) || 0;
        if (num === 0) return "Zero " + currency + " Only";
        return `${num} ${currency} Only`;
    };

    const onSubmit = useCallback(
        (data: FormData) => {
            // In a future iteration, persist the new record then navigate back
            reset();
            router.back();
        },
        [reset, router]
    );

    const handleContactSelect = useCallback(
        (name: string, phone: string) => {
            setValue("name", name);
            setValue("phone", phone);
            setContactsVisible(false);
        },
        [setValue]
    );

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
                            Add Entry to Collect Book
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
                            Amount to Collect
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
                        <Text className='mt-2 text-xs text-gray-500'>
                            {getAmountInWords(
                                control._formValues.amount,
                                "INR"
                            )}
                        </Text>
                    </View>

                    <View className='mb-4'>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Lent Date (DD/MM/YYYY)
                        </Text>
                        <Controller
                            control={control}
                            name='lentDate'
                            rules={{
                                required: "Date is required",
                                validate: (value) => {
                                    const date = new Date(value);
                                    return (
                                        !isNaN(date.getTime()) ||
                                        "Invalid date format"
                                    );
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View className='flex-row items-center'>
                                    <View className='flex-1'>
                                        <Text className='text-gray-700'>
                                            {value}
                                        </Text>
                                        {errors.lentDate && (
                                            <Text className='text-red-500 text-xs mt-1'>
                                                {errors.lentDate.message}
                                            </Text>
                                        )}
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            DateTimePickerAndroid.open({
                                                value: new Date(),
                                                onChange: (event, date) => {
                                                    if (
                                                        event.type === "set" &&
                                                        date
                                                    ) {
                                                        onChange(
                                                            date.toLocaleDateString()
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
                        className='py-3 px-4 bg-green-600 rounded-lg items-center'
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
