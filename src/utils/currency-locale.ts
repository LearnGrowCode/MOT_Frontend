/**
 * Currency to Locale mapping for NumberFormat
 * Maps currency codes to their appropriate locale strings
 */
export const CURRENCY_LOCALE_MAP: Record<string, string> = {
    INR: "en-IN", // Indian Rupee
    USD: "en-US", // US Dollar
    EUR: "de-DE", // Euro (using German locale as standard)
    GBP: "en-GB", // British Pound
    JPY: "ja-JP", // Japanese Yen
    AUD: "en-AU", // Australian Dollar
    CAD: "en-CA", // Canadian Dollar
    CHF: "de-CH", // Swiss Franc
    CNY: "zh-CN", // Chinese Yuan
    SGD: "en-SG", // Singapore Dollar
};

/**
 * Get locale string for a given currency code
 * @param currency - Currency code (e.g., "INR", "USD")
 * @returns Locale string (e.g., "en-IN", "en-US")
 */
export function getLocaleForCurrency(currency: string): string {
    return CURRENCY_LOCALE_MAP[currency.toUpperCase()] || "en-US";
}

/**
 * Get default currency if none is provided
 */
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY_FALLBACK = "USD";
