import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import PrimaryButton from "@/components/button/PrimaryButton";
import { PaymentRecord } from "@/type/interface";

interface PaymentRecordCardProps {
    record: PaymentRecord;
    onMarkPayment: (recordId: string) => void;
    onOptionsPress: (recordId: string) => void;
}

export default function PaymentRecordCard({
    record,
    onMarkPayment,
    onOptionsPress,
}: PaymentRecordCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? "s" : ""} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years > 1 ? "s" : ""} ago`;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "unpaid":
                return "bg-orange-100 text-orange-700";
            case "paid":
                return "bg-green-100 text-green-700";
            case "partial":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "unpaid":
                return "⏰ Unpaid";
            case "paid":
                return "✅ Paid";
            case "partial":
                return "🔄 Partial";
            default:
                return "❓ Unknown";
        }
    };

    return (
        <Card className='bg-yellow-50 border-0'>
            <CardContent className='p-4'>
                <View className='flex-row items-start justify-between mb-3'>
                    <View className='flex-row items-center flex-1'>
                        <View className='w-10 h-10 bg-yellow-200 rounded-full items-center justify-center mr-3 relative'>
                            <Text className='text-gray-600 text-sm font-medium'>
                                {record.name.charAt(0).toUpperCase()}
                            </Text>
                            <View className='absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full items-center justify-center'>
                                <Text className='text-white text-xs'>⏰</Text>
                            </View>
                        </View>
                        <View className='flex-1'>
                            <Text className='text-base font-bold text-gray-900'>
                                {record.name}
                            </Text>
                            <Text className='text-lg font-bold text-gray-900'>
                                ₹{record.amount.toFixed(2)}
                            </Text>
                            <Text className='text-sm text-gray-600'>
                                Borrowed on {formatDate(record.borrowedDate)}
                            </Text>
                        </View>
                    </View>

                    <View className='items-end'>
                        <View
                            className={`px-2 py-1 rounded-full mb-1 ${getStatusColor(record.status)}`}
                        >
                            <Text className='text-xs font-medium'>
                                {getStatusText(record.status)}
                            </Text>
                        </View>
                        <Pressable onPress={() => onOptionsPress(record.id)}>
                            <Text className='text-gray-400 text-lg'>⋮</Text>
                        </Pressable>
                    </View>
                </View>

                <Text className='text-sm text-gray-600 mb-2'>
                    {record.category}
                </Text>

                <View className='flex-row items-center justify-between mb-3'>
                    <View className='flex-row items-center'>
                        <Text className='text-gray-400 mr-1'>📅</Text>
                        <Text className='text-sm text-gray-600'>
                            {getTimeAgo(record.borrowedDate)}
                        </Text>
                    </View>
                    <Text className='text-sm text-gray-600'>
                        Remaining: ₹{record.remaining.toFixed(2)}
                    </Text>
                </View>

                {record.status !== "paid" && (
                    <PrimaryButton
                        title='Mark Payment'
                        onPress={() => onMarkPayment(record.id)}
                        className='bg-blue-600'
                    />
                )}
            </CardContent>
        </Card>
    );
}
