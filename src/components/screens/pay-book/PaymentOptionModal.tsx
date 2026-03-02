import React from "react";
import { PaymentRecord } from "@/modules/book.module";
import RecordOptionModal from "@/components/shared/modals/RecordOptionModal";

interface PaymentOptionModalProps {
    visible?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: PaymentRecord | null;
    isScreen?: boolean;
}

export default function PaymentOptionModal({
    visible,
    onClose,
    onEdit,
    onDelete,
    record,
    isScreen = false,
}: PaymentOptionModalProps) {
    return (
        <RecordOptionModal
            visible={visible}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
            isScreen={isScreen}
        />
    );
}
