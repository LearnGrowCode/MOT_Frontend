import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DeleteCollectionRecordModal from "@/components/screens/collect-book/DeleteCollectionRecordModal";
import { getCollectionRecordById, deleteCollectionRecord } from "@/services/book/book-entry.service";
import { CollectionRecord } from "@/modules/book.module";
import { ActivityIndicator, View } from "react-native";

export default function CollectDeleteScreen() {
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

    const handleDelete = async (recordId: string) => {
        try {
            await deleteCollectionRecord(recordId);
            router.dismissAll();
            router.push("/collect-book");
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
        <DeleteCollectionRecordModal
            onClose={handleClose}
            onDeleteRecord={handleDelete}
            record={record}
            isScreen={true}
        />
    );
}
