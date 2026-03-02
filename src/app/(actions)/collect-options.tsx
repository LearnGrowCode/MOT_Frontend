import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CollectionOptionModal from "@/components/screens/collect-book/CollectionOptionModal";
import { getCollectionRecordById } from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/modules/book.module";
import { ActivityIndicator, View } from "react-native";

export default function CollectOptionsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<CollectionRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getCollectionRecordById(id).then((data) => {
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
                pathname: "/collect-edit",
                params: { id: record.id },
            } as any);
        }
    };

    const handleDelete = () => {
        if (record) {
            router.push({
                pathname: "/collect-delete",
                params: { id: record.id },
            } as any);
        }
    };

    const handleSendReminderPress = () => {
        if (record) {
            router.push({
                pathname: "/collect-reminder",
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
        <CollectionOptionModal
            onClose={handleClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSendReminder={handleSendReminderPress}
            record={record}
            isScreen={true}
        />
    );
}
