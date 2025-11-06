import * as SQLite from "expo-sqlite";
import { runMigrations } from "./schema";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!databasePromise) {
        databasePromise = (async () => {
            const db = await SQLite.openDatabaseAsync("mot.db", {
                useNewConnection: true,
            });
            await runMigrations(db);
            return db;
        })();
    }
    return databasePromise;
}

export async function closeDb(): Promise<void> {
    if (!databasePromise) return;
    const db = await databasePromise;
    try {
        await db.closeAsync();
    } finally {
        databasePromise = null;
    }
}

export function nowTs(): number {
    return Date.now();
}
