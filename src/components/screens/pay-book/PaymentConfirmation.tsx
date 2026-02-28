import React from "react";
import { PaymentRecord } from "@/modules/book.module";
import TransactionConfirmation from "@/components/shared/modals/TransactionConfirmation";

interface PaymentConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirmPayment: (amount: number, payer: string) => void;
    record: PaymentRecord | null;
}

export default function PaymentConfirmation({
    visible,
    onClose,
    onConfirmPayment,
    record,
}: PaymentConfirmationProps) {
    return (
        <TransactionConfirmation
            visible={visible}
            onClose={onClose}
            onConfirm={onConfirmPayment}
            record={record}
            type='payment'
        />
    );
}
