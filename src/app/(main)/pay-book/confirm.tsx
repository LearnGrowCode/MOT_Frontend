import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import TransactionConfirmation from "@/shared/components/common/modals/TransactionConfirmation";
import { getPayRecordById } from "@/features/books/api/book-entry.service";
import { PaymentRecord } from "@/features/books/types";
import { ActivityIndicator, View } from "react-native";
import { addSettlement } from "@/db/models/Book";
import { uuidv4 } from "@/shared/utils/uuid";

export default function PayBookConfirmScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [record, setRecord] = useState<PaymentRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPayRecordById(id).then((data) => {
                if (data) {
                    setRecord(data);
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    const handleConfirm = async (amount: number, payer: string) => {
        if (record && amount > 0) {
            try {
                await addSettlement({
                    id: uuidv4(),
                    bookEntryId: record.id,
                    amount: amount,
                    date: Date.now(),
                    description: `Payment from ${payer}`,
                });
            } catch (error) {
                console.error("Error adding settlement:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
                <ActivityIndicator size="large" color="hsl(var(--primary))" />
            </View>
        );
    }

    return (
        <TransactionConfirmation
            onConfirm={handleConfirm}
            record={record}
            type='payment'
        />
    );
}
