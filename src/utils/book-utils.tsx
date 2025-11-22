// Filter and sort book entries

import { BaseBookRecord } from "@/type/interface";

/**
 * Filter book entries based on search query and status
 * Works with both PaymentRecord and CollectionRecord through BaseBookRecord
 */
export const filterAndSortBookEntries = (
    bookEntries: BaseBookRecord[],
    filters: {
        searchQuery?: string;
        status?: string;
    }
): BaseBookRecord[] => {
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
