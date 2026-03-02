import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ReminderModal from "@/components/screens/collect-book/ReminderModal";
import { getCollectionRecordById } from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/modules/book.module";
import { Share, Alert } from "react-native";

export default function CollectBookReminderScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<CollectionRecord | null>(null);

    useEffect(() => {
        if (id) {
            getCollectionRecordById(id).then(setRecord);
        }
    }, [id]);

    const handleSendReminder = async (message: string) => {
        try {
            await Share.share({
                message: message,
            });
            router.dismissAll();
        } catch {
            Alert.alert("Error", "Could not share the reminder.");
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <ReminderModal
            onClose={handleClose}
            onSendReminder={handleSendReminder}
            record={record}
            isScreen={true}
        />
    );
}
