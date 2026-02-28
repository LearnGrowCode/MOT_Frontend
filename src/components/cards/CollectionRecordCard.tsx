import PrimaryButton from "@/components/button/PrimaryButton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { CollectionRecord } from "@/modules/book.module";
import {
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusText,
    getTimeAgo,
} from "@/utils/utils";
import { MoreVertical } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

interface CollectionRecordCardProps {
    record: CollectionRecord;
    onMarkCollection: (recordId: string) => void;
    onOption: (recordId: string) => void;
}

export default function CollectionRecordCard({
    record,
    onMarkCollection,
    onOption,
}: CollectionRecordCardProps) {
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const getCardColorClasses = (status: CollectionRecord["status"]) => {
        switch (status) {
            case "unpaid":
                return "bg-unpaid-background border-unpaid-border";
            case "collected":
                return "bg-collected-background border-collected-border";
            case "partial":
                return "bg-partial-background border-partial-border";
            case "overdue":
                return "bg-overdue-background border-overdue-border";
            default:
                return "bg-card border-border";
        }
    };
    return (
        <Card
            className={`shadow-sm rounded-2xl border ${getCardColorClasses(record.status)}  p-2`}
        >
            <CardContent className='p-2'>
                <View className='flex-row items-start justify-between '>
                    <View className='flex-row items-center flex-1'>
                        <View className='w-14 h-14 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-2xl items-center justify-center mr-4 relative'>
                            <Text className='text-primary text-xl font-bold'>
                                {record.name.charAt(0).toUpperCase()}
                            </Text>
                            {record.status === "unpaid" && (
                                <View className='absolute -bottom-1 -right-1 w-5 h-5 bg-destructive rounded-full items-center justify-center border-2 border-background'>
                                    <Text className='text-white text-xs'>
                                        ⏰
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className='flex-1'>
                            <Text className='text-base font-semibold text-foreground mb-1'>
                                {record.name}
                            </Text>
                            <Text className='text-xl font-bold text-foreground'>
                                {formatCurrency(record.amount, currency, 0)}
                            </Text>
                        </View>
                    </View>

                    <View className='items-end flex gap-2'>
                        <Pressable 
                            onPress={() => onOption(record.id)}
                            hitSlop={8}
                        >
                            <MoreVertical
                                size={20}
                                color={isDark ? "#f8fafc" : "#475569"} // secondary-50 and secondary-600 literals
                            />
                        </Pressable>
                        <View
                            className={`px-3 py-1.5 rounded-full mb-2 ${getStatusColor(record.status)}`}
                        >
                            <Text className='text-xs font-semibold dark:text-white'>
                                {getStatusText(record.status)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Purpose line */}
                <View className='gap-1'>
                    {record.purpose?.trim() ? (
                        <View className='self-start px-3 py-1 rounded-full bg-card/50 border border-border'>
                            <Text
                                className='text-xs font-medium text-muted-foreground'
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
                            <AccordionTrigger className='border-b-1 rounded-none border-border  p-3 flex-row justify-between items-center'>
                                <View className='flex-row items-center gap-2'>
                                    <Text className='text-sm font-semibold text-foreground'>
                                        Collection History
                                    </Text>
                                    <View className='bg-muted px-2 py-0.5 rounded-full'>
                                        <Text className='text-xs text-muted-foreground'>
                                            {record.trx_history.length}
                                        </Text>
                                    </View>
                                </View>
                            </AccordionTrigger>
                            <AccordionContent className='bg-card pb-0'>
                                <View className='divide-y divide-border'>
                                    {record.trx_history.map((item) => (
                                        <View
                                            key={item.id}
                                            className='flex-row justify-between items-center p-3'
                                        >
                                            <Text className='text-sm font-medium text-muted-foreground'>
                                                {formatDate(item.date)}
                                            </Text>
                                            <Text className='text-sm font-semibold text-foreground'>
                                                {formatCurrency(
                                                    item.amount,
                                                    "INR",
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
                        <Text className='text-muted-foreground mr-2'>⏰</Text>
                        <Text className='text-sm text-muted-foreground'>
                            {getTimeAgo(record.lentDate)}
                        </Text>
                    </View>
                    <Text className='text-sm font-medium text-foreground'>
                        Remaining:{" "}
                        {formatCurrency(record.remaining, currency, 2)}
                    </Text>
                </View>

                {record.status !== "collected" && (
                    <PrimaryButton
                        title='Add Collection Record'
                        onPress={() => onMarkCollection(record.id)}
                        className='bg-tertiary-500 shadow-md shadow-tertiary-500/20 border-0'
                    />
                )}
            </CardContent>
        </Card>
    );
}
