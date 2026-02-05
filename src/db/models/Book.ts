import { getDb, nowTs } from "@/db";
import {
  cancelNotification,
  schedulePaymentReminder,
} from "@/services/notification-service";
import { uuidv4 } from "@/utils/uuid";

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
  notificationId?: string | null;
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
  >,
): Promise<string> {
  const db = await getDb();
  const ts = nowTs();
  const id = uuidv4(); // Generate UUID for the book entry
  const remaining = entry.principalAmount;
  const status: BookEntryStatus = remaining === 0 ? "SETTLED" : "PENDING";

  // Validate date is a valid number
  if (!entry.date || isNaN(entry.date) || entry.date <= 0) {
    throw new Error(
      `Invalid date: ${entry.date}. Date must be a valid timestamp.`,
    );
  }

  await db.runAsync(
    `INSERT INTO book_entries (
            id, type, user_id, counterparty, date, description,
            principal_amount, remaining_amount, settlement_amount, interest_amount,
            currency, mobile_number, status, remote_id, notification_id, created_at, updated_at, deleted_at, is_dirty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
      null, // notification_id initially null
      ts,
      ts,
      null,
      1,
    ],
  );

  // Schedule notification and store its ID
  try {
    const fullEntry = await getBookEntry(id);
    if (fullEntry) {
      const notificationId = await schedulePaymentReminder(fullEntry);
      if (notificationId) {
        await db.runAsync(
          `UPDATE book_entries SET notification_id = ? WHERE id = ?;`,
          [notificationId, id],
        );
      }
    }
  } catch (error) {
    console.error("Failed to schedule notification:", error);
  }

  return id; // Return the generated UUID
}

export async function getBookEntry(id: string): Promise<BookEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM book_entries WHERE id = ? AND (deleted_at IS NULL);`,
    [id],
  );
  if (!row) return null;
  return mapBookRow(row);
}

export async function listBookEntries(userId: string): Promise<BookEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM book_entries WHERE user_id = ? AND (deleted_at IS NULL) ORDER BY date DESC;`,
    [userId],
  );
  return rows.map(mapBookRow);
}

export async function softDeleteBookEntry(id: string): Promise<void> {
  const db = await getDb();
  const ts = nowTs();

  const entry = await getBookEntry(id);
  if (entry?.notificationId) {
    try {
      await cancelNotification(entry.notificationId);
    } catch {
      // ignore
    }
  }

  await db.runAsync(
    `UPDATE book_entries SET deleted_at = ?, notification_id = NULL, is_dirty = 1, updated_at = ? WHERE id = ?;`,
    [ts, ts, id],
  );
}

export async function addSettlement(
  s: Omit<Settlement, "createdAt" | "updatedAt" | "deletedAt" | "isDirty">,
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
      ],
    );

    // load book
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM book_entries WHERE id = ?;`,
      [s.bookEntryId],
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
    if (remaining === 0) {
      status = "SETTLED";
      // Cancel notification if it exists
      if (row.notification_id) {
        try {
          await cancelNotification(row.notification_id);
        } catch {
          // ignore error
        }
      }
    } else if (remaining < Number(row.principal_amount)) {
      status = "PARTIALLY_SETTLED";
    }

    await db.runAsync(
      `UPDATE book_entries
             SET remaining_amount = ?, settlement_amount = ?, interest_amount = ?, status = ?, notification_id = ?, is_dirty = 1, updated_at = ?
             WHERE id = ?;`,
      [
        remaining,
        settlement,
        interest,
        status,
        status === "SETTLED" ? null : row.notification_id,
        ts,
        s.bookEntryId,
      ],
    );
  });
}

export async function deleteSettlement(settlementId: string): Promise<void> {
  const db = await getDb();
  const ts = nowTs();

  await db.withTransactionAsync(async () => {
    const settlement = await db.getFirstAsync<any>(
      `SELECT * FROM settlements WHERE id = ? AND (deleted_at IS NULL OR deleted_at = 0);`,
      [settlementId],
    );
    if (!settlement) return;

    await db.runAsync(
      `UPDATE settlements
             SET deleted_at = ?, updated_at = ?, is_dirty = 1
             WHERE id = ?;`,
      [ts, ts, settlementId],
    );

    const bookRow = await db.getFirstAsync<any>(
      `SELECT principal_amount, settlement_amount
             FROM book_entries
             WHERE id = ?;`,
      [settlement.book_entry_id],
    );

    if (!bookRow) return;

    const principal = Number(bookRow.principal_amount) || 0;
    let settlementTotal = Math.max(
      0,
      Number(bookRow.settlement_amount) - Number(settlement.amount),
    );
    const interest =
      settlementTotal > principal ? settlementTotal - principal : 0;
    const remaining = Math.max(0, principal - settlementTotal);

    let status: BookEntryStatus = "PENDING";
    if (remaining === 0) status = "SETTLED";
    else if (remaining < principal) status = "PARTIALLY_SETTLED";

    await db.runAsync(
      `UPDATE book_entries
             SET remaining_amount = ?, settlement_amount = ?, interest_amount = ?, status = ?, is_dirty = 1, updated_at = ?
             WHERE id = ?;`,
      [
        remaining,
        settlementTotal,
        interest,
        status,
        ts,
        settlement.book_entry_id,
      ],
    );

    // If it's no longer settled, we might want to re-schedule notification
    if (status !== "SETTLED") {
      try {
        const fullEntry = await getBookEntry(settlement.book_entry_id);
        if (fullEntry && !fullEntry.notificationId) {
          const notificationId = await schedulePaymentReminder(fullEntry);
          if (notificationId) {
            await db.runAsync(
              `UPDATE book_entries SET notification_id = ? WHERE id = ?;`,
              [notificationId, settlement.book_entry_id],
            );
          }
        }
      } catch (error) {
        console.error("Failed to re-schedule notification after settlement deletion:", error);
      }
    }
  });
}

