import * as SQLite from "expo-sqlite";

export type Migration = {
    id: number;
    up: string[];
};

// Keep ordered migrations; future changes should append a new migration with +1 id
export const migrations: Migration[] = [
    {
        id: 1,
        up: [
            // metadata
            `CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY);`,

            // users
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                email TEXT UNIQUE,
                first_name TEXT,
                last_name TEXT,
                password_hash TEXT,
                is_active INTEGER DEFAULT 1,
                is_staff INTEGER DEFAULT 0,
                is_superuser INTEGER DEFAULT 0,
                last_login INTEGER,
                date_joined INTEGER,
                remote_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                deleted_at INTEGER,
                is_dirty INTEGER DEFAULT 0
            );`,

            // user preferences (one-to-one with users)
            `CREATE TABLE IF NOT EXISTS user_preferences (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                currency TEXT,
                language TEXT,
                theme TEXT,
                notifications INTEGER DEFAULT 1,
                email_notifications INTEGER DEFAULT 1,
                sms_notifications INTEGER DEFAULT 1,
                push_notifications INTEGER DEFAULT 1,
                remote_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                deleted_at INTEGER,
                is_dirty INTEGER DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );`,

            // book entries
            `CREATE TABLE IF NOT EXISTS book_entries (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                user_id TEXT NOT NULL,
                counterparty TEXT NOT NULL,
                date INTEGER NOT NULL,
                description TEXT,
                principal_amount REAL NOT NULL,
                remaining_amount REAL NOT NULL DEFAULT 0,
                settlement_amount REAL NOT NULL DEFAULT 0,
                interest_amount REAL NOT NULL DEFAULT 0,
                currency TEXT NOT NULL,
                mobile_number TEXT,
                status TEXT NOT NULL,
                remote_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                deleted_at INTEGER,
                is_dirty INTEGER DEFAULT 1,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );`,

            // settlements (many-to-one with book_entries)
            `CREATE TABLE IF NOT EXISTS settlements (
                id TEXT PRIMARY KEY,
                book_entry_id TEXT NOT NULL,
                amount REAL NOT NULL,
                date INTEGER NOT NULL,
                description TEXT,
                remote_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                deleted_at INTEGER,
                is_dirty INTEGER DEFAULT 1,
                FOREIGN KEY(book_entry_id) REFERENCES book_entries(id) ON DELETE CASCADE
            );`,
        ],
    },
    {
        id: 2,
        up: [
            // Add locale field to user_preferences for currency formatting
            `ALTER TABLE user_preferences ADD COLUMN locale TEXT;`,
        ],
    },
    {
        id: 3,
        up: [
            // Add notification_id field to book_entries to track scheduled reminders
            `ALTER TABLE book_entries ADD COLUMN notification_id TEXT;`,
            // Add unique index for user_id in user_preferences to prevent duplicate entries
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);`,
        ],
    },
    {
        id: 4,
        up: [
            // Add due_date field to book_entries to store expected collection/payment date
            `ALTER TABLE book_entries ADD COLUMN due_date INTEGER;`,
            // Add reminder_interval field to book_entries to store chosen frequency
            `ALTER TABLE book_entries ADD COLUMN reminder_interval TEXT;`,
            // Add notifications_enabled field to book_entries (1 for ON, 0 for OFF)
            `ALTER TABLE book_entries ADD COLUMN notifications_enabled INTEGER DEFAULT 1;`,
        ],
    },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    const executed = new Set<number>();
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY);`
    );
    const rows = await db
        .getAllAsync<{ id: number }>(`SELECT id FROM _migrations;`)
        .catch(() => [] as { id: number }[]);
    rows.forEach((r) => executed.add(r.id));

    for (const m of migrations) {
        if (executed.has(m.id)) continue;
        await db.withTransactionAsync(async () => {
            for (const stmt of m.up) {
                await db.execAsync(stmt);
            }
            await db.execAsync(
                `INSERT INTO _migrations (id) VALUES (${m.id});`
            );
        });
    }
}
