import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ListFilter, LucideIcon, Search, SortAsc } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Option } from "@/type/interface";

interface SearchAndFilterProps {
    searchQuery: string;
    totalRecords: number;
    filteredRecords: number;
    onSearch: () => void;
    setShowFilterAndSort: (show: boolean) => void;
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

type FilterType = "status" | "sort";

const FILTER_OPTIONS: {
    type: FilterType;
    options: Option[];
    icon: LucideIcon;
}[] = [
    {
        type: "status",
        options: STATUS_OPTIONS,
        icon: ListFilter,
    },
    {
        type: "sort",
        options: SORT_OPTIONS,
        icon: SortAsc,
    },
];

export default function SearchAndFilter({
    searchQuery,

    totalRecords,
    filteredRecords,
    onSearch,
    setShowFilterAndSort,
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
        <View className='flex flex-col gap-3 pb-3'>
            <View className='flex-row items-center bg-white rounded-xl shadow-sm border border-gray-100 w-full h-fit '>
                <View className='flex-1 flex-row items-center px-4  h-fit'>
                    <TextInput
                        placeholder='Search records...'
                        value={search}
                        onChangeText={setSearch}
                        className='flex-1 text-base text-gray-900 ml-2 border-none outline-none focus:ring-0 focus:ring-offset-0'
                        placeholderTextColor='#9CA3AF'
                    />
                </View>
                <Pressable
                    className='bg-blue-600 p-3 rounded-r-xl h-fit flex items-center justify-center'
                    onPress={onSearch}
                >
                    <Search size={24} color='#fff' />
                </Pressable>
            </View>

            <View className='flex gap-2'>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {FILTER_OPTIONS.map(
                        (filterOption: {
                            type: FilterType;
                            options: Option[];
                            icon: LucideIcon;
                        }) => {
                            const IconComponent = filterOption.icon;
                            return (
                                <Pressable
                                    key={filterOption.type}
                                    onPress={() => setShowFilterAndSort(true)}
                                    className='bg-white border border-gray-200 rounded-lg px-4 py-2 flex-row items-center gap-2'
                                >
                                    <Icon
                                        as={IconComponent}
                                        className='text-gray-700'
                                    />
                                    <Text className='text-sm text-gray-700'>
                                        {(
                                            searchandfilter[
                                                filterOption.type as keyof typeof searchandfilter
                                            ] as Option
                                        )?.label ?? ""}
                                    </Text>
                                </Pressable>
                            );
                        }
                    )}
                </ScrollView>

                <Text className='text-sm font-medium text-gray-500'>
                    {filteredRecords} of {totalRecords} records
                </Text>
            </View>
        </View>
    );
}
