import { getDb } from "@/db";

/**
 * Clears all data from the database tables
 * WARNING: This will delete all user data, book entries, and settlements
 * The _migrations table is preserved to maintain schema structure
 */
export async function clearDatabase(): Promise<void> {
    const db = await getDb();

    try {
        await db.withTransactionAsync(async () => {
            // Delete in order to respect foreign key constraints
            // Settlements first (depends on book_entries)
            await db.execAsync(`DELETE FROM settlements;`);

            // Book entries next (depends on users)
            await db.execAsync(`DELETE FROM book_entries;`);

            // User preferences (depends on users)
            await db.execAsync(`DELETE FROM user_preferences;`);

            // Users last
            await db.execAsync(`DELETE FROM users;`);
        });

        console.log("✅ Database cleared successfully");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        throw error;
    }
}

/**
 * Clears all data and resets the database to empty state
 * Also clears SecureStore onboarding flag
 */
export async function resetAppData(): Promise<void> {
    const { default: SecureStore } = await import("expo-secure-store");

    try {
        // Clear database
        await clearDatabase();

        // Clear onboarding flag
        try {
            await SecureStore.deleteItemAsync("onboarding_complete");
        } catch (error) {
            // Ignore if key doesn't exist
            console.log("Onboarding flag not found, skipping...");
        }

        console.log("✅ App data reset successfully");
    } catch (error) {
        console.error("❌ Error resetting app data:", error);
        throw error;
    }
}
