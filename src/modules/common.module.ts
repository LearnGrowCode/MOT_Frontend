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
