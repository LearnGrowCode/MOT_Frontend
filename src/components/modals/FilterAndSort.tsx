import React, { useState } from "react";
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
interface FilterAndSortProps {
    visible: boolean;
    onClose: () => void;
    onFilterAndSort: (filters: any) => void;
}

const FILTER_OPTIONS = [
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

    {
        id: "status",
        label: "Status",
        subOptions: [
            { id: "all", label: "All" },
            { id: "unpaid", label: "Unpaid" },
            { id: "partial", label: "Partially Paid" },
            { id: "paid", label: "Paid" },
        ],
    },
];

export default function FilterAndSort({
    visible,
    onClose,
    onFilterAndSort,
}: FilterAndSortProps) {
    const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string>
    >({});

    const handleSubOptionSelect = (optionId: string, subOptionId: string) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [optionId]: subOptionId,
        }));
    };

    const handleApplyFilters = () => {
        onFilterAndSort(selectedFilters);
        onClose();
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose} // close when tapping outside
            onSwipeComplete={onClose} // close when swiped down
            swipeDirection='down' // 👇 enables swipe-down to close
            animationIn='slideInUp'
            animationOut='slideOutDown'
            hideModalContentWhileAnimating={false}
            propagateSwipe={true}
            style={{
                width: "100%",
                margin: 0,
                padding: 0,
                justifyContent: "flex-end",
                backgroundColor: "transparent",
            }}
        >
            <View className='items-stretch'>
                <Card className=' w-full rounded-t-2xl bg-white'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-bold'>
                            Filter & Sort
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <X size={24} color='#000' strokeWidth={2} />
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
                                    <Text className='text-lg font-semibold text-gray-800'>
                                        Filter
                                    </Text>
                                    {FILTER_OPTIONS.filter(
                                        (option) => option.id === "status"
                                    ).map((option) => (
                                        <View
                                            key={option.id}
                                            role='group'
                                            className='flex flex-row flex-wrap gap-2'
                                        >
                                            {option.subOptions.map(
                                                (subOption) => (
                                                    <Pressable
                                                        key={subOption.id}
                                                        onPress={() =>
                                                            handleSubOptionSelect(
                                                                option.id,
                                                                subOption.id
                                                            )
                                                        }
                                                        className={`
                                                    py-1.5 px-3
                                                    rounded-full
                                                    border
                                                    transition-all
                                                    active:scale-95
                                                    ${
                                                        selectedFilters[
                                                            option.id
                                                        ] === subOption.id
                                                            ? "bg-blue-50 border-blue-200"
                                                            : "bg-white border-gray-200"
                                                    }
                                                    `}
                                                    >
                                                        <Text
                                                            className={`
                                                        text-sm
                                                        ${
                                                            selectedFilters[
                                                                option.id
                                                            ] === subOption.id
                                                                ? "text-blue-600 font-medium"
                                                                : "text-gray-600"
                                                        }
                                                        `}
                                                        >
                                                            {subOption.label}
                                                        </Text>
                                                    </Pressable>
                                                )
                                            )}
                                        </View>
                                    ))}
                                </View>
                                <View className=''>
                                    <Text className='text-lg font-semibold text-gray-800'>
                                        Sort
                                    </Text>
                                    <Accordion type='single' collapsible>
                                        {FILTER_OPTIONS.filter(
                                            (option) => option.id !== "status"
                                        ).map((option) => (
                                            <AccordionItem
                                                key={option.id}
                                                value={option.id}
                                            >
                                                <AccordionTrigger>
                                                    <Text className='text-base font-medium'>
                                                        {option.label}
                                                    </Text>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <View className='flex flex-row flex-wrap gap-2 '>
                                                        {option.subOptions.map(
                                                            (subOption) => (
                                                                <Pressable
                                                                    key={
                                                                        subOption.id
                                                                    }
                                                                    onPress={() =>
                                                                        handleSubOptionSelect(
                                                                            option.id,
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
                                                                    selectedFilters[
                                                                        option
                                                                            .id
                                                                    ] ===
                                                                    subOption.id
                                                                        ? "bg-blue-50 border-blue-200"
                                                                        : "bg-white border-gray-200"
                                                                }
                                                            `}
                                                                >
                                                                    <Text
                                                                        className={`
                                                                    text-sm
                                                                    ${
                                                                        selectedFilters[
                                                                            option
                                                                                .id
                                                                        ] ===
                                                                        subOption.id
                                                                            ? "text-blue-600 font-medium"
                                                                            : "text-gray-600"
                                                                    }
                                                                `}
                                                                    >
                                                                        {
                                                                            subOption.label
                                                                        }
                                                                    </Text>
                                                                </Pressable>
                                                            )
                                                        )}
                                                    </View>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </View>
                            </CardContent>
                        </ScrollView>
                    </View>

                    <View className='flex-row gap-3 p-6 pt-4'>
                        <Pressable
                            onPress={onClose}
                            className='flex-1 py-3 px-4 border border-gray-300 rounded-md items-center'
                        >
                            <Text className='text-gray-700 font-medium'>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleApplyFilters}
                            className='flex-1 py-3 px-4 bg-blue-600 rounded-md items-center'
                        >
                            <Text className='text-white font-medium'>
                                Apply Filters
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
