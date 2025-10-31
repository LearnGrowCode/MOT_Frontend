import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ListFilter, Search } from "lucide-react-native";

interface SearchAndFilterProps {
    searchQuery: string;
    totalRecords: number;
    filteredRecords: number;
    onSearch: (query: string) => void;
    setShowFilterAndSort: (show: boolean) => void;
}

// Reserved for future inline filter options

export default function SearchAndFilter({
    searchQuery,

    totalRecords,
    filteredRecords,
    onSearch,
    setShowFilterAndSort,
}: SearchAndFilterProps) {
    // Controlled locally; lifted via onSearch when user triggers search
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
                    onPress={() => onSearch(search)}
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
                    <Pressable
                        key={"filter-and-sort"}
                        onPress={() => setShowFilterAndSort(true)}
                        className='bg-white border border-gray-200 rounded-lg px-4 py-2 flex-row items-center gap-2'
                    >
                        <ListFilter size={24} color='#000' />
                        <Text className='text-sm text-gray-700'>
                            Filter and sort
                        </Text>
                    </Pressable>
                </ScrollView>

                <Text className='text-sm font-medium text-gray-500'>
                    {filteredRecords} of {totalRecords} records
                </Text>
            </View>
        </View>
    );
}
