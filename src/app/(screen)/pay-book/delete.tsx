import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DeletePaymentRecordModal from "@/features/books/components/pay-book/DeletePaymentRecordModal";
import { getPayRecordById } from "@/features/books/api/book-entry.service";
import { PaymentRecord } from "@/features/books/types";
import { softDeleteBookEntry } from "@/db/models/Book";

export default function PayBookDeleteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<PaymentRecord | null>(null);

    useEffect(() => {
        if (id) {
            getPayRecordById(id).then(setRecord);
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
        <DeletePaymentRecordModal
            onClose={handleClose}
            onDeleteRecord={handleConfirmDelete}
            record={record}
        />
    );
}
