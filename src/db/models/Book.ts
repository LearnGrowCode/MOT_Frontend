import { getDb, nowTs } from "../index";
import { uuidv4 } from "../../utils/uuid";

export type BookEntryType = "PAY" | "COLLECT";
export type BookEntryStatus = "PENDING" | "PARTIALLY_SETTLED" | "SETTLED";

export interface BookEntry {
    id: string;
    type: BookEntryType;
    userId: string;
    counterparty: string;
    date: number; // epoch ms
    description?: string;
    principalAmount: number;
    remainingAmount: number;
    settlementAmount: number;
    interestAmount: number;
    currency: string; // 3-letter
    mobileNumber?: string;
    status: BookEntryStatus;
    remoteId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number | null;
    isDirty?: 0 | 1;
}

export interface Settlement {
    id: string;
    bookEntryId: string;
    amount: number;
    date: number; // epoch ms
    description?: string;
    remoteId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number | null;
    isDirty?: 0 | 1;
}

export async function createBookEntry(
    entry: Omit<
        BookEntry,
        | "id"
        | "remainingAmount"
        | "settlementAmount"
        | "interestAmount"
        | "status"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "isDirty"
    >
): Promise<string> {
    const db = await getDb();
    const ts = nowTs();
    const id = uuidv4(); // Generate UUID for the book entry
    const remaining = entry.principalAmount;
    const status: BookEntryStatus = remaining === 0 ? "SETTLED" : "PENDING";

    // Validate date is a valid number
    if (!entry.date || isNaN(entry.date) || entry.date <= 0) {
        throw new Error(
            `Invalid date: ${entry.date}. Date must be a valid timestamp.`
        );
    }

    await db.runAsync(
        `INSERT INTO book_entries (
            id, type, user_id, counterparty, date, description,
            principal_amount, remaining_amount, settlement_amount, interest_amount,
            currency, mobile_number, status, remote_id, created_at, updated_at, deleted_at, is_dirty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            id,
            entry.type,
            entry.userId,
            entry.counterparty,
            entry.date,
            entry.description ?? null,
            entry.principalAmount,
            remaining,
            0,
            0,
            entry.currency,
            entry.mobileNumber ?? null,
            status,
            entry.remoteId ?? null,
            ts,
            ts,
            null,
            1,
        ]
    );
    return id; // Return the generated UUID
}

export async function getBookEntry(id: string): Promise<BookEntry | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
        `SELECT * FROM book_entries WHERE id = ? AND (deleted_at IS NULL);`,
        [id]
    );
    if (!row) return null;
    return mapBookRow(row);
}

export async function listBookEntries(userId: string): Promise<BookEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
        `SELECT * FROM book_entries WHERE user_id = ? AND (deleted_at IS NULL) ORDER BY date DESC;`,
        [userId]
    );
    return rows.map(mapBookRow);
}

export async function softDeleteBookEntry(id: string): Promise<void> {
    const db = await getDb();
    const ts = nowTs();
    await db.runAsync(
        `UPDATE book_entries SET deleted_at = ?, is_dirty = 1, updated_at = ? WHERE id = ?;`,
        [ts, ts, id]
    );
}

export async function addSettlement(
    s: Omit<Settlement, "createdAt" | "updatedAt" | "deletedAt" | "isDirty">
): Promise<void> {
    const db = await getDb();
    const ts = nowTs();
    await db.withTransactionAsync(async () => {
        // insert settlement
        await db.runAsync(
            `INSERT INTO settlements (
                id, book_entry_id, amount, date, description, remote_id, created_at, updated_at, deleted_at, is_dirty
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                s.id,
                s.bookEntryId,
                s.amount,
                s.date,
                s.description ?? null,
                s.remoteId ?? null,
                ts,
                ts,
                null,
                1,
            ]
        );

        // load book
        const row = await db.getFirstAsync<any>(
            `SELECT * FROM book_entries WHERE id = ?;`,
            [s.bookEntryId]
        );
        if (!row) return; // should not happen

        let remaining = Number(row.remaining_amount) - s.amount;
        let settlement = Number(row.settlement_amount) + s.amount;
        let interest = Number(row.interest_amount);
        if (remaining < 0) {
            interest += Math.abs(remaining);
            remaining = 0;
        }
        let status: BookEntryStatus = "PENDING";
        if (remaining === 0) status = "SETTLED";
        else if (remaining < Number(row.principal_amount))
            status = "PARTIALLY_SETTLED";

        await db.runAsync(
            `UPDATE book_entries
             SET remaining_amount = ?, settlement_amount = ?, interest_amount = ?, status = ?, is_dirty = 1, updated_at = ?
             WHERE id = ?;`,
            [remaining, settlement, interest, status, ts, s.bookEntryId]
        );
    });
}

export async function getSettlements(
    bookEntryId: string
): Promise<Settlement[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
        `SELECT * FROM settlements WHERE book_entry_id = ? AND (deleted_at IS NULL) ORDER BY date DESC;`,
        [bookEntryId]
    );
    return rows.map(
        (r: any) =>
            ({
                id: r.id,
                bookEntryId: r.book_entry_id,
                amount: Number(r.amount),
                date: Number(r.date),
                description: r.description ?? undefined,
                remoteId: r.remote_id ?? undefined,
                createdAt: r.created_at ?? undefined,
                updatedAt: r.updated_at ?? undefined,
                deletedAt: r.deleted_at ?? undefined,
                isDirty: r.is_dirty ?? 0,
            }) as Settlement
    );
}

function mapBookRow(r: any): BookEntry {
    return {
        id: r.id,
        type: r.type,
        userId: r.user_id,
        counterparty: r.counterparty,
        date: Number(r.date),
        description: r.description ?? undefined,
        principalAmount: Number(r.principal_amount),
        remainingAmount: Number(r.remaining_amount),
        settlementAmount: Number(r.settlement_amount),
        interestAmount: Number(r.interest_amount),
        currency: r.currency,
        mobileNumber: r.mobile_number ?? undefined,
        status: r.status,
        remoteId: r.remote_id ?? undefined,
        createdAt: r.created_at ?? undefined,
        updatedAt: r.updated_at ?? undefined,
        deletedAt: r.deleted_at ?? undefined,
        isDirty: r.is_dirty ?? 0,
    } as BookEntry;
}
