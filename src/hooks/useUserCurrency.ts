/**
 * Hook to get and manage user's currency preference
 * Uses CurrencyContext for global state management
 * @returns Object with currency string and loading state
 */
import { useCurrency } from "@/context/CurrencyContext";

export function useUserCurrency() {
    const { currency, isLoading, refetch } = useCurrency();
    return { currency, isLoading, refetch };
}
