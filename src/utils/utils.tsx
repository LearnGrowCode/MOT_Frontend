import { Status } from "@/modules/book.module";
import { DEFAULT_CURRENCY, getLocaleForCurrency } from "./currency-locale";

/**
 * Format currency amount with automatic locale detection
 *
 * Regional Number Formatting (handled automatically by Intl.NumberFormat):
 * - USA/UK/CA: 1,234,567.89 (comma thousands, period decimal)
 * - India/Bangladesh: 12,34,567.89 (2-3-2 grouping, period decimal) - automatically handled by "en-IN" locale
 * - Most of Europe: 1.234.567,89 or 1 234 567,89 (period/space thousands, comma decimal)
 * - Switzerland: 1'234'567.89 (apostrophe thousands, period decimal) - automatically handled by "de-CH" locale
 * - China/Japan/Korea: 1,234,567.89 (comma or none, period decimal)
 * - Middle East Arabic: ١٬٢٣٤٬٥٦٧٫٨٩ (Arabic-Indic numerals) - uses arabext numbering system
 *
 * @param amount - Amount to format
 * @param currency - Currency code (e.g., "INR", "USD")
 * @param fractionDigits - Number of decimal places (optional)
 * @param type - Special formatting type like "K" for thousands (optional)
 * @param userLocale - Optional user's preferred locale override
 * @returns Formatted currency string
 */

const autoManageFormat = (
    amount: number,
    type: string
): { amount: number; type: string } => {
    if (amount > 1000000000) {
        return { amount: amount / 1000000000, type: "B" };
    }
    if (amount > 1000000) {
        return { amount: amount / 1000000, type: "M" };
    }
    if (amount > 1000) {
        return { amount: amount / 1000, type: "K" };
    }
    return { amount: amount, type: "" };
};

export const formatCurrency = (
    amount: number,
    currency: string = DEFAULT_CURRENCY,
    fractionDigits?: number,
    type?: string,
    autoManage?: boolean,
    userLocale?: string | null
) => {
    const locale = getLocaleForCurrency(currency, userLocale);
    let displayAmount = amount;

    if (autoManage) {
        const { amount: autoManagedAmount, type: autoManagedType } =
            autoManageFormat(amount, type || "");
        displayAmount = autoManagedAmount;
        type = autoManagedType;
    }
    if (type === "K" && amount > 1000) {
        displayAmount = amount / 1000;
        type = "K";
    }
    if (type === "M" && amount > 1000000) {
        displayAmount = amount / 1000000;
    }
    if (type === "B" && amount > 1000000000) {
        displayAmount = amount / 1000000000;
    }

    // Check if the amount is a whole number (handle floating point precision)
    const isWholeNumber =
        Math.abs(displayAmount % 1) < Number.EPSILON || displayAmount % 1 === 0;

    // If fractionDigits is specified, use it; otherwise use 0 for whole numbers, 2 for decimals
    // Ensure values are valid integers between 0 and 20
    // Handle invalid fractionDigits (NaN, Infinity, null, undefined, non-numbers)
    let maxFractionDigits: number;
    if (
        fractionDigits !== undefined &&
        typeof fractionDigits === "number" &&
        !isNaN(fractionDigits) &&
        isFinite(fractionDigits)
    ) {
        maxFractionDigits = Math.max(
            0,
            Math.min(20, Math.floor(fractionDigits))
        );
    } else {
        maxFractionDigits = isWholeNumber ? 0 : 2;
    }

    // Intl.NumberFormat automatically handles regional formatting:
    // - Indian (en-IN): 12,34,567.89 (2-3-2 grouping)
    // - European (de-DE, fr-FR, etc.): 1.234.567,89 or 1 234 567,89
    // - Swiss (de-CH): 1'234'567.89 (apostrophe separator)
    // - Arabic (ar-SA, ar-AE): ١٬٢٣٤٬٥٦٧٫٨٩ (Arabic-Indic numerals with Arabic separators)
    // No need to specify numberingSystem - default Arabic uses Arabic-Indic numerals (١, ٢, ٣)
    const formattedAmount = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: maxFractionDigits,
    }).format(displayAmount);
    if (type && type !== "") {
        return formattedAmount + type;
    }
    return formattedAmount;
};

