import React from "react";
import { CollectionRecord } from "@/modules/book.module";
import RecordOptionModal from "@/components/shared/modals/RecordOptionModal";
import SendReminderCard from "@/components/shared/modals/components/SendReminderCard";

interface CollectionOptionModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSendReminder: () => void;
    record: CollectionRecord | null;
}

export default function CollectionOptionModal({
    visible,
    onClose,
    onEdit,
    onDelete,
    onSendReminder,
    record,
}: CollectionOptionModalProps) {
    const handleSendReminder = () => {
        onSendReminder();
        onClose();
    };

    return (
        <RecordOptionModal
            visible={visible}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
            extraActions={<SendReminderCard onPress={handleSendReminder} />}
        />
    );
}
