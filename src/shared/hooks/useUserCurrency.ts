/**
 * Hook to get and manage user's currency preference
 * Uses CurrencyContext for global state management
 * @returns Object with currency string, locale, loading state, and update functions
 */
import { usePreferences } from "@/shared/hooks/PreferencesContext";
 
 export function useUserCurrency() {
     const { currency, locale, isLoading, refetch, updateCurrency, updateLocale } = usePreferences();
     return { currency, locale, isLoading, refetch, updateCurrency, updateLocale };
 }
