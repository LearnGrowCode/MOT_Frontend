import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import EditCollectionRecordModal from "@/components/screens/collect-book/EditCollectionRecordModal";
import { getCollectionRecordById, updateCollectionRecord } from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/modules/book.module";

export default function CollectEditScreen() {
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

    const handleSave = async (updatedRecord: CollectionRecord, options?: { deleteSettlementIds?: string[] }) => {
        try {
            await updateCollectionRecord(updatedRecord, options);
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
        <EditCollectionRecordModal
            record={record}
            onClose={handleClose}
            onSaveRecord={handleSave}
            isScreen={true}
        />
    );
}
