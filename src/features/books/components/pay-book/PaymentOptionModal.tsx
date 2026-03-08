import React from "react";
import { PaymentRecord } from "@/features/books/types";
import RecordOptionModal from "@/shared/components/common/modals/RecordOptionModal";

interface PaymentOptionModalProps {
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: PaymentRecord | null;
}

export default function PaymentOptionModal({
    onClose,
    onEdit,
    onDelete,
    record,
}: PaymentOptionModalProps) {
    return (
        <RecordOptionModal
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
        />
    );
}
