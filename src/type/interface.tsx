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

export interface PaymentRecord {
    id: string;
    name: string;
    amount: number;
    borrowedDate: string;
    category: string;
    status: Status;
    remaining: number;
    avatar?: string | null;
    trx_history?: TransactionRecord[];
}

export interface CollectionRecord {
    id: string;
    name: string;
    amount: number;
    lentDate: string;
    category: string;
    status: Status;
    remaining: number;
    avatar?: string | null;
    trx_history?: TransactionRecord[];
}

export type Status = "unpaid" | "paid" | "partial" | "overdue" | "collected";

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
