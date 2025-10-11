import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { cn } from "@/lib/utils";

interface SearchAndFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterStatus: string;
    onFilterChange: (status: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    totalRecords: number;
    filteredRecords: number;
}

export default function SearchAndFilter({
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortBy,
    onSortChange,
    totalRecords,
    filteredRecords,
}: SearchAndFilterProps) {
    return (
        <View>
            {/* Search Bar */}
            <View className='mb-4'>
                <View className='flex-row items-center bg-gray-100 rounded-lg px-3 py-2'>
                    <Text className='text-gray-400 mr-2'>🔍</Text>
                    <TextInput
                        placeholder='Search by lender name...'
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        className='flex-1 text-base'
                        placeholderTextColor='#9CA3AF'
                    />
                </View>
            </View>

            {/* Filter Buttons */}
            <View className='flex-row items-center justify-between mb-4'>
                <View className='flex-row space-x-2'>
                    <Pressable
                        className={cn(
                            "px-3 py-2 rounded-lg flex-row items-center",
                            filterStatus === "all"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                        )}
                        onPress={() => onFilterChange("all")}
                    >
                        <Text className='text-gray-400 mr-1'>⚡</Text>
                        <Text
                            className={cn(
                                "text-sm font-medium",
                                filterStatus === "all"
                                    ? "text-blue-700"
                                    : "text-gray-600"
                            )}
                        >
                            All Status
                        </Text>
                    </Pressable>

                    <Pressable
                        className={cn(
                            "px-3 py-2 rounded-lg flex-row items-center",
                            sortBy === "newest" ? "bg-blue-100" : "bg-gray-100"
                        )}
                        onPress={() =>
                            onSortChange(
                                sortBy === "newest" ? "oldest" : "newest"
                            )
                        }
                    >
                        <Text className='text-gray-400 mr-1'>📅</Text>
                        <Text
                            className={cn(
                                "text-sm font-medium",
                                sortBy === "newest"
                                    ? "text-blue-700"
                                    : "text-gray-600"
                            )}
                        >
                            Date (
                            {sortBy === "newest"
                                ? "Newest First"
                                : "Oldest First"}
                            )
                        </Text>
                    </Pressable>
                </View>

                <Text className='text-sm text-gray-500'>
                    {filteredRecords} of {totalRecords} records
                </Text>
            </View>
        </View>
    );
}
