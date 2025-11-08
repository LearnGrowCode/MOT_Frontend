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
import { DEFAULT_CURRENCY_FALLBACK } from "@/utils/currency-locale";

interface CurrencyContextType {
    currency: string;
    isLoading: boolean;
    refetch: () => Promise<void>;
    updateCurrency: (newCurrency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY_FALLBACK);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchCurrency = useCallback(async () => {
        try {
            setIsLoading(true);
            const prefs = await getUserPreferences(DEFAULT_USER_ID);
            if (prefs?.currency) {
                setCurrency(prefs.currency);
            } else {
                setCurrency(DEFAULT_CURRENCY_FALLBACK);
            }
        } catch (error) {
            console.error("Error fetching user currency:", error);
            setCurrency(DEFAULT_CURRENCY_FALLBACK);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCurrency = useCallback((newCurrency: string) => {
        setCurrency(newCurrency);
    }, []);

    useEffect(() => {
        fetchCurrency();
    }, [fetchCurrency]);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                isLoading,
                refetch: fetchCurrency,
                updateCurrency,
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
