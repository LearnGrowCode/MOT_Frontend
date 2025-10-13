import React from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import PrimaryButton from "@/components/button/PrimaryButton";
import { PaymentRecord } from "@/type/interface";
import {
    formatDate,
    getStatusColor,
    getStatusText,
    getTimeAgo,
    formatCurrency,
} from "@/utils/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react-native";

interface PaymentRecordCardProps {
    record: PaymentRecord;
    onMarkPayment: (recordId: string) => void;
}

export default function PaymentRecordCard({
    record,
    onMarkPayment,
}: PaymentRecordCardProps) {
    const getCardColorClasses = (status: PaymentRecord["status"]) => {
        switch (status) {
            case "unpaid":
                return "bg-orange-50 border-orange-200";
            case "paid":
                return "bg-green-50 border-green-200";
            case "partial":
                return "bg-yellow-50 border-yellow-200";
            case "overdue":
                return "bg-red-50 border-red-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };
    return (
        <Card
            className={`shadow-sm rounded-2xl border ${getCardColorClasses(record.status)}`}
        >
            <CardContent>
                <View className='flex-row items-start justify-between mb-4'>
                    <View className='flex-row items-center flex-1'>
                        <View className='w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl items-center justify-center mr-4 relative'>
                            <Text className='text-blue-700 text-base font-semibold'>
                                {record.name.charAt(0).toUpperCase()}
                            </Text>
                            {record.status === "unpaid" && (
                                <View className='absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white'>
                                    <Text className='text-white text-xs'>
                                        ⏰
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className='flex-1'>
                            <Text className='text-base font-semibold text-gray-900 mb-1'>
                                {record.name}
                            </Text>
                            <Text className='text-xl font-bold text-gray-900'>
                                {formatCurrency(
                                    record.amount,
                                    "INR",
                                    "en-IN",
                                    0
                                )}
                            </Text>
                        </View>
                    </View>

                    <View className='items-end flex-row gap-2'>
                        <View
                            className={`px-3 py-1.5 rounded-full mb-2 ${getStatusColor(record.status)}`}
                        >
                            <Text className='text-xs font-semibold'>
                                {getStatusText(record.status)}
                            </Text>
                        </View>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Pressable className='p-2'>
                                    <MoreVertical size={20} color="#666" />
                                </Pressable>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onPress={() => {}}>
                                    <Text>Edit</Text>
                                </DropdownMenuItem>
                                <DropdownMenuItem onPress={() => {}}>
                                    <Text>Delete</Text>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </View>
                </View>

                {/* Category line to reflect simple text like in the screenshot */}
                <View className='mb-3'>
                    <Text className='text-sm text-gray-700'>
                        {record.category}
                    </Text>
                </View>
                {record.trx_history && record.trx_history.length > 0 && (
                    <Accordion type='single' collapsible>
                        <AccordionItem value='transaction-history'>
                            <AccordionTrigger className='border-b-2 rounded-none border-gray-200  p-3 flex-row justify-between items-center'>
                                <View className='flex-row items-center gap-2'>
                                    <Text className='text-sm font-semibold text-gray-900'>
                                        Payment History
                                    </Text>
                                    <View className='bg-gray-100 px-2 py-0.5 rounded-full'>
                                        <Text className='text-xs text-gray-700'>
                                            {record.trx_history.length}
                                        </Text>
                                    </View>
                                </View>
                            </AccordionTrigger>
                            <AccordionContent className='bg-gray-50 rounded-b-xl'>
                                <FlatList
                                    data={record.trx_history}
                                    renderItem={({ item }) => (
                                        <View className='flex-row justify-between items-center p-3 border-b border-gray-100'>
                                            <View className='flex-row items-center gap-2'>
                                                <View>
                                                    <Text className='text-sm font-medium text-gray-700'>
                                                        {formatDate(item.date)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className='text-sm font-semibold text-gray-700'>
                                                {formatCurrency(
                                                    item.amount,
                                                    "INR",
                                                    "en-IN",
                                                    2
                                                )}
                                            </Text>
                                        </View>
                                    )}
                                    ItemSeparatorComponent={() => (
                                        <View className='h-[1px] bg-gray-100' />
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* Footer row: time ago and remaining amount */}
                <View className='flex-row items-center justify-between mt-3 mb-4'>
                    <View className='flex-row items-center'>
                        <Text className='text-gray-400 mr-2'>⏰</Text>
                        <Text className='text-sm text-gray-600'>
                            {getTimeAgo(record.borrowedDate)}
                        </Text>
                    </View>
                    <Text className='text-sm font-medium text-gray-700'>
                        Remaining:{" "}
                        {formatCurrency(record.remaining, "INR", "en-IN", 2)}
                    </Text>
                </View>

                {record.status !== "paid" && (
                    <PrimaryButton
                        title='Mark Payment'
                        onPress={() => onMarkPayment(record.id)}
                        className='bg-blue-600 shadow-sm shadow-blue-200'
                    />
                )}
            </CardContent>
        </Card>
    );
}
