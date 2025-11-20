import React from "react";
import { View, Text } from "react-native";
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
import { useUserCurrency } from "@/hooks/useUserCurrency";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MoreVertical } from "lucide-react-native";

interface PaymentRecordCardProps {
    record: PaymentRecord;
    onMarkPayment: (recordId: string) => void;
    onOption: (recordId: string) => void;
}

export default function PaymentRecordCard({
    record,
    onMarkPayment,
    onOption,
}: PaymentRecordCardProps) {
    const { currency } = useUserCurrency();
    const getCardColorClasses = (status: PaymentRecord["status"]) => {
        switch (status) {
            case "unpaid":
                return "bg-[#fff7ed] border-[#fed7aa]";
            case "paid":
                return "bg-[#f0fdf4] border-[#bbf7d0]";
            case "partial":
                return "bg-[#fefce8] border-[#fde047]";
            case "overdue":
                return "bg-[#fef2f2] border-[#fecaca]";
            default:
                return "bg-[#eef3ff] border-[#dbe4ff]";
        }
    };
    return (
        <Card
            className={`shadow-sm rounded-2xl border ${getCardColorClasses(record.status)} p-2`}
        >
            <CardContent className='p-2'>
                <View className='flex-row items-start justify-between '>
                    <View className='flex-row items-center flex-1'>
                        <View className='w-12 h-12 bg-[#dbe4ff] border border-[#93c5fd] rounded-xl items-center justify-center mr-4 relative'>
                            <Text className='text-[#1d4ed8] text-base font-semibold'>
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
                                {formatCurrency(record.amount, currency, 0)}
                            </Text>
                        </View>
                    </View>

                    <View className='items-end flex gap-2'>
                        <MoreVertical
                            size={20}
                            color='#666'
                            onPress={() => onOption(record.id)}
                        />
                        <View
                            className={`px-3 py-1.5 rounded-full mb-2 ${getStatusColor(record.status)}`}
                        >
                            <Text className='text-xs font-semibold'>
                                {getStatusText(record.status)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Category line to reflect simple text like in the screenshot */}
                <View className='gap-1'>
                    {record.purpose?.trim() ? (
                        <View className='self-start px-3 py-1 rounded-full bg-white/80 border border-gray-100'>
                            <Text
                                className='text-xs font-medium text-gray-600'
                                numberOfLines={1}
                            >
                                {record.purpose.trim()}
                            </Text>
                        </View>
                    ) : null}
                </View>
                {record.trx_history && record.trx_history.length > 0 && (
                    <Accordion type='single' collapsible>
                        <AccordionItem value='transaction-history'>
                            <AccordionTrigger className='border-b-1 rounded-none border-gray-200  p-3 flex-row justify-between items-center'>
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
                            <AccordionContent className='bg-white pb-0'>
                                <View className='divide-y divide-gray-100'>
                                    {record.trx_history.map((item) => (
                                        <View
                                            key={item.id}
                                            className='flex-row justify-between items-center p-3'
                                        >
                                            <Text className='text-sm font-medium text-gray-700'>
                                                {formatDate(item.date)}
                                            </Text>
                                            <Text className='text-sm font-semibold text-gray-700'>
                                                {formatCurrency(
                                                    item.amount,
                                                    currency,
                                                    2
                                                )}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
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
                        {formatCurrency(record.remaining, currency, 2)}
                    </Text>
                </View>

                {record.status !== "paid" && (
                    <PrimaryButton
                        title='Add Payment Record'
                        onPress={() => onMarkPayment(record.id)}
                        className='bg-[#2563eb] shadow-sm shadow-[#93c5fd] rounded-lg  py-2 font-thin'
                    />
                )}
            </CardContent>
        </Card>
    );
}
