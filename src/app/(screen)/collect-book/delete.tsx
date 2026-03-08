import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DeleteCollectionRecordModal from "@/features/books/components/collect-book/DeleteCollectionRecordModal";
import { getCollectionRecordById } from "@/features/books/api/book-entry.service";
import { CollectionRecord } from "@/features/books/types";
import { softDeleteBookEntry } from "@/db/models/Book";

export default function CollectBookDeleteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<CollectionRecord | null>(null);

    useEffect(() => {
        if (id) {
            getCollectionRecordById(id).then(setRecord);
        }
    }, [id]);

    const handleConfirmDelete = async (recordId: string) => {
        await softDeleteBookEntry(recordId);
        router.dismissAll();
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <DeleteCollectionRecordModal
            onClose={handleClose}
            onDeleteRecord={handleConfirmDelete}
            record={record}
        />
    );
}
