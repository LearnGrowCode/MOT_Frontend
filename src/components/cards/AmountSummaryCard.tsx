import { View, Text } from "react-native";
import { Card, CardContent } from "../ui/card";
import { formatCurrency } from "@/utils/utils";

interface AmountSummaryCardProps {
    amount: number;
    message: string;
}

export default function AmountSummaryCard({
    amount,
    message,
}: AmountSummaryCardProps) {
    return (
        <Card className='bg-gray-50 border border-gray-100 shadow-sm'>
            <CardContent className='gap-2'>
                <Text className='text-sm font-medium text-gray-600'>
                    Amount To Pay
                </Text>
                <Text className='text-3xl font-bold text-gray-900 mb-1'>
                    {formatCurrency(amount, "INR", "en-IN", 2, "K")}
                </Text>
                <Text className='text-sm text-gray-600'>{message}</Text>
            </CardContent>
        </Card>
    );
}
