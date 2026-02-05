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
        <Card className='bg-primary/5 border-primary/20 shadow-sm'>
            <CardContent className='gap-2'>
                <Text className='text-sm font-medium text-primary'>
                    {message.toLowerCase().includes("collect") ? "Amount To Collect" : "Amount To Pay"}
                </Text>
                <Text className='text-3xl font-bold text-foreground mb-1'>
                    {formatCurrency(amount, currency, 2, "")}
                </Text>
                <Text className='text-sm text-muted-foreground'>{message}</Text>
            </CardContent>
        </Card>
    );
}
