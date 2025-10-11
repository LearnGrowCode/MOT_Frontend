export interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
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
    status: "unpaid" | "paid" | "partial";
    remaining: number;
    avatar?: string | null;
}