/**
 * Format number without currency symbol (for display purposes)
 * @param amount - Amount to format
 * @param currency - Currency code to determine locale
 * @param fractionDigits - Number of decimal places (optional)
 * @returns Formatted number string
 */
export const formatNumber = (
    amount: number,
    currency: string = DEFAULT_CURRENCY,
    fractionDigits?: number,
    userLocale?: string | null
): string => {
    const locale = getLocaleForCurrency(currency, userLocale);

    // Intl.NumberFormat automatically handles regional formatting
    // No need to specify numberingSystem - default Arabic uses Arabic-Indic numerals
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits:
            fractionDigits !== undefined ? fractionDigits : 0,
        maximumFractionDigits:
            fractionDigits !== undefined ? fractionDigits : 2,
    }).format(amount);
};

/**
 * Get currency name in words (e.g., "Rupees" -> "Dollars")
 * @param currency - Currency code
 * @returns Currency name in plural form
 */
export const getCurrencyName = (currency: string): string => {
    const currencyNames: Record<string, string> = {
        INR: "Rupees",
        USD: "Dollars",
        EUR: "Euros",
        GBP: "Pounds",
        JPY: "Yen",
        AUD: "Dollars",
        CAD: "Dollars",
        CHF: "Francs",
        CNY: "Yuan",
        SGD: "Dollars",
    };
    return currencyNames[currency.toUpperCase()] || "Currency";
};

/**
 * Get currency fractional unit name (e.g., "Paisa" -> "Cents")
 * @param currency - Currency code
 * @returns Fractional unit name in plural form
 */
export const getCurrencyFractionName = (currency: string): string => {
    const fractionNames: Record<string, string> = {
        INR: "Paisa",
        USD: "Cents",
        EUR: "Cents",
        GBP: "Pence",
        JPY: "Sen", // Japanese doesn't typically use fractional units, but included for completeness
        AUD: "Cents",
        CAD: "Cents",
        CHF: "Rappen",
        CNY: "Fen",
        SGD: "Cents",
    };
    return fractionNames[currency.toUpperCase()] || "Cents";
};

/**
 * Convert a number to words (handles up to trillions)
 */
const convertNumberToWords = (num: number): string => {
    if (num === 0) return "zero";

    const ones = [
        "",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ];

    const tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ];

    const convertHundreds = (n: number): string => {
        if (n === 0) return "";
        if (n < 20) return ones[n];
        if (n < 100) {
            const ten = Math.floor(n / 10);
            const one = n % 10;
            return one === 0 ? tens[ten] : `${tens[ten]} ${ones[one]}`;
        }
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        return remainder === 0
            ? `${ones[hundred]} hundred`
            : `${ones[hundred]} hundred ${convertHundreds(remainder)}`;
    };

    if (num < 1000) return convertHundreds(num);

    const scales = [
        { value: 1000000000000, name: "trillion" },
        { value: 1000000000, name: "billion" },
        { value: 1000000, name: "million" },
        { value: 1000, name: "thousand" },
    ];

    for (const scale of scales) {
        if (num >= scale.value) {
            const quotient = Math.floor(num / scale.value);
            const remainder = num % scale.value;
            const quotientWords = convertHundreds(quotient);
            const remainderWords =
                remainder > 0 ? ` ${convertNumberToWords(remainder)}` : "";
            return `${quotientWords} ${scale.name}${remainderWords}`;
        }
    }

    return convertHundreds(num);
};

/**
 * Convert amount to words with currency
 * @param amount - Amount as number or string
 * @param currency - Currency code
 * @returns Amount in words (e.g., "five hundred fifty rupees fifty paisa")
 */
