export const formatCurrency = (
    amount: number,
    currency: string,
    locale: string,
    fractionDigits?: number,
    type?: string
) => {
    if (type === "K" && amount > 1000) {
        amount = amount / 1000;
    }

    const formattedAmount = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits ? fractionDigits : 0,
    }).format(amount);

    if (type === "K") {
        return formattedAmount + "K";
    }
    return formattedAmount;
};
