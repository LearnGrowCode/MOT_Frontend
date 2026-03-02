import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ReminderModal from "@/components/screens/collect-book/ReminderModal";
import { getCollectionRecordById } from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/modules/book.module";
import { ActivityIndicator, View, Share } from "react-native";

export default function CollectReminderScreen() {
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

    const handleSendReminder = async (message: string) => {
        try {
            const res = await Share.share({
                message: message,
            });
            if (res.action === Share.sharedAction) {
                router.back();
            }
        } catch (error: any) {
            console.error("Error sharing reminder:", error);
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
        <ReminderModal
            onClose={handleClose}
            onSendReminder={handleSendReminder}
            record={record}
            isScreen={true}
        />
    );
}
