import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    FlatList,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../form/Input";
import { PaymentRecord, RecordType } from "../../type/interface";
import {
    getContactsWithPermission,
    SimpleContact,
} from "../../utils/nativeAPI";

interface AddRecordProps {
    type: RecordType;
    onAddRecord: (record: Omit<PaymentRecord, "id">) => void;
}

export default function AddRecord({ type, onAddRecord }: AddRecordProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        amount: "",
        borrowedDate: "",
        purpose: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [contactsVisible, setContactsVisible] = useState(false);
    const [contacts, setContacts] = useState<SimpleContact[]>([]);
    const [contactSearch, setContactSearch] = useState("");

    const filteredContacts = useMemo(() => {
        const q = contactSearch.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter((c) => {
            const name = (c.name || "").toLowerCase();
            const phone = (c.phone || "").toLowerCase();
            return name.includes(q) || phone.includes(q);
        });
    }, [contacts, contactSearch]);

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
        if (!formData.borrowedDate.trim())
            newErrors.borrowedDate = "Borrowed date is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const newRecord: Omit<PaymentRecord, "id"> = {
            name: formData.name.trim(),
            amount: parseFloat(formData.amount) || 0,
            borrowedDate: formData.borrowedDate,
            category: formData.purpose,
            status: "unpaid",
            remaining: parseFloat(formData.amount) || 0,
        };

        onAddRecord(newRecord);
        setFormData({
            name: "",
            phone: "",
            amount: "",
            borrowedDate: "",
            purpose: "",
        });
        setErrors({});
    };

    const formatAmount = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, "");
        return numericValue;
    };

    const getAmountInWords = (amount: string) => {
        const num = parseFloat(amount) || 0;
        if (num === 0) return "Zero Rupees Only";
        return `${num} Rupees Only`;
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <StatusBar barStyle='dark-content' backgroundColor='#fff' />

            <View className='flex-1'>
                <View className='p-4 border-b border-gray-200 flex-row items-center justify-between'>
                    <Text className='text-xl font-semibold'>
                        Add New Record
                    </Text>
                </View>

                <ScrollView
                    className='flex-1'
                    showsVerticalScrollIndicator={false}
                >
                    <View className='p-4 space-y-4'>
                        {/* Payer's Name */}
                        <View>
                            <Text className='mb-1 text-sm text-gray-600'>
                                {type === RecordType.COLLECT
                                    ? "Borrowers Name"
                                    : "Receivers Name"}
                            </Text>
                            <View className='flex-row items-center'>
                                <Pressable
                                    onPress={async () => {
                                        const list =
                                            await getContactsWithPermission();
                                        if (list.length === 0) return;
                                        setContacts(list);
                                        setContactsVisible(true);
                                    }}
                                    className='ml-2 p-2 bg-gray-100 rounded-md'
                                >
                                    <Text className='text-gray-600'>👤</Text>
                                </Pressable>
                                <Input
                                    placeholder="Enter payer's name"
                                    value={formData.name}
                                    onChangeText={(value) =>
                                        handleInputChange("name", value)
                                    }
                                    className='flex-1'
                                    error={errors.name}
                                />
                            </View>
                        </View>

                        {/* Phone Number */}
                        <View>
                            <View className='flex-row items-center mb-1'>
                                <Text className='text-sm text-gray-600'>
                                    Phone Number
                                </Text>
                                <Text className='ml-1 text-xs text-gray-400'>
                                    eg. +91 XXXXXXXXXX
                                </Text>
                            </View>
                            <Input
                                placeholder='Phone Number'
                                value={formData.phone}
                                onChangeText={(value) =>
                                    handleInputChange("phone", value)
                                }
                                keyboardType='phone-pad'
                                error={errors.phone}
                            />
                        </View>

                        {/* Amount to Collect */}
                        <View>
                            <Text className='mb-1 text-sm text-gray-600'>
                                Amount to Collect
                            </Text>
                            <View className='flex-row items-center'>
                                <Text className='text-lg font-semibold mr-2'>
                                    ₹
                                </Text>
                                <Input
                                    placeholder='0.00'
                                    value={formData.amount}
                                    onChangeText={(value) =>
                                        handleInputChange(
                                            "amount",
                                            formatAmount(value)
                                        )
                                    }
                                    keyboardType='numeric'
                                    className='flex-1'
                                    error={errors.amount}
                                />
                            </View>
                            <Text className='mt-1 text-xs text-gray-500'>
                                {getAmountInWords(formData.amount)}
                            </Text>
                        </View>

                        {/* Borrowed Date */}
                        <View>
                            <Text className='mb-1 text-sm text-gray-600'>
                                Borrowed Date (MM/DD/YYYY)
                            </Text>
                            <View className='flex-row items-center'>
                                <Input
                                    placeholder='MM/DD/YYYY'
                                    value={formData.borrowedDate}
                                    onChangeText={(value) =>
                                        handleInputChange("borrowedDate", value)
                                    }
                                    className='flex-1'
                                    error={errors.borrowedDate}
                                />
                                <View className='ml-2 p-2 bg-gray-100 rounded-md'>
                                    <Text className='text-gray-600'>📅</Text>
                                </View>
                            </View>
                        </View>

                        {/* Purpose */}
                        <View>
                            <Text className='mb-1 text-sm text-gray-600'>
                                Purpose
                            </Text>
                            <Input
                                placeholder='Enter purpose'
                                value={formData.purpose}
                                onChangeText={(value) =>
                                    handleInputChange("purpose", value)
                                }
                                error={errors.purpose}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View className='p-4 border-t border-gray-200'>
                    <Pressable
                        onPress={handleSubmit}
                        className='py-3 px-4 bg-blue-600 rounded-md items-center'
                    >
                        <Text className='text-white font-medium'>
                            Add Record
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Contacts Picker Modal */}
            {contactsVisible && (
                <View className='absolute inset-0 bg-black/40 justify-end'>
                    <View className='bg-white max-h-[70%] rounded-t-2xl p-4'>
                        <View className='flex-row items-center justify-between mb-2'>
                            <Text className='text-base font-semibold'>
                                Select Contact
                            </Text>
                            <Pressable
                                onPress={() => setContactsVisible(false)}
                                className='p-2'
                            >
                                <Text className='text-xl text-gray-500'>×</Text>
                            </Pressable>
                        </View>
                        <View className='mb-2'>
                            <Input
                                placeholder='Search name or phone'
                                value={contactSearch}
                                onChangeText={setContactSearch}
                            />
                        </View>
                        <FlatList
                            data={filteredContacts}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        if (item.name)
                                            handleInputChange(
                                                "name",
                                                item.name
                                            );
                                        if (item.phone)
                                            handleInputChange(
                                                "phone",
                                                item.phone
                                            );
                                        setContactsVisible(false);
                                        setContactSearch("");
                                    }}
                                    className='py-3 border-b border-gray-100'
                                >
                                    <Text className='text-gray-900'>
                                        {item.name}
                                    </Text>
                                    {!!item.phone && (
                                        <Text className='text-gray-500 text-xs mt-0.5'>
                                            {item.phone}
                                        </Text>
                                    )}
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View className='py-6 items-center'>
                                    <Text className='text-gray-500 text-sm'>
                                        No contacts found
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
