import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DeletePaymentRecordModal from "@/components/screens/pay-book/DeletePaymentRecordModal";
import { getPayRecordById, deletePayRecord } from "@/services/book/book-entry.service";
import { PaymentRecord } from "@/modules/book.module";
import { ActivityIndicator, View } from "react-native";

export default function PayDeleteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<PaymentRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPayRecordById(id).then((data) => {
                setRecord(data);
                setIsLoading(false);
            });
        }
    }, [id]);

    const handleClose = () => {
        router.back();
    };

    const handleDelete = async (recordId: string) => {
        try {
            await deletePayRecord(recordId);
            router.dismissAll();
            router.push("/pay-book");
        } catch (error) {
            console.error("Failed to delete record:", error);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="hsl(var(--primary))" />
            </View>
        );
    }

    return (
        <DeletePaymentRecordModal
            onClose={handleClose}
            onDeleteRecord={handleDelete}
            record={record}
            isScreen={true}
        />
    );
}
