import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react-native";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

interface SearchAndFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterStatus: string;
    onFilterChange: (status: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    totalRecords: number;
    filteredRecords: number;
    onSearch: () => void;
}
interface Option {
    label: string;
    value: string;
}

const STATUS_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Unpaid", value: "unpaid" },
    { label: "Paid", value: "paid" },
    { label: "Partial Paid", value: "partial" },
    { label: "Completed", value: "completed" },
    { label: "Overdue", value: "overdue" },
    { label: "In Date", value: "in_date" },
] as Option[];

const SORT_OPTIONS = [
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Date (Newest)", value: "date_desc" },
    { label: "Date (Oldest)", value: "date_asc" },
] as Option[];

export default function SearchAndFilter({
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortBy,
    onSortChange,
    totalRecords,
    filteredRecords,
    onSearch,
}: SearchAndFilterProps) {
    const [searchandfilter, setSearchandfilter] = useState<{
        search: string;
        status: Option;
        sort: Option;
    }>({
        search: "",
        status: STATUS_OPTIONS[0],
        sort: SORT_OPTIONS[0],
    });
    const [search, setSearch] = useState(searchQuery);
    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);
    return (
        <View className='space-y-4 p-4 bg-gray-50 rounded-xl'>
            <View className='flex-row items-center bg-white rounded-xl shadow-sm border border-gray-100'>
                <View className='flex-1 flex-row items-center px-4 py-3'>
                    <TextInput
                        placeholder='Search records...'
                        value={search}
                        onChangeText={setSearch}
                        className='flex-1 text-base text-gray-900 ml-2 border-none outline-none focus:ring-0 focus:ring-offset-0'
                        placeholderTextColor='#9CA3AF'
                    />
                </View>
                <Pressable
                    className='bg-blue-600 p-3 rounded-r-xl'
                    onPress={onSearch}
                >
                    <Search size={24} color='white' />
                </Pressable>
            </View>

            <View className='space-y-4'>
                <View className='flex-row items-center justify-between flex-wrap gap-3'>
                    <View className='flex-row flex-wrap gap-2'>
                        <View className='flex-shrink'>
                            <Select
                                value={
                                    STATUS_OPTIONS.find(
                                        (opt) =>
                                            opt.value ===
                                            (searchandfilter.status.value ||
                                                "all")
                                    ) || STATUS_OPTIONS[0]
                                }
                                onValueChange={(option) =>
                                    setSearchandfilter({
                                        ...searchandfilter,
                                        status:
                                            STATUS_OPTIONS.find(
                                                (opt) =>
                                                    opt.value ===
                                                    (option?.value ||
                                                        "name_asc")
                                            ) ||
                                            (STATUS_OPTIONS[0] as (typeof STATUS_OPTIONS)[0] as Option),
                                    })
                                }
                                className='bg-white border border-gray-200 rounded-lg'
                            >
                                <SelectTrigger className='bg-white border border-gray-200 rounded-lg w-full'>
                                    <ListFilter />
                                    <Text className='text-sm text-gray-700 '>
                                        {searchandfilter.status.label}
                                    </Text>
                                </SelectTrigger>
                                <SelectContent className='bg-white border border-gray-200 rounded-lg'>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </SelectContent>
                            </Select>
                        </View>

                        <View className='flex-1'>
                            <Select
                                value={
                                    SORT_OPTIONS.find(
                                        (opt) =>
                                            opt.value ===
                                            (searchandfilter.sort.value ||
                                                "name_asc")
                                    ) || SORT_OPTIONS[0]
                                }
                                onValueChange={(option) =>
                                    setSearchandfilter({
                                        ...searchandfilter,
                                        sort:
                                            SORT_OPTIONS.find(
                                                (opt) =>
                                                    opt.value ===
                                                    (option?.value ||
                                                        "name_asc")
                                            ) ||
                                            (SORT_OPTIONS[0] as (typeof SORT_OPTIONS)[0] as Option),
                                    })
                                }
                                className='bg-white border border-gray-200 rounded-lg'
                            >
                                <SelectTrigger className='bg-white border border-gray-200 rounded-lg w-full'>
                                    <ArrowDownWideNarrow />
                                    <Text className='text-sm text-gray-700  w-full'>
                                        {searchandfilter.sort.label}
                                    </Text>
                                </SelectTrigger>
                                <SelectContent className='bg-white border border-gray-200 rounded-lg'>
                                    {SORT_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </SelectContent>
                            </Select>
                        </View>
                    </View>

                    <Text className='text-sm font-medium text-gray-500'>
                        {filteredRecords} of {totalRecords} records
                    </Text>
                </View>
            </View>
        </View>
    );
}
