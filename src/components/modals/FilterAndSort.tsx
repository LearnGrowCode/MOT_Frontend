import React from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// Configuration: Delay before closing modal to show selection (in milliseconds)
const CLOSE_DELAY_MS = 1000;

interface FilterAndSortProps {
    visible: boolean;
    onClose: () => void;
    onFilterAndSort: (filters: { filter?: string; sort?: string }) => void;
    filterAndSort: {
        filter: string;
        sort: string;
    };
}

const FILTER_SORT_OPTIONS = {
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
    visible,
    onClose,
    onFilterAndSort,
    filterAndSort,
}: FilterAndSortProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const handleFilterSelect = (filterId: string) => {
        onFilterAndSort({
            filter: filterId,
        });
        // Delay closing to show selection
        setTimeout(() => {
            onClose();
        }, CLOSE_DELAY_MS);
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
        // Delay closing to show selection
        setTimeout(() => {
            onClose();
        }, CLOSE_DELAY_MS);
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose} // close when tapping outside
            onSwipeComplete={onClose} // close when swiped down
            swipeDirection='down' // 👇 enables swipe-down to close
            animationIn='slideInUp'
            animationOut='slideOutDown'
            hideModalContentWhileAnimating={true}
            propagateSwipe={true}
            useNativeDriver={true}
            animationInTiming={450}
            animationOutTiming={400}
            backdropOpacity={0.5}
            backdropTransitionInTiming={450}
            backdropTransitionOutTiming={400}
            style={{
                width: "100%",
                margin: 0,
                padding: 0,
                justifyContent: "flex-end",
                backgroundColor: "transparent",
            }}
        >
            <View className='items-stretch'>
                <Card className=' w-full rounded-t-2xl bg-card'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-bold'>
                            Filter & Sort
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <X size={24} color={isDark ? "#f8fafc" : "#1e293b"} strokeWidth={2} />
                        </Pressable>
                    </CardHeader>

                    <View
                        style={{
                            maxHeight: Dimensions.get("window").height * 0.8,
                        }}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator
                            contentContainerStyle={{ paddingBottom: 8 }}
                        >
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
                                                            py-1.5 px-3
                                                            rounded-full
                                                            border
                                                            transition-all
                                                            active:scale-95
                                                            ${
                                                                isSelected
                                                                    ? "bg-primary/10 border-primary/20"
                                                                    : "bg-card border-border"
                                                            }
                                                        `}
                                                    >
                                                        <Text
                                                            className={`
                                                                text-sm
                                                                ${
                                                                    isSelected
                                                                        ? "text-primary font-medium"
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
                                                                                py-2 px-4
                                                                                rounded-lg
                                                                                border
                                                                                transition-all
                                                                                active:scale-95
                                                                                ${
                                                                                    isSelected
                                                                                        ? "bg-primary/10 border-primary/20"
                                                                                        : "bg-card border-border"
                                                                                }
                                                                            `}
                                                                        >
                                                                            <Text
                                                                                className={`
                                                                                    text-sm
                                                                                    ${
                                                                                        isSelected
                                                                                            ? "text-primary font-medium"
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
                        </ScrollView>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
