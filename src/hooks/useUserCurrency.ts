/**
 * Hook to get and manage user's currency preference
 * Uses CurrencyContext for global state management
 * @returns Object with currency string, locale, loading state, and update functions
 */
import { useCurrency } from "@/context/CurrencyContext";

export function useUserCurrency() {
    const { currency, locale, isLoading, refetch, updateCurrency, updateLocale } = useCurrency();
    return { currency, locale, isLoading, refetch, updateCurrency, updateLocale };
}
