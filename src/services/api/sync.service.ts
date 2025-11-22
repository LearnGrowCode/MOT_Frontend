import { http } from "./client";
import * as SecureStore from "expo-secure-store";
import { getDb } from "@/db";
import { DEFAULT_USER_ID } from "@/utils/constants";

export type SyncBookEntryUpsert = {
    client_id: string;
    type?: "PAY" | "COLLECT";
    counterparty?: string;
    date?: string;
    description?: string | null;
    principal_amount?: string | number;
    remaining_amount?: string | number;
    settlement_amount?: string | number;
    interest_amount?: string | number;
    currency?: string;
    mobile_number?: string | null;
    status?: string;
    client_updated_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type SyncBookEntryDelete =
    | {
          client_id: string;
          client_updated_at?: string;
      }
    | string;

export type SyncSettlementUpsert = {
    client_id: string;
    book_entry_id: string;
    amount?: string | number;
    date?: string;
    description?: string | null;
    client_updated_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type SyncSettlementDelete =
    | {
          client_id: string;
          client_updated_at?: string;
      }
    | string;

export type SyncTablePayload = {
    upserts?: (SyncBookEntryUpsert | SyncSettlementUpsert)[];
    deletes?: (SyncBookEntryDelete | SyncSettlementDelete)[];
};

export type SyncPushRequest = {
    device_id?: string;
    request_id?: string;
    tables?: {
        pay_book?: SyncTablePayload;
        collect_book?: SyncTablePayload;
        settlements?: SyncTablePayload;
        [table: string]: SyncTablePayload | undefined;
    };
};

export type SyncPushResponse = {
    server_time: string;
    conflicts: Record<string, unknown>[];
    processed_ids: string[];
    status?: string;
};

export type SyncPullCursor =
    | string
    | {
          pay_book?: string | null;
          collect_book?: string | null;
          settlements?: string | null;
          [table: string]: string | null | undefined;
      };

export type SyncPullRequest = {
    since?: string | null;
    cursor?: SyncPullCursor;
    limit?: number;
};

export type SyncPullResponse = {
    server_time: string;
    tables: {
        pay_book: Required<SyncTablePayload>;
        collect_book: Required<SyncTablePayload>;
        [table: string]: Required<SyncTablePayload>;
    };
    next_cursor: {
        pay_book?: string | null;
        collect_book?: string | null;
        [table: string]: string | null | undefined;
    } | null;
};

/**
 * Builds sync payload from local database entries that need to be synced
 * Includes entries with is_dirty = 1 (for upserts) and deleted_at IS NOT NULL (for deletes)
 */
export async function buildSyncTablesFromLocal(
    userId: string = DEFAULT_USER_ID
): Promise<{
    pay_book: Required<SyncTablePayload>;
    collect_book: Required<SyncTablePayload>;
    settlements: Required<SyncTablePayload>;
}> {
    const db = await getDb();

    // Query all book entries that need syncing (dirty or deleted)
    const bookRows = await db.getAllAsync<any>(
        `SELECT * FROM book_entries 
         WHERE user_id = ? 
         AND (is_dirty = 1 OR deleted_at IS NOT NULL)
         ORDER BY updated_at ASC;`,
        [userId]
    );

    // Query all settlements that need syncing (dirty or deleted)
    const settlementRows = await db.getAllAsync<any>(
        `SELECT s.* FROM settlements s
         INNER JOIN book_entries be ON s.book_entry_id = be.id
         WHERE be.user_id = ? 
         AND (s.is_dirty = 1 OR s.deleted_at IS NOT NULL)
         ORDER BY s.updated_at ASC;`,
        [userId]
    );

    const payUpserts: SyncBookEntryUpsert[] = [];
    const payDeletes: SyncBookEntryDelete[] = [];
    const collectUpserts: SyncBookEntryUpsert[] = [];
    const collectDeletes: SyncBookEntryDelete[] = [];
    const settlementUpserts: SyncSettlementUpsert[] = [];
    const settlementDeletes: SyncSettlementDelete[] = [];

    // Process book entries
    for (const row of bookRows) {
        const isDeleted = row.deleted_at != null;
        const entry: SyncBookEntryUpsert | SyncBookEntryDelete = isDeleted
            ? {
                  client_id: row.id,
                  client_updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
              }
            : {
                  client_id: row.id,
                  type: row.type as "PAY" | "COLLECT",
                  counterparty: row.counterparty,
                  date: row.date ? new Date(row.date).toISOString() : undefined,
                  description: row.description ?? null,
                  principal_amount: row.principal_amount,
                  remaining_amount: row.remaining_amount,
                  settlement_amount: row.settlement_amount,
                  interest_amount: row.interest_amount,
                  currency: row.currency,
                  mobile_number: row.mobile_number ?? null,
                  status: row.status,
                  client_updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
                  updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
                  deleted_at: row.deleted_at
                      ? new Date(row.deleted_at).toISOString()
                      : null,
              };

        if (row.type === "PAY") {
            if (isDeleted) {
                payDeletes.push(entry as SyncBookEntryDelete);
            } else {
                payUpserts.push(entry as SyncBookEntryUpsert);
            }
        } else if (row.type === "COLLECT") {
            if (isDeleted) {
                collectDeletes.push(entry as SyncBookEntryDelete);
            } else {
                collectUpserts.push(entry as SyncBookEntryUpsert);
            }
        }
    }

    // Process settlements
    for (const row of settlementRows) {
        const isDeleted = row.deleted_at != null;
        const entry: SyncSettlementUpsert | SyncSettlementDelete = isDeleted
            ? {
                  client_id: row.id,
                  client_updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
              }
            : {
                  client_id: row.id,
                  book_entry_id: row.book_entry_id,
                  amount: row.amount,
                  date: row.date ? new Date(row.date).toISOString() : undefined,
                  description: row.description ?? null,
                  client_updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
                  updated_at: row.updated_at
                      ? new Date(row.updated_at).toISOString()
                      : undefined,
                  deleted_at: row.deleted_at
                      ? new Date(row.deleted_at).toISOString()
                      : null,
              };

        if (isDeleted) {
            settlementDeletes.push(entry as SyncSettlementDelete);
        } else {
            settlementUpserts.push(entry as SyncSettlementUpsert);
        }
    }

    return {
        pay_book: {
            upserts: payUpserts,
            deletes: payDeletes,
        },
        collect_book: {
            upserts: collectUpserts,
            deletes: collectDeletes,
        },
        settlements: {
            upserts: settlementUpserts,
            deletes: settlementDeletes,
        },
    };
}

export async function syncPush(
    payload: SyncPushRequest
): Promise<SyncPushResponse> {
    const token = await SecureStore.getItemAsync("token");
    return http<SyncPushResponse>("/settlement/sync/push", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
}

export async function syncPull(
    payload: SyncPullRequest = {}
): Promise<SyncPullResponse> {
    const token = await SecureStore.getItemAsync("token");
    return http<SyncPullResponse>("/settlement/sync/pull", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Applies pull response data to the local database
 * Processes upserts and deletes for pay_book, collect_book, and settlements
 */
export async function applySyncPull(
    pullResponse: SyncPullResponse,
    userId: string = DEFAULT_USER_ID
): Promise<void> {
    const db = await getDb();
    const now = Date.now();

    await db.withTransactionAsync(async () => {
        // Process pay_book and collect_book upserts
        const allBookUpserts = [
            ...(pullResponse.tables.pay_book?.upserts ?? []),
            ...(pullResponse.tables.collect_book?.upserts ?? []),
        ];

        for (const entry of allBookUpserts) {
            const clientId = entry.client_id;
            if (!clientId) continue;

            // Parse dates
            const date = entry.date ? new Date(entry.date).getTime() : now;
            const updatedAt = entry.updated_at
                ? new Date(entry.updated_at).getTime()
                : now;
            const createdAt = updatedAt; // Use updated_at as fallback for created_at
            const deletedAt = entry.deleted_at
                ? new Date(entry.deleted_at).getTime()
                : null;

            // Parse amounts
            const principalAmount = Number(entry.principal_amount ?? 0);
            const remainingAmount = Number(
                entry.remaining_amount ?? principalAmount
            );
            const settlementAmount = Number(entry.settlement_amount ?? 0);
            const interestAmount = Number(entry.interest_amount ?? 0);

            // Check if entry exists
            const existing = await db.getFirstAsync<{ id: string }>(
                `SELECT id FROM book_entries WHERE id = ?;`,
                [clientId]
            );

            const entryType =
                entry.type === "PAY" || entry.type === "COLLECT"
                    ? entry.type
                    : "PAY";
            const entryCounterparty =
                typeof entry.counterparty === "string"
                    ? entry.counterparty
                    : "";
            const entryDescription =
                typeof entry.description === "string"
                    ? entry.description
                    : entry.description === null
                      ? null
                      : "";
            const entryCurrency =
                typeof entry.currency === "string" ? entry.currency : "INR";
            const entryMobileNumber =
                typeof entry.mobile_number === "string"
                    ? entry.mobile_number
                    : entry.mobile_number === null
                      ? null
                      : "";
            const entryStatus =
                typeof entry.status === "string" ? entry.status : "PENDING";

            if (existing) {
                // Update existing entry
                await db.runAsync(
                    `UPDATE book_entries SET
                        type = ?,
                        counterparty = ?,
                        date = ?,
                        description = ?,
                        principal_amount = ?,
                        remaining_amount = ?,
                        settlement_amount = ?,
                        interest_amount = ?,
                        currency = ?,
                        mobile_number = ?,
                        status = ?,
                        updated_at = ?,
                        deleted_at = ?,
                        is_dirty = 0
                    WHERE id = ?;`,
                    [
                        entryType,
                        entryCounterparty,
                        date,
                        entryDescription,
                        principalAmount,
                        remainingAmount,
                        settlementAmount,
                        interestAmount,
                        entryCurrency,
                        entryMobileNumber,
                        entryStatus,
                        updatedAt,
                        deletedAt,
                        clientId,
                    ]
                );
            } else {
                // Insert new entry
                await db.runAsync(
                    `INSERT INTO book_entries (
                        id, type, user_id, counterparty, date, description,
                        principal_amount, remaining_amount, settlement_amount, interest_amount,
                        currency, mobile_number, status, created_at, updated_at, deleted_at, is_dirty
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        clientId,
                        entryType,
                        userId,
                        entryCounterparty,
                        date,
                        entryDescription,
                        principalAmount,
                        remainingAmount,
                        settlementAmount,
                        interestAmount,
                        entryCurrency,
                        entryMobileNumber,
                        entryStatus,
                        createdAt,
                        updatedAt,
                        deletedAt,
                        0, // is_dirty = 0 since it's from server
                    ]
                );
            }
        }

        // Process pay_book and collect_book deletes
        const allBookDeletes = [
            ...(pullResponse.tables.pay_book?.deletes ?? []),
            ...(pullResponse.tables.collect_book?.deletes ?? []),
        ];

        for (const deleteEntry of allBookDeletes) {
            const clientId =
                typeof deleteEntry === "string"
                    ? deleteEntry
                    : deleteEntry.client_id;
            if (!clientId) continue;

            const deletedAt = now;
            const updatedAt =
                typeof deleteEntry === "object" && deleteEntry.client_updated_at
                    ? new Date(deleteEntry.client_updated_at).getTime()
                    : now;

            await db.runAsync(
                `UPDATE book_entries SET
                    deleted_at = ?,
                    updated_at = ?,
                    is_dirty = 0
                WHERE id = ?;`,
                [deletedAt, updatedAt, clientId]
            );
        }

        // Process settlements upserts
        const settlementUpserts =
            pullResponse.tables.settlements?.upserts ?? [];
        for (const entry of settlementUpserts) {
            const clientId = entry.client_id;
            if (!clientId || !entry.book_entry_id) continue;

            const date = entry.date ? new Date(entry.date).getTime() : now;
            const updatedAt = entry.updated_at
                ? new Date(entry.updated_at).getTime()
                : now;
            const createdAt = updatedAt;
            const deletedAt = entry.deleted_at
                ? new Date(entry.deleted_at).getTime()
                : null;
            const amount = Number(entry.amount ?? 0);

            // Check if settlement exists
            const existing = await db.getFirstAsync<{ id: string }>(
                `SELECT id FROM settlements WHERE id = ?;`,
                [clientId]
            );

            const settlementDescription =
                typeof entry.description === "string"
                    ? entry.description
                    : entry.description === null
                      ? null
                      : "";
            const settlementBookEntryId =
                typeof entry.book_entry_id === "string"
                    ? entry.book_entry_id
                    : "";

            if (existing) {
                await db.runAsync(
                    `UPDATE settlements SET
                        book_entry_id = ?,
                        amount = ?,
                        date = ?,
                        description = ?,
                        updated_at = ?,
                        deleted_at = ?,
                        is_dirty = 0
                    WHERE id = ?;`,
                    [
                        settlementBookEntryId,
                        amount,
                        date,
                        settlementDescription,
                        updatedAt,
                        deletedAt,
                        clientId,
                    ]
                );
            } else {
                await db.runAsync(
                    `INSERT INTO settlements (
                        id, book_entry_id, amount, date, description, created_at, updated_at, deleted_at, is_dirty
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        clientId,
                        settlementBookEntryId,
                        amount,
                        date,
                        settlementDescription,
                        createdAt,
                        updatedAt,
                        deletedAt,
                        0,
                    ]
                );
            }
        }

        // Process settlements deletes
        const settlementDeletes =
            pullResponse.tables.settlements?.deletes ?? [];
        for (const deleteEntry of settlementDeletes) {
            const clientId =
                typeof deleteEntry === "string"
                    ? deleteEntry
                    : deleteEntry.client_id;
            if (!clientId) continue;

            const deletedAt = now;
            const updatedAt =
                typeof deleteEntry === "object" && deleteEntry.client_updated_at
                    ? new Date(deleteEntry.client_updated_at).getTime()
                    : now;

            await db.runAsync(
                `UPDATE settlements SET
                    deleted_at = ?,
                    updated_at = ?,
                    is_dirty = 0
                WHERE id = ?;`,
                [deletedAt, updatedAt, clientId]
            );
        }
    });
}
