export enum RecordType {
    COLLECT = "collect",
    PAY = "pay",
}

export type Status = "unpaid" | "paid" | "partial" | "overdue" | "collected";

export interface TransactionRecord {
    id: string;
    amount: number;
    date: string;
    type: "income" | "expense";
    purpose: string;
}

export interface BaseBookRecord {
    id: string;
    name: string;
    amount: number;
    category: string;
    purpose?: string | null;
    status: Status;
    remaining: number;
    avatar: string | null;
    dueDate?: number | null;
    reminderInterval?: string | null;
    notificationsEnabled?: boolean;
    notificationId?: string | null;
    trx_history: TransactionRecord[];
}

export interface PaymentRecord extends BaseBookRecord {
    borrowedDate: string;
}

export interface CollectionRecord extends BaseBookRecord {
    lentDate: string;
}

export interface BookEntry {
    id: string;
    counterparty: string;
    principalAmount: number;
    date: string;
    category: string;
    status: Status;
    remainingAmount: number;
    settlementAmount: number;
    interestAmount: number;
    currency: string;
    mobileNumber?: string;
    dueDate?: number | null;
    reminderInterval?: string | null;
    notificationsEnabled?: boolean;
}
