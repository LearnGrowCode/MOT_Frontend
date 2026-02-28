import React from "react";
import { View, Text } from "react-native";
import { BaseBookRecord } from "@/modules/book.module";
import { formatCurrency } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

interface RecordInfoCardProps {
    record: BaseBookRecord | null;
    variant?: "green" | "blue";
}

export default function RecordInfoCard({
    record,
    variant = "green",
}: RecordInfoCardProps) {
    const { currency } = useUserCurrency();

    if (!record) {
        return null;
    }

    const getStatusBadgeColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case "collected":
            case "paid":
                return "bg-green-100 text-green-700";
            case "partial":
                return "bg-yellow-100 text-yellow-700";
            case "unpaid":
                return "bg-orange-100 text-orange-700";
            case "overdue":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const bgColor = variant === "green" ? "bg-green-50" : "bg-blue-50";
    const borderColor =
        variant === "green" ? "border-green-200/60" : "border-blue-200/60";

    return (
        <View className={`${bgColor} p-3 rounded-xl border ${borderColor}`}>
            <View className='flex-row items-center justify-between'>
                <View className='flex-1'>
                    <Text className='text-base font-semibold text-gray-900 mb-1.5'>
                        {record.name}
                    </Text>
                    <Text className='text-sm font-medium text-gray-700'>
                        Remaining:{" "}
                        {formatCurrency(record.remaining, currency, 2)}
                    </Text>
                </View>
                <View
                    className={`px-2.5 py-1 rounded-full ${getStatusBadgeColor(record.status)}`}
                >
                    <Text className='text-xs font-semibold'>
                        {record.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
    );
}
