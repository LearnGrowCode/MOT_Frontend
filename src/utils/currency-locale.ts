import * as Localization from "expo-localization";

/**
 * Currency to Locale mapping for NumberFormat
 * Maps currency codes to their appropriate locale strings
 * These are preferred locales for each currency
 *
 * Regional Number Formatting (handled automatically by Intl.NumberFormat):
 * - USA/UK/CA (en-US, en-GB, en-CA): 1,234,567.89 (comma thousands, period decimal)
 * - India/Bangladesh (en-IN): 12,34,567.89 (2-3-2 grouping, period decimal)
 * - Most of Europe (de-DE, fr-FR, etc.): 1.234.567,89 or 1 234 567,89 (period/space thousands, comma decimal)
 * - Switzerland (de-CH): 1'234'567.89 (apostrophe thousands, period decimal)
 * - China/Japan/Korea (zh-CN, ja-JP, ko-KR): 1,234,567.89 (comma or none, period decimal)
 * - Middle East Arabic (ar-SA, ar-AE): ١٬٢٣٤٬٥٦٧٫٨٩ (Arabic-Indic numerals with Arabic separators)
 */
export const CURRENCY_LOCALE_MAP: Record<string, string> = {
    INR: "en-IN", // Indian Rupee - Uses 2-3-2 grouping (12,34,567.89)
    USD: "en-US", // US Dollar - Uses comma thousands, period decimal
    EUR: "de-DE", // Euro - Uses period thousands, comma decimal (1.234.567,89)
    GBP: "en-GB", // British Pound - Uses comma thousands, period decimal
    JPY: "ja-JP", // Japanese Yen - Uses comma thousands, period decimal
    AUD: "en-AU", // Australian Dollar - Uses comma thousands, period decimal
    CAD: "en-CA", // Canadian Dollar - Uses comma thousands, period decimal
    CHF: "de-CH", // Swiss Franc - Uses apostrophe thousands, period decimal (1'234'567.89)
    CNY: "zh-CN", // Chinese Yuan - Uses comma thousands, period decimal
    SGD: "en-SG", // Singapore Dollar - Uses comma thousands, period decimal
    HKD: "en-HK", // Hong Kong Dollar - Uses comma thousands, period decimal
    NZD: "en-NZ", // New Zealand Dollar - Uses comma thousands, period decimal
    SEK: "sv-SE", // Swedish Krona - Uses space thousands, comma decimal
    NOK: "nb-NO", // Norwegian Krone - Uses space thousands, comma decimal
    MXN: "es-MX", // Mexican Peso - Uses comma thousands, period decimal
    RUB: "ru-RU", // Russian Ruble - Uses space thousands, comma decimal
    SAR: "ar-SA", // Saudi Riyal - Uses Arabic-Indic numerals with Arabic separators
    AED: "ar-AE", // UAE Dirham - Uses Arabic-Indic numerals with Arabic separators
    KRW: "ko-KR", // Korean Won - Uses comma thousands, period decimal
    // Additional European currencies
    DKK: "da-DK", // Danish Krone - Uses period thousands, comma decimal
    PLN: "pl-PL", // Polish Zloty - Uses space thousands, comma decimal
    CZK: "cs-CZ", // Czech Koruna - Uses space thousands, comma decimal
    HUF: "hu-HU", // Hungarian Forint - Uses space thousands, comma decimal
    RON: "ro-RO", // Romanian Leu - Uses period thousands, comma decimal
    BGN: "bg-BG", // Bulgarian Lev - Uses space thousands, comma decimal
    TRY: "tr-TR", // Turkish Lira - Uses period thousands, comma decimal
};

/**
 * Get device locale
 * @returns Device locale string (e.g., "en-US", "en-IN")
 */
export function getDeviceLocale(): string {
    try {
        const locales = Localization.getLocales();
        if (locales && locales.length > 0) {
            return locales[0].languageTag || "en-US";
        }
    } catch (error) {
        console.error("Error getting device locale:", error);
    }
    return "en-US"; // Fallback
}

/**
 * Get locale string for a given currency code
 * Priority: 1) Currency mapping, 2) Device locale, 3) Default
 * @param currency - Currency code (e.g., "INR", "USD")
 * @param userLocale - Optional user's preferred locale override
 * @returns Locale string (e.g., "en-IN", "en-US")
 */
export function getLocaleForCurrency(
    currency: string,
    userLocale?: string | null
): string {
    // If user has explicitly set a locale preference, use it
    if (userLocale) {
        return userLocale;
    }

    // Default to device locale (user's request: "keep the default as device local")
    // This ensures the app respects the user's device language/region settings
    const deviceLocale = getDeviceLocale();

    // If currency has a specific mapping and it matches device locale pattern, use it
    // Otherwise, prefer device locale for consistency
    const mappedLocale = CURRENCY_LOCALE_MAP[currency.toUpperCase()];

    // Use currency mapping only if it's a close match to device locale
    // Otherwise, use device locale as default
    if (mappedLocale) {
        // Check if device locale language matches mapped locale language
        const deviceLang = deviceLocale.split("-")[0];
        const mappedLang = mappedLocale.split("-")[0];

        // If languages match, use mapped locale (more specific)
        // Otherwise, use device locale (user's preference)
        if (deviceLang === mappedLang) {
            return mappedLocale;
        }
    }

    // Default: use device locale
    return deviceLocale;
}

/**
 * Get default currency based on device locale
 * @returns Currency code (e.g., "INR", "USD")
 */
export function getDefaultCurrencyFromLocale(): string {
    const deviceLocale = getDeviceLocale();

    // Map common locale patterns to currencies
    const localeToCurrency: Record<string, string> = {
        "en-IN": "INR",
        "hi-IN": "INR",
        "en-US": "USD",
        "en-GB": "GBP",
        "en-AU": "AUD",
        "en-CA": "CAD",
        "en-NZ": "NZD",
        "en-SG": "SGD",
        "en-HK": "HKD",
        "ja-JP": "JPY",
        "zh-CN": "CNY",
        "de-DE": "EUR",
        "de-CH": "CHF",
        "sv-SE": "SEK",
        "nb-NO": "NOK",
        "es-MX": "MXN",
        "ru-RU": "RUB",
        "ar-SA": "SAR",
        "ar-AE": "AED",
        "ko-KR": "KRW",
    };

    // Try exact match
    if (localeToCurrency[deviceLocale]) {
        return localeToCurrency[deviceLocale];
    }

    // Try language code match (e.g., "en" from "en-IN")
    const languageCode = deviceLocale.split("-")[0];
    for (const [locale, currency] of Object.entries(localeToCurrency)) {
        if (locale.startsWith(languageCode)) {
            return currency;
        }
    }

    // Default fallback
    return DEFAULT_CURRENCY_FALLBACK;
}

/**
 * Get default currency if none is provided
 */
export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_LOCALE = "en-IN";
export const DEFAULT_CURRENCY_FALLBACK = "INR";
