import { getDb, nowTs } from "../index";

export interface User {
    id: string;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    passwordHash?: string; // optional, typically not stored client-side
    isActive?: 0 | 1;
    isStaff?: 0 | 1;
    isSuperuser?: 0 | 1;
    lastLogin?: number | null;
    dateJoined?: number | null;
    remoteId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number | null;
    isDirty?: 0 | 1;
}

export interface UserPreferences {
    id: string;
    userId: string;
    currency?: string;
    language?: string;
    theme?: string;
    notifications?: 0 | 1;
    emailNotifications?: 0 | 1;
    smsNotifications?: 0 | 1;
    pushNotifications?: 0 | 1;
    remoteId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number | null;
    isDirty?: 0 | 1;
}

export async function upsertUser(user: User): Promise<void> {
    const db = await getDb();
    const ts = nowTs();
    const existing = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM users WHERE id = ?;`,
        [user.id]
    );
    if (existing) {
        await db.runAsync(
            `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, password_hash = ?, is_active = ?, is_staff = ?, is_superuser = ?, last_login = ?, date_joined = ?, remote_id = ?, updated_at = ?, is_dirty = 1 WHERE id = ?;`,
            [
                user.username ?? null,
                user.email,
                user.firstName ?? null,
                user.lastName ?? null,
                user.passwordHash ?? null,
                user.isActive ?? 1,
                user.isStaff ?? 0,
                user.isSuperuser ?? 0,
                user.lastLogin ?? null,
                user.dateJoined ?? null,
                user.remoteId ?? null,
                ts,
                user.id,
            ]
        );
    } else {
        await db.runAsync(
            `INSERT INTO users (id, username, email, first_name, last_name, password_hash, is_active, is_staff, is_superuser, last_login, date_joined, remote_id, created_at, updated_at, deleted_at, is_dirty)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                user.id,
                user.username ?? null,
                user.email,
                user.firstName ?? null,
                user.lastName ?? null,
                user.passwordHash ?? null,
                user.isActive ?? 1,
                user.isStaff ?? 0,
                user.isSuperuser ?? 0,
                user.lastLogin ?? null,
                user.dateJoined ?? null,
                user.remoteId ?? null,
                ts,
                ts,
                null,
                1,
            ]
        );
    }
}

export async function getUser(id: string): Promise<User | null> {
    const db = await getDb();
    const r = await db.getFirstAsync<any>(
        `SELECT * FROM users WHERE id = ? AND (deleted_at IS NULL);`,
        [id]
    );
    if (!r) return null;
    return mapUser(r);
}

export async function upsertUserPreferences(
    prefs: UserPreferences
): Promise<void> {
    const db = await getDb();
    const ts = nowTs();
    const existing = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM user_preferences WHERE id = ?;`,
        [prefs.id]
    );
    if (existing) {
        await db.runAsync(
            `UPDATE user_preferences SET user_id = ?, currency = ?, language = ?, theme = ?, notifications = ?, email_notifications = ?, sms_notifications = ?, push_notifications = ?, remote_id = ?, updated_at = ?, is_dirty = 1 WHERE id = ?;`,
            [
                prefs.userId,
                prefs.currency ?? null,
                prefs.language ?? null,
                prefs.theme ?? null,
                prefs.notifications ?? 1,
                prefs.emailNotifications ?? 1,
                prefs.smsNotifications ?? 1,
                prefs.pushNotifications ?? 1,
                prefs.remoteId ?? null,
                ts,
                prefs.id,
            ]
        );
    } else {
        await db.runAsync(
            `INSERT INTO user_preferences (id, user_id, currency, language, theme, notifications, email_notifications, sms_notifications, push_notifications, remote_id, created_at, updated_at, deleted_at, is_dirty)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                prefs.id,
                prefs.userId,
                prefs.currency ?? null,
                prefs.language ?? null,
                prefs.theme ?? null,
                prefs.notifications ?? 1,
                prefs.emailNotifications ?? 1,
                prefs.smsNotifications ?? 1,
                prefs.pushNotifications ?? 1,
                prefs.remoteId ?? null,
                ts,
                ts,
                null,
                1,
            ]
        );
    }
}

export async function getUserPreferences(
    userId: string
): Promise<UserPreferences | null> {
    const db = await getDb();
    const r = await db.getFirstAsync<any>(
        `SELECT * FROM user_preferences WHERE user_id = ? AND (deleted_at IS NULL) ORDER BY updated_at DESC LIMIT 1;`,
        [userId]
    );
    if (!r) return null;
    return mapPrefs(r);
}

function mapUser(r: any): User {
    return {
        id: r.id,
        username: r.username ?? undefined,
        email: r.email,
        firstName: r.first_name ?? undefined,
        lastName: r.last_name ?? undefined,
        passwordHash: r.password_hash ?? undefined,
        isActive: r.is_active ?? 1,
        isStaff: r.is_staff ?? 0,
        isSuperuser: r.is_superuser ?? 0,
        lastLogin: r.last_login ?? undefined,
        dateJoined: r.date_joined ?? undefined,
        remoteId: r.remote_id ?? undefined,
        createdAt: r.created_at ?? undefined,
        updatedAt: r.updated_at ?? undefined,
        deletedAt: r.deleted_at ?? undefined,
        isDirty: r.is_dirty ?? 0,
    } as User;
}

function mapPrefs(r: any): UserPreferences {
    return {
        id: r.id,
        userId: r.user_id,
        currency: r.currency ?? undefined,
        language: r.language ?? undefined,
        theme: r.theme ?? undefined,
        notifications: r.notifications ?? 1,
        emailNotifications: r.email_notifications ?? 1,
        smsNotifications: r.sms_notifications ?? 1,
        pushNotifications: r.push_notifications ?? 1,
        remoteId: r.remote_id ?? undefined,
        createdAt: r.created_at ?? undefined,
        updatedAt: r.updated_at ?? undefined,
        deletedAt: r.deleted_at ?? undefined,
        isDirty: r.is_dirty ?? 0,
    } as UserPreferences;
}
