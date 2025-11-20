import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { getUserPreferences } from "@/db/models/User";
import { DEFAULT_USER_ID } from "@/utils/constants";
import {
    DEFAULT_CURRENCY_FALLBACK,
    getDefaultCurrencyFromLocale,
    getDeviceLocale,
} from "@/utils/currency-locale";

interface CurrencyContextType {
    currency: string;
    locale: string | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    updateCurrency: (newCurrency: string) => void;
    updateLocale: (newLocale: string | null) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY_FALLBACK);
    const [locale, setLocale] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchCurrency = useCallback(async () => {
        try {
            setIsLoading(true);
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            const deviceLocale = getDeviceLocale();
            
            if (prefs?.currency) {
                setCurrency(prefs.currency);
            } else {
                // Use device locale to determine default currency
                const deviceCurrency = getDefaultCurrencyFromLocale();
                setCurrency(deviceCurrency);
            }
            
            // Set locale: use user preference if set, otherwise null (which means use device locale)
            // We store the actual device locale value, but null indicates "use device locale dynamically"
            setLocale(prefs?.locale ?? null);
        } catch (error) {
            console.error("Error fetching user currency:", error);
            const deviceCurrency = getDefaultCurrencyFromLocale();
            setCurrency(deviceCurrency);
            setLocale(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCurrency = useCallback((newCurrency: string) => {
        setCurrency(newCurrency);
    }, []);

    const updateLocale = useCallback((newLocale: string | null) => {
        setLocale(newLocale);
    }, []);

    useEffect(() => {
        fetchCurrency();
    }, [fetchCurrency]);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                locale,
                isLoading,
                refetch: fetchCurrency,
                updateCurrency,
                updateLocale,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
