import { getDb } from "@/db";
import {
    RecordType,
    PaymentRecord,
    Status,
    TransactionRecord,
} from "@/type/interface";
import { getSettlements } from "@/db/models/Book";

type DbBookEntry = {
    id: string;
    type: string; // "collect" | "pay"
    user_id: string;
    counterparty: string;
    date: number;
    description: string | null;
    principal_amount: number;
    remaining_amount: number;
    settlement_amount: number;
    interest_amount: number;
    currency: string;
    mobile_number: string | null;
    status: string; // matches Status
    created_at: number | null;
    updated_at: number | null;
};

async function mapDbToPaymentRecord(row: DbBookEntry): Promise<PaymentRecord> {
    // Map database status to PaymentRecord status
    let status: Status = "unpaid";
    if (row.status === "SETTLED") {
        status = "paid";
    } else if (row.status === "PARTIALLY_SETTLED") {
        status = "partial";
    } else if (row.status === "PENDING") {
        status = "unpaid";
    }

    // Fetch settlements (payment history) for this book entry
    const settlements = await getSettlements(row.id);
    const trx_history: TransactionRecord[] = settlements.map((settlement) => ({
        id: settlement.id,
        amount: settlement.amount,
        date: new Date(settlement.date).toISOString(),
        type: "expense" as const, // Payments are expenses
        purpose: settlement.description || "Payment",
    }));

    return {
        id: row.id,
        name: row.counterparty,
        amount: row.principal_amount,
        borrowedDate: new Date(row.date).toISOString(),
        category: row.currency,
        status,
        remaining: row.remaining_amount ?? 0,
        avatar: null,
        trx_history,
    };
}

export async function getPayBookEntries(): Promise<PaymentRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<DbBookEntry>(
        `SELECT * FROM book_entries WHERE UPPER(type) = UPPER(?) AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY date DESC;`,
        [RecordType.PAY]
    );
    // Map each row and fetch settlements (async)
    return Promise.all(rows.map(mapDbToPaymentRecord));
}

export async function getTotalPayRemaining(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(remaining_amount), 0) as total FROM book_entries WHERE UPPER(type) = UPPER(?) AND (deleted_at IS NULL OR deleted_at = 0);`,
        [RecordType.PAY]
    );
    return row?.total ?? 0;
}