export const getAmountInWords = (
    amount: number | string,
    currency: string
): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num) || num === 0) {
        const currencyName = getCurrencyName(currency);
        return `Zero ${currencyName} Only`;
    }

    // Split into integer and decimal parts
    const parts = num.toString().split(".");
    const integerPart = Math.floor(Math.abs(num));
    const decimalPart = parts[1] ? parseFloat("0." + parts[1]) : 0;

    const currencyName = getCurrencyName(currency);
    const fractionName = getCurrencyFractionName(currency);

    // Convert integer part
    const integerWords = convertNumberToWords(integerPart);
    const integerText =
        integerPart === 1
            ? currencyName.slice(0, -1) // Remove 's' for singular
            : currencyName;

    // Convert decimal part (for currencies that use fractional units)
    let result = `${integerWords} ${integerText}`;

    if (decimalPart > 0) {
        // For most currencies, convert to cents/paise (multiply by 100)
        // For JPY, CNY which don't typically use fractional units, skip
        if (
            currency.toUpperCase() !== "JPY" &&
            currency.toUpperCase() !== "CNY"
        ) {
            const fractionalAmount = Math.round(decimalPart * 100);
            if (fractionalAmount > 0) {
                const fractionalWords = convertNumberToWords(fractionalAmount);
                // Handle singular/plural for fractional units
                // Paisa, Fen, Sen, Rappen don't change for plural
                const singularFractions = ["Paisa", "Fen", "Sen", "Rappen"];
                const isSingularOnly = singularFractions.includes(fractionName);
                const fractionalText =
                    !isSingularOnly && fractionalAmount === 1
                        ? fractionName.slice(0, -1) // Remove 's' for singular (Cents -> Cent)
                        : fractionName;
                result += ` ${fractionalWords} ${fractionalText}`;
            }
        }
    }

    return result + " Only";
};

/**
 * Format and restrict amount input
 * Limits to max 15 digits before decimal and 2 digits after decimal
 * @param value - Input value as string
 * @returns Formatted and restricted value
 */
export const formatAmountInput = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    let cleaned = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
        cleaned = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Limit integer part to 15 digits (max reasonable amount)
    if (parts[0].length > 12) {
        cleaned = parts[0].substring(0, 12) + (parts[1] ? "." + parts[1] : "");
    }

    return cleaned;
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
};

export const getStatusColor = (status: Status) => {
    switch (status) {
        case "unpaid":
            return "bg-unpaid-background text-unpaid-foreground";
        case "paid":
            return "bg-paid-background text-paid-foreground";
        case "collected":
            return "bg-paid-background text-paid-foreground";
        case "partial":
            return "bg-partial-background text-partial-foreground";
        case "overdue":
            return "bg-overdue-background text-overdue-foreground";
        default:
            return "bg-muted text-muted-foreground";
    }
};

export const getStatusText = (status: Status) => {
    switch (status) {
        case "unpaid":
            return "Unpaid";
        case "paid":
            return "Paid";
        case "collected":
            return "Collected";
        case "partial":
            return "Partial";
        case "overdue":
            return "Overdue";
        default:
            return "Unknown";
    }
};

/**
 * Filter book entries based on search query and status
 * Works with both PaymentRecord and CollectionRecord through BaseBookRecord
 */
export const filterAndSortBookEntries = (
    bookEntries: any[],
    filters: {
        searchQuery?: string;
        status?: string;
    }
): any[] => {
    const searchQuery = (filters.searchQuery || "").trim().toLowerCase();
    const status = filters.status || "all";

    return bookEntries.filter((record) => {
        const matchesQuery =
            searchQuery.length === 0 ||
            record.name.toLowerCase().includes(searchQuery) ||
            record.category.toLowerCase().includes(searchQuery);
        const matchesStatus =
            status === "all" || record.status === (status as any);
        return matchesQuery && matchesStatus;
    });
};

export const REMINDER_INTERVALS = [
    { label: "1 Day Before", value: "1_day_before" },
    { label: "2 Days Before", value: "2_days_before" },
    { label: "3 Days Before", value: "3_days_before" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Daily", value: "daily" },
];
