/**
 * Hook that provides currency formatting with locale support
 * Automatically uses user's locale preference or device locale
 */
import { useUserCurrency } from "./useUserCurrency";
import { formatCurrency as formatCurrencyUtil } from "@/utils/utils";

export function useFormattedCurrency() {
    const { currency, locale } = useUserCurrency();

    const formatCurrency = (
        amount: number,
        fractionDigits?: number,
        type?: string,
        autoManage?: boolean
    ) => {
        return formatCurrencyUtil(
            amount,
            currency,
            fractionDigits,
            type,
            autoManage,
            locale
        );
    };

    return {
        currency,
        locale,
        formatCurrency,
    };
}

