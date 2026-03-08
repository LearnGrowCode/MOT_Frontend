import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CollectionOptionModal from "@/features/books/components/collect-book/CollectionOptionModal";
import { getCollectionRecordById } from "@/features/books/api/book-entry.service";
import { CollectionRecord } from "@/features/books/types";
import { ActivityIndicator, View } from "react-native";

export default function CollectBookOptionsScreen() {
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
                pathname: "/(screen)/collect-book/edit-record",
                params: { id: record.id },
            } as any);
        }
    };

    const handleDelete = () => {
        if (record) {
            router.push({
                pathname: "/(screen)/collect-book/delete",
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
            record={record}
        />
    );
}
