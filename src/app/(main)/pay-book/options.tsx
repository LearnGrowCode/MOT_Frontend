import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import PaymentOptionModal from "@/features/books/components/pay-book/PaymentOptionModal";
import { getPayRecordById } from "@/features/books/api/book-entry.service";
import { PaymentRecord } from "@/features/books/types";
import { ActivityIndicator, View } from "react-native";

export default function PayBookOptionsScreen() {
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
                pathname: "/(screen)/pay-book/edit-record",
                params: { id: record.id },
            } as any);
        }
    };

    const handleDelete = () => {
        if (record) {
            router.push({
                pathname: "/(screen)/pay-book/delete",
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
        />
    );
}
