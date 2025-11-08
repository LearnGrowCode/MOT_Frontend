import { Status } from "@/type/interface";
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
            return "bg-orange-100 text-orange-700";
        case "paid":
            return "bg-green-100 text-green-700";
        case "collected":
            return "bg-green-100 text-green-700";
        case "partial":
            return "bg-yellow-100 text-yellow-700";
        case "overdue":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export const getStatusText = (status: Status) => {
    switch (status) {
        case "unpaid":
            return "⏰ Unpaid";
        case "paid":
            return "✅ Paid";
        case "collected":
            return "✅ Collected";
        case "partial":
            return "🔄 Partial";
        case "overdue":
            return "⏰ Overdue";
        default:
            return "❓ Unknown";
    }
};