export async function getSettlements(
  bookEntryId: string,
): Promise<Settlement[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM settlements WHERE book_entry_id = ? AND (deleted_at IS NULL) ORDER BY date DESC;`,
    [bookEntryId],
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
      }) as Settlement,
  );
}

export async function updateBookEntryBasic(params: {
  id: string;
  counterparty?: string;
  principalAmount?: number;
  remainingAmount?: number;
  currency?: string;
  description?: string | null;
}): Promise<void> {
  const db = await getDb();
  const ts = nowTs();
  const updates: string[] = [];
  const values: any[] = [];

  if (params.counterparty !== undefined) {
    updates.push("counterparty = ?");
    values.push(params.counterparty);
  }
  if (params.principalAmount !== undefined) {
    updates.push("principal_amount = ?");
    values.push(params.principalAmount);
  }
  if (params.remainingAmount !== undefined) {
    updates.push("remaining_amount = ?");
    values.push(params.remainingAmount);
  }
  if (params.currency !== undefined) {
    updates.push("currency = ?");
    values.push(params.currency);
  }
  if (params.description !== undefined) {
    updates.push("description = ?");
    values.push(params.description);
  }

  // Update status if principal/remaining change
  if (
    params.principalAmount !== undefined ||
    params.remainingAmount !== undefined
  ) {
    updates.push("status = ?");
    let status: BookEntryStatus = "PENDING";
    const principal = params.principalAmount ?? null;
    const remaining = params.remainingAmount ?? null;
    if (remaining === 0) {
      status = "SETTLED";
      // Cancel notification if settled
      try {
        const entry = await getBookEntry(params.id);
        if (entry?.notificationId) {
          await cancelNotification(entry.notificationId);
          updates.push("notification_id = ?");
          values.push(null);
        }
      } catch {
        // ignore
      }
    } else if (remaining !== null && principal !== null && remaining < principal) {
      status = "PARTIALLY_SETTLED";
    }
    values.push(status);
  }

  updates.push("is_dirty = 1");
  updates.push("updated_at = ?");
  values.push(ts);

  if (updates.length === 0) return;
  const sql = `UPDATE book_entries SET ${updates.join(", ")} WHERE id = ?;`;
  values.push(params.id);
  await db.runAsync(sql, values);
}

export async function updateBookEntryWithPrincipal(params: {
  id: string;
  principalAmount: number;
  counterparty?: string;
  currency?: string;
  description?: string | null;
}): Promise<void> {
  const db = await getDb();
  const ts = nowTs();

  const row = await db.getFirstAsync<any>(
    `SELECT principal_amount, settlement_amount FROM book_entries WHERE id = ?;`,
    [params.id],
  );
  if (!row) return;

  const settledSoFar = Number(row.settlement_amount) || 0;
  const newPrincipal = Number(params.principalAmount) || 0;
  const newRemaining = Math.max(0, newPrincipal - settledSoFar);

  let status: BookEntryStatus = "PENDING";
  if (newRemaining === 0) status = "SETTLED";
  else if (newRemaining < newPrincipal) status = "PARTIALLY_SETTLED";

  const updates: string[] = [
    "principal_amount = ?",
    "remaining_amount = ?",
    "status = ?",
    "is_dirty = 1",
    "updated_at = ?",
  ];
  const values: any[] = [newPrincipal, newRemaining, status, ts];

  if (params.counterparty !== undefined) {
    updates.unshift("counterparty = ?");
    values.unshift(params.counterparty);
  }
  if (params.currency !== undefined) {
    updates.unshift("currency = ?");
    values.unshift(params.currency);
  }
  if (params.description !== undefined) {
    updates.unshift("description = ?");
    values.unshift(params.description);
  }

  const sql = `UPDATE book_entries SET ${updates.join(", ")} WHERE id = ?;`;
  values.push(params.id);
  await db.runAsync(sql, values);

  // Re-schedule notification
  try {
    const fullEntry = await getBookEntry(params.id);
    if (fullEntry) {
      const notificationId = await schedulePaymentReminder(fullEntry);
      if (notificationId) {
        await db.runAsync(
          `UPDATE book_entries SET notification_id = ? WHERE id = ?;`,
          [notificationId, params.id],
        );
      }
    }
  } catch (error) {
    console.error("Failed to re-schedule notification:", error);
  }
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
    notificationId: r.notification_id ?? null,
  } as BookEntry;
}
