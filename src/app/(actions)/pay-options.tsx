import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import PaymentOptionModal from "@/components/screens/pay-book/PaymentOptionModal";
import { getPayRecordById } from "@/services/book/book-entry.service";
import { PaymentRecord } from "@/modules/book.module";
import { ActivityIndicator, View } from "react-native";

export default function PayOptionsScreen() {
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

    const handleEdit = () => {
        if (record) {
            router.push({
                pathname: "/pay-edit",
                params: { id: record.id },
            } as any);
        }
    };

    const handleDelete = () => {
        if (record) {
            router.push({
                pathname: "/pay-delete",
                params: { id: record.id },
            } as any);
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
        <PaymentOptionModal
            onClose={handleClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
            record={record}
            isScreen={true}
        />
    );
}
