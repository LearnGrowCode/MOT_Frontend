import React from "react";
import { CollectionRecord } from "@/features/books/types";
import TransactionConfirmation from "@/shared/components/common/modals/TransactionConfirmation";

interface CollectionConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirmCollection: (amount: number, collector: string) => void;
    record: CollectionRecord | null;
}

export default function CollectionConfirmation({
    visible,
    onClose,
    onConfirmCollection,
    record,
}: CollectionConfirmationProps) {
    return (
        <TransactionConfirmation
            visible={visible}
            onClose={onClose}
            onConfirm={onConfirmCollection}
            record={record}
            type='collection'
        />
    );
}
