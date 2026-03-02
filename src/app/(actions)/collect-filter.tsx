import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import FilterAndSort from "@/components/shared/modals/FilterAndSort";

export default function CollectFilterScreen() {
    const { filter, sort } = useLocalSearchParams<{ filter: string; sort: string }>();
    const router = useRouter();

    const handleFilterAndSort = (filters: { filter?: string; sort?: string }) => {
        const newParams = {
            filter: filters.filter ?? filter ?? "all",
            sort: filters.sort ?? sort ?? "date_desc",
        };
        
        router.navigate({
            pathname: "/collect-book",
            params: newParams,
        } as any);
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <FilterAndSort
            onClose={handleClose}
            onFilterAndSort={handleFilterAndSort}
            filterAndSort={{
                filter: filter ?? "all",
                sort: sort ?? "date_desc",
            }}
            isScreen={true}
        />
    );
}
