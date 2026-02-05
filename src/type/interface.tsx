export interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export enum RecordType {
    COLLECT = "collect",
    PAY = "pay",
}

export interface SignInFormData {
    email: string;
    password: string;
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

export type Status = "unpaid" | "paid" | "partial" | "overdue" | "collected";

/**
 * Common base interface for book entry records (Payment and Collection)
 * Contains all shared fields between PaymentRecord and CollectionRecord
 */
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
    trx_history: TransactionRecord[];
}

/**
 * Payment record interface for Pay Book entries
 * Extends BaseBookRecord with borrowedDate field
 */
export interface PaymentRecord extends BaseBookRecord {
    borrowedDate: string;
}

/**
 * Collection record interface for Collect Book entries
 * Extends BaseBookRecord with lentDate field
 */
export interface CollectionRecord extends BaseBookRecord {
    lentDate: string;
}

export interface TransactionRecord {
    id: string;
    amount: number;
    date: string;
    type: "income" | "expense";
    purpose: string;
}

export interface Option {
    label: string;
    value: string;
}

export interface SimpleContact {
    id: string;
    name: string;
    phone: string | null;
    searchName?: string;
    searchPhone?: string;
}
