import { getSettlements } from "@/db/models/Book";
import { getDb } from "@/db";
import {
    RecordType,
    PaymentRecord,
    CollectionRecord,
    Status,
    TransactionRecord,
} from "@/type/interface";

type DbBookEntry = {
    id: string;
    type: string;
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
    status: string;
    created_at: number | null;
    updated_at: number | null;
    due_date: number | null;
    reminder_interval: string | null;
    notifications_enabled: number;
};

async function mapDbToPaymentRecord(row: DbBookEntry): Promise<PaymentRecord> {
    let status: Status = "unpaid";

    if (row.status === "SETTLED") {
        status = "paid";
    } else if (row.status === "PARTIALLY_SETTLED") {
        status = "partial";
    }

    const settlements = await getSettlements(row.id);
    const trx_history: TransactionRecord[] = settlements.map((settlement) => ({
        id: settlement.id,
        amount: settlement.amount,
        date: new Date(settlement.date).toISOString(),
        type: "expense",
        purpose: settlement.description || "Payment",
    }));

    return {
        id: row.id,
        name: row.counterparty,
        amount: row.principal_amount,
        borrowedDate: new Date(row.date).toISOString(),
        category: row.currency,
        purpose: row.description,
        status,
        remaining: row.remaining_amount ?? 0,
        avatar: null,
        dueDate: row.due_date,
        reminderInterval: row.reminder_interval,
        notificationsEnabled: row.notifications_enabled !== 0,
        trx_history,
    };
}

async function mapDbToCollectionRecord(
    row: DbBookEntry
): Promise<CollectionRecord> {
    let status: Status = "unpaid";

    if (row.status === "SETTLED") {
        status = "collected";
    } else if (row.status === "PARTIALLY_SETTLED") {
        status = "partial";
    }

    const settlements = await getSettlements(row.id);
    const trx_history: TransactionRecord[] = settlements.map((settlement) => ({
        id: settlement.id,
        amount: settlement.amount,
        date: new Date(settlement.date).toISOString(),
        type: "income",
        purpose: settlement.description || "Collection",
    }));

    return {
        id: row.id,
        name: row.counterparty,
        amount: row.principal_amount,
        lentDate: new Date(row.date).toISOString(),
        category: row.currency,
        purpose: row.description,
        status,
        remaining: row.remaining_amount ?? 0,
        avatar: null,
        dueDate: row.due_date,
        reminderInterval: row.reminder_interval,
        notificationsEnabled: row.notifications_enabled !== 0,
        trx_history,
    };
}

export async function getPayBookEntries(): Promise<PaymentRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<DbBookEntry>(
        `SELECT * FROM book_entries WHERE UPPER(type) = UPPER(?) AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY date DESC;`,
        [RecordType.PAY]
    );

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

export async function getCollectBookEntries(): Promise<CollectionRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<DbBookEntry>(
        `SELECT * FROM book_entries WHERE UPPER(type) = UPPER(?) AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY date DESC;`,
        [RecordType.COLLECT]
    );

    return Promise.all(rows.map(mapDbToCollectionRecord));
}

export async function getTotalCollectRemaining(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(remaining_amount), 0) as total FROM book_entries WHERE UPPER(type) = UPPER(?) AND (deleted_at IS NULL OR deleted_at = 0);`,
        [RecordType.COLLECT]
    );

    return row?.total ?? 0;
}
