import * as React from "react";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { getUserPreferences, upsertUserPreferences } from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import {
    DEFAULT_CURRENCY_FALLBACK,
    getDefaultCurrencyFromLocale,
    getDeviceLocale,
} from "@/utils/currency-locale";
import { useColorScheme } from "nativewind";
import { uuidv4 } from "@/utils/uuid";

export type ThemeType = "light" | "dark" | "system";

interface PreferencesContextType {
    currency: string;
    locale: string | null;
    theme: ThemeType;
    isLoading: boolean;
    refetch: () => Promise<void>;
    updateCurrency: (newCurrency: string) => Promise<void>;
    updateLocale: (newLocale: string | null) => Promise<void>;
    updateTheme: (newTheme: ThemeType) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
    undefined
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY_FALLBACK);
    const [locale, setLocale] = useState<string | null>(null);
    const [theme, setTheme] = useState<ThemeType>("system");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { setColorScheme } = useColorScheme();

    const fetchPreferences = useCallback(async () => {
        try {
            setIsLoading(true);
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            
            if (prefs?.currency) {
                setCurrency(prefs.currency);
            } else {
                const deviceCurrency = getDefaultCurrencyFromLocale();
                setCurrency(deviceCurrency);
            }
            
            setLocale(prefs?.locale ?? null);
            
            const savedTheme = (prefs?.theme as ThemeType) || "system";
            setTheme(savedTheme);
            
            // Sync with NativeWind
            if (savedTheme === "system") {
                setColorScheme(undefined);
            } else {
                setColorScheme(savedTheme as any);
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error);
            const deviceCurrency = getDefaultCurrencyFromLocale();
            setCurrency(deviceCurrency);
            setLocale(null);
            setTheme("system");
        } finally {
            setIsLoading(false);
        }
    }, [setColorScheme]);

    const updateCurrency = useCallback(async (newCurrency: string) => {
        setCurrency(newCurrency);
        try {
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            await upsertUserPreferences({
                id: prefs?.id || uuidv4(),
                userId: DEFAULT_USER_ID,
                ...prefs,
                currency: newCurrency,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error("Error saving currency preference:", error);
        }
    }, []);

    const updateLocale = useCallback(async (newLocale: string | null) => {
        setLocale(newLocale);
        try {
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            await upsertUserPreferences({
                id: prefs?.id || uuidv4(),
                userId: DEFAULT_USER_ID,
                ...prefs,
                locale: newLocale || undefined,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error("Error saving locale preference:", error);
        }
    }, []);

    const updateTheme = useCallback(async (newTheme: ThemeType) => {
        setTheme(newTheme);
        
        // Sync with NativeWind
        if (newTheme === "system") {
            setColorScheme(undefined);
        } else {
            setColorScheme(newTheme as any);
        }

        try {
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            await upsertUserPreferences({
                id: prefs?.id || uuidv4(),
                userId: DEFAULT_USER_ID,
                ...prefs,
                theme: newTheme,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error("Error saving theme preference:", error);
        }
    }, [setColorScheme]);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    return (
        <PreferencesContext.Provider
            value={{
                currency,
                locale,
                theme,
                isLoading,
                refetch: fetchPreferences,
                updateCurrency,
                updateLocale,
                updateTheme,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error("usePreferences must be used within a PreferencesProvider");
    }
    return context;
}
