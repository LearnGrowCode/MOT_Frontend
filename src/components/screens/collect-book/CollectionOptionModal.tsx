import React from "react";
import { CollectionRecord } from "@/modules/book.module";
import RecordOptionModal from "@/components/shared/modals/RecordOptionModal";
import SendReminderCard from "@/components/shared/modals/components/SendReminderCard";

interface CollectionOptionModalProps {
    visible?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSendReminder: () => void;
    record: CollectionRecord | null;
    isScreen?: boolean;
}

export default function CollectionOptionModal({
    visible,
    onClose,
    onEdit,
    onDelete,
    onSendReminder,
    record,
    isScreen = false,
}: CollectionOptionModalProps) {
    const handleSendReminder = () => {
        onSendReminder();
        if (!isScreen) onClose();
    };

    return (
        <RecordOptionModal
            visible={visible}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
            extraActions={<SendReminderCard onPress={handleSendReminder} />}
            isScreen={isScreen}
        />
    );
}
