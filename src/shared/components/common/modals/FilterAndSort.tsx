import React from "react";
import { View, Text, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shared/components/ui/accordion";

interface FilterAndSortProps {
    visible?: boolean;
    onClose: () => void;
    onFilterAndSort: (filters: { filter?: string; sort?: string }) => void;
    filterAndSort: {
        filter: string;
        sort: string;
    };
}

const FILTER_SORT_OPTIONS = {
    // ... same as before
    filter: [
        { id: "all", label: "All" },
        { id: "unpaid", label: "Unpaid" },
        { id: "partial", label: "Partially Paid" },
        { id: "paid", label: "Paid" },
    ],
    sort: [
        {
            id: "name",
            label: "Name",
            subOptions: [
                { id: "name_asc", label: "A to Z" },
                { id: "name_desc", label: "Z to A" },
            ],
        },
        {
            id: "amount",
            label: "Amount",
            subOptions: [
                { id: "amount_asc", label: "Low to High" },
                { id: "amount_desc", label: "High to Low" },
            ],
        },
        {
            id: "date",
            label: "Date Created",
            subOptions: [
                { id: "date_asc", label: "Oldest First" },
                { id: "date_desc", label: "Newest First" },
            ],
        },
    ],
};

export default function FilterAndSort({
    onClose,
    onFilterAndSort,
    filterAndSort,
}: FilterAndSortProps) {
    const { colorScheme } = useColorScheme();
    const handleFilterSelect = (filterId: string) => {
        onFilterAndSort({
            filter: filterId,
        });
    };

    const handleSortSelect = (sortId: string) => {
        // Map date_asc/date_desc to oldest/newest for backward compatibility
        let mappedSortId = sortId;
        if (sortId === "date_asc") {
            mappedSortId = "oldest";
        } else if (sortId === "date_desc") {
            mappedSortId = "newest";
        }

        onFilterAndSort({
            sort: mappedSortId,
        });
    };

    return (
        <Card className="w-full border-0 bg-card border-border/40 shadow-2xl">
            <CardHeader className='flex-row items-center justify-between py-6 px-8 border-b border-border/30'>
                <CardTitle className='text-2xl font-black tracking-tight text-foreground'>
                    Filter & Sort
                </CardTitle>
                <Pressable 
                    onPress={onClose} 
                    className='p-3 bg-secondary/50 rounded-2xl active:bg-secondary'
                >
                    <X size={20} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={3} />
                </Pressable>
            </CardHeader>

            <View>
             
                    <CardContent className='flex flex-col justify-between gap-4'>
                        <View className='flex flex-col gap-2'>
                            <Text className='text-lg font-semibold text-foreground'>
                                Filter
                            </Text>
                            <View
                                role='group'
                                className='flex flex-row flex-wrap gap-2'
                            >
                                {FILTER_SORT_OPTIONS.filter.map(
                                    (filterOption) => {
                                        // For "paid" filter, also check if filter is "collected" (for collection records)
                                        const isSelected =
                                            filterAndSort.filter ===
                                                filterOption.id ||
                                            (filterOption.id ===
                                                "paid" &&
                                                filterAndSort.filter ===
                                                    "collected");
                                        return (
                                            <Pressable
                                                key={filterOption.id}
                                                onPress={() =>
                                                    handleFilterSelect(
                                                        filterOption.id
                                                    )
                                                }
                                                className={`
                                                    py-3 px-6
                                                    rounded-2xl
                                                    border-2
                                                    active:scale-95
                                                    ${
                                                        isSelected
                                                            ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                            : "bg-secondary/30 border-border/50"
                                                    }
                                                `}
                                            >
                                                <Text
                                                    className={`
                                                        text-sm font-black tracking-tight
                                                        ${
                                                            isSelected
                                                                ? "text-primary-foreground"
                                                                : "text-muted-foreground"
                                                        }
                                                    `}
                                                >
                                                    {filterOption.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    }
                                )}
                            </View>
                        </View>
                        <View className=''>
                            <Text className='text-lg font-semibold text-foreground'>
                                Sort
                            </Text>
                            <Accordion type='single' collapsible>
                                {FILTER_SORT_OPTIONS.sort.map(
                                    (sortOption) => (
                                        <AccordionItem
                                            key={sortOption.id}
                                            value={sortOption.id}
                                        >
                                            <AccordionTrigger>
                                                <Text className='text-base font-medium text-foreground'>
                                                    {sortOption.label}
                                                </Text>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <View className='flex flex-row flex-wrap gap-2 '>
                                                    {sortOption.subOptions.map(
                                                        (subOption) => {
                                                            // Check if this option is selected (handle mapping)
                                                            const isSelected =
                                                                filterAndSort.sort ===
                                                                    subOption.id ||
                                                                (filterAndSort.sort ===
                                                                    "oldest" &&
                                                                    subOption.id ===
                                                                        "date_asc") ||
                                                                (filterAndSort.sort ===
                                                                    "newest" &&
                                                                    subOption.id ===
                                                                        "date_desc");
                                                            return (
                                                                <Pressable
                                                                    key={
                                                                        subOption.id
                                                                    }
                                                                    onPress={() =>
                                                                        handleSortSelect(
                                                                            subOption.id
                                                                        )
                                                                    }
                                                                    className={`
                                                                        py-3 px-5
                                                                        rounded-xl
                                                                        border-2
                                                                        active:scale-95
                                                                        ${
                                                                            isSelected
                                                                                ? "bg-primary border-primary shadow-md shadow-primary/20"
                                                                                : "bg-secondary/30 border-border/50"
                                                                        }
                                                                    `}
                                                                >
                                                                    <Text
                                                                        className={`
                                                                            text-sm font-black tracking-tight
                                                                            ${
                                                                                isSelected
                                                                                    ? "text-primary-foreground"
                                                                                    : "text-muted-foreground"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            subOption.label
                                                                        }
                                                                    </Text>
                                                                </Pressable>
                                                            );
                                                        }
                                                    )}
                                                </View>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                )}
                            </Accordion>
                        </View>
                    </CardContent>
             
            </View>
        </Card>
    );
}
