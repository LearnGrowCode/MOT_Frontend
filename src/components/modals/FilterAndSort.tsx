import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
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
    const [expandedOption, setExpandedOption] = useState<string | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string>
    >({});

    const handleOptionClick = (optionId: string) => {
        setExpandedOption(expandedOption === optionId ? null : optionId);
    };

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
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-end items-center'>
                <Card className='w-full max-h-[90%] rounded-t-2xl bg-white'>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-semibold'>
                            Filter & Sort
                        </CardTitle>
                        <Pressable onPress={onClose} className='p-1'>
                            <Text className='text-xl font-bold text-gray-500'>
                                ×
                            </Text>
                        </Pressable>
                    </CardHeader>

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='space-y-4'>
                            <View className='flex flex-col gap-2'>
                                <Text className='text-base font-medium'>
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
                                        {option.subOptions.map((subOption) => (
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
                                        ))}
                                    </View>
                                ))}
                            </View>
                            <Text className='text-base font-medium'>Sort</Text>
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
                                            <View className='flex flex-row flex-wrap gap-2'>
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
                                                                py-2 px-4
                                                                rounded-lg
                                                                border
                                                                transition-all
                                                                active:scale-95
                                                                ${selectedFilters[option.id] === subOption.id 
                                                                    ? "bg-blue-50 border-blue-200" 
                                                                    : "bg-white border-gray-200"
                                                                }
                                                            `}
                                                        >
                                                            <Text
                                                                className={`
                                                                    text-sm
                                                                    ${selectedFilters[option.id] === subOption.id
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
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </ScrollView>

                    <View className='flex-row space-x-3 p-6 pt-4'>
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
