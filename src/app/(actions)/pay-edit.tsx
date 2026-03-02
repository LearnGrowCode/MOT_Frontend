import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import EditPaymentRecordModal from "@/components/screens/pay-book/EditPaymentRecordModal";
import { getPayRecordById, updatePayRecord } from "@/services/book/book-entry.service";
import { PaymentRecord } from "@/modules/book.module";

export default function PayEditScreen() {
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

    const handleSave = async (updatedRecord: PaymentRecord, options?: { deleteSettlementIds?: string[] }) => {
        try {
            await updatePayRecord(updatedRecord, options);
            router.back();
        } catch (error) {
            console.error("Error updating record:", error);
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
        <EditPaymentRecordModal
            record={record}
            onClose={handleClose}
            onSaveRecord={handleSave}
            isScreen={true}
        />
    );
}
