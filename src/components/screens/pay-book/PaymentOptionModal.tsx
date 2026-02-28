import React from "react";
import { PaymentRecord } from "@/modules/book.module";
import RecordOptionModal from "@/components/shared/modals/RecordOptionModal";

interface PaymentOptionModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: PaymentRecord | null;
}

export default function PaymentOptionModal({
    visible,
    onClose,
    onEdit,
    onDelete,
    record,
}: PaymentOptionModalProps) {
    return (
        <RecordOptionModal
            visible={visible}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
        />
    );
}
