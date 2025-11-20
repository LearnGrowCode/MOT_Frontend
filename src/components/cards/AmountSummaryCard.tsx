import { Text } from "react-native";
import { Card, CardContent } from "../ui/card";
import { formatCurrency } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

interface AmountSummaryCardProps {
    amount: number;
    message: string;
}

export default function AmountSummaryCard({
    amount,
    message,
}: AmountSummaryCardProps) {
    const { currency } = useUserCurrency();
    return (
        <Card className='bg-[#eef3ff] border border-[#dbe4ff] shadow-sm'>
            <CardContent className='gap-2'>
                <Text className='text-sm font-medium text-[#1d4ed8]'>
                    Amount To Pay
                </Text>
                <Text className='text-3xl font-bold text-[#1e3a8a] mb-1'>
                    {formatCurrency(amount, currency, 2, "")}
                </Text>
                <Text className='text-sm text-[#3b82f6]'>{message}</Text>
            </CardContent>
        </Card>
    );
}
