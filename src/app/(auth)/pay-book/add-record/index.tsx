import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { PaymentRecord, RecordType } from "@/type/interface";
import { getContactsWithPermission, SimpleContact } from "@/utils/nativeAPI";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import BottomModal from "@/components/ui/BottomModal";

interface AddRecordProps {
    type: RecordType;
    visible: boolean;
    onClose: () => void;
    onAddRecord: (record: Omit<PaymentRecord, "id">) => void;
}

interface FormData {
    name: string;
    phone: string;
    amount: string;
    borrowedDate: string;
    purpose: string;
}

export default function AddRecord({
    type,
    visible,
    onClose,
    onAddRecord,
}: AddRecordProps) {
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
            borrowedDate: "",
            purpose: "",
        },
    });

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

    const formatAmount = (value: string) => {
        return value.replace(/[^0-9.]/g, "");
    };

    const getAmountInWords = (amount: string) => {
        const num = parseFloat(amount) || 0;
        if (num === 0) return "Zero Rupees Only";
        return `${num} Rupees Only`;
    };

    const onSubmit = (data: FormData) => {
        const newRecord: Omit<PaymentRecord, "id"> = {
            name: data.name.trim(),
            amount: parseFloat(data.amount) || 0,
            borrowedDate: data.borrowedDate,
            category: data.purpose,
            status: "unpaid",
            remaining: parseFloat(data.amount) || 0,
        };

        onAddRecord(newRecord);
        reset();
        onClose();
    };

    return (
        <View className='flex-1'>
            <ScrollView showsVerticalScrollIndicator={true}>
                <CardContent className='space-y-6 p-4'>
                    {/* Payer's Name */}
                    <View>
                        <Pressable
                            onPress={async () => {
                                const list = await getContactsWithPermission();
                                if (list.length === 0) return;
                                setContacts(list);
                                setContactsVisible(true);
                            }}
                            className='p-2 bg-gray-100 rounded-lg  items-center justify-center'
                        >
                            <Text className='text-gray-600'>
                                👤 Import Contact
                            </Text>
                        </Pressable>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            {type === RecordType.COLLECT
                                ? "Borrowers Name"
                                : "Receivers Name"}
                        </Text>
                        <View className='flex items-center gap-2 w-full'>
                            <View className='flex-1 flex flex-row items-center '>
                                <Controller
                                    control={control}
                                    name='name'
                                    rules={{ required: "Name is required" }}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
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
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View>
                        <View className='flex-row items-center mb-2'>
                            <Text className='text-sm font-medium text-gray-700'>
                                Phone Number
                            </Text>
                        </View>
                        <View className='flex-row items-center gap-2 w-full'>
                            <View className='flex-1'>
                                <Controller
                                    control={control}
                                    name='phone'
                                    render={({
                                        field: { onChange, value },
                                    }) => (
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
                        </View>
                    </View>

                    {/* Amount */}
                    <View>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Amount to Collect
                        </Text>
                        <View className='flex-row items-center gap-2'>
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
                                        className='flex-1'
                                        error={errors.amount?.message}
                                    />
                                )}
                            />
                        </View>
                        <Text className='mt-1 text-xs text-gray-500'>
                            {getAmountInWords(control._formValues.amount)}
                        </Text>
                    </View>

                    {/* Borrowed Date */}
                    <View>
                        <Text className='mb-2 text-sm font-medium text-gray-700'>
                            Borrowed Date
                        </Text>
                        <Controller
                            control={control}
                            name='borrowedDate'
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
                                <View className='flex-row items-center gap-2'>
                                    <View className='flex-1'>
                                        <Text className='text-gray-700'>
                                            {value}
                                        </Text>
                                        {errors.borrowedDate && (
                                            <Text className='text-red-500 text-xs mt-1'>
                                                {errors.borrowedDate.message}
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
                                        className='px-3 py-2 rounded-md border border-gray-300 bg-white'
                                    >
                                        <Text>📅</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>

                    {/* Purpose */}
                    <View>
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

                    {/* Action Buttons */}
                    <View className='flex-row gap-4 mt-6'>
                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            className='flex-1 py-3 px-4 bg-blue-600 rounded-lg items-center'
                        >
                            <Text className='text-white font-medium'>
                                Add Record
                            </Text>
                        </Pressable>
                    </View>
                </CardContent>
            </ScrollView>

            {/* Contacts Picker Modal */}
            <BottomModal
                visible={contactsVisible}
                onClose={() => setContactsVisible(false)}
                title="Select Contact"
                maxHeight={0.85}
            >
                <View className='gap-3'>
                    <Input
                        placeholder='Search contacts'
                        value={contactSearch}
                        onChangeText={setContactSearch}
                    />

                    <View className='max-h-[480px]'>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            {filteredContacts.length === 0 ? (
                                <View className='py-6 items-center'>
                                    <Text className='text-gray-500'>No contacts found</Text>
                                </View>
                            ) : (
                                filteredContacts.map((c: SimpleContact) => (
                                    <Pressable
                                        key={c.id}
                                        onPress={() => {
                                            setValue("name", c.name || "");
                                            setValue("phone", c.phone || "");
                                            setContactsVisible(false);
                                        }}
                                        className='py-3 border-b border-gray-200'
                                    >
                                        <Text className='text-base text-gray-900'>
                                            {c.name || "Unnamed"}
                                        </Text>
                                        <Text className='text-sm text-gray-500'>
                                            {c.phone || "No phone"}
                                        </Text>
                                    </Pressable>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </BottomModal>
        </View>
    );
}
