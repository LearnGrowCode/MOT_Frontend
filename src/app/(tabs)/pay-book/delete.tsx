import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DeletePaymentRecordModal from "@/components/screens/pay-book/DeletePaymentRecordModal";
import { getPayRecordById } from "@/services/book/book-entry.service";
import { PaymentRecord } from "@/modules/book.module";
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
            isScreen={true}
        />
    );
}
