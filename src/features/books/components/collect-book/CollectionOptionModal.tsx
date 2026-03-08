import React from "react";
import { CollectionRecord } from "@/features/books/types";
import RecordOptionModal from "@/shared/components/common/modals/RecordOptionModal";

interface CollectionOptionModalProps {
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    record: CollectionRecord | null;
}

export default function CollectionOptionModal({
    onClose,
    onEdit,
    onDelete,
    record,
}: CollectionOptionModalProps) {
    return (
        <RecordOptionModal
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
        />
    );
}
