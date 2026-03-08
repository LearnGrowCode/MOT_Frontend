import { ListFilter, Search, XCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";

interface SearchAndFilterProps {
    searchQuery: string;
    totalRecords: number;
    filteredRecords: number;
    onSearch: (query: string) => void;
    setShowFilterAndSort: (show: boolean) => void;
    activeFilter?: { id: string; label: string } | null;
    activeSort?: { id: string; label: string } | null;
    onRemoveFilter?: () => void;
    onRemoveSort?: () => void;
}

// Reserved for future inline filter options

const DEBOUNCE_DELAY = 400;

export default function SearchAndFilter({
    searchQuery,
    totalRecords,
    filteredRecords,
    onSearch,
    setShowFilterAndSort,
    activeFilter,
    activeSort,
    onRemoveFilter,
    onRemoveSort,
}: SearchAndFilterProps) {
    const isDarkMode = useColorScheme() === "dark";
    const [search, setSearch] = useState(searchQuery);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastEmitted = useRef(searchQuery);

    useEffect(() => {
        setSearch(searchQuery);
        lastEmitted.current = searchQuery;
    }, [searchQuery]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            if (search === lastEmitted.current) return;
            lastEmitted.current = search;
            onSearch(search);
        }, DEBOUNCE_DELAY);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, onSearch]);

    const handleClearSearch = () => {
        setSearch("");
        lastEmitted.current = "";
        onSearch("");
    };

    return (
        <View className='flex flex-row flex-wrap gap-3 pb-3'>
            <View className='flex-row  items-center bg-card rounded-2xl shadow-sm border border-border w-full h-fit px-4 py-2'>
                <Search size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                <TextInput
                    placeholder='Search records...'
                    value={search}
                    onChangeText={setSearch}
                    className='flex-1 text-base text-foreground ml-3'
                    placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    returnKeyType='search'
                />
                {search.length > 0 && (
                    <Pressable
                        onPress={handleClearSearch}
                        className='flex-row items-center gap-1 bg-muted px-3 py-1.5 rounded-full'
                        accessibilityLabel='Clear search'
                    >
                        <XCircle size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                        <Text className='text-sm font-medium text-muted-foreground'>
                            Clear
                        </Text>
                    </Pressable>
                )}
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
                        className='bg-card border border-border rounded-lg px-4 py-2 flex-row items-center gap-2 active:bg-accent'
                    >
                        <ListFilter size={24} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
                        <Text className='text-sm text-foreground'>
                            Filter and sort
                        </Text>
                    </Pressable>
                    
                    {activeFilter && onRemoveFilter && (
                        <Pressable
                            onPress={onRemoveFilter}
                            className='bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex-row items-center gap-1.5 active:bg-primary/20'
                        >
                            <Text className='text-sm font-semibold tracking-tight text-primary'>
                                {activeFilter.label}
                            </Text>
                            <XCircle size={14} color={isDarkMode ? "#cbd5e1" : "#475569"} />
                        </Pressable>
                    )}
                    
                    {activeSort && onRemoveSort && (
                        <Pressable
                            onPress={onRemoveSort}
                            className='bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex-row items-center gap-1.5 active:bg-primary/20'
                        >
                            <Text className='text-sm font-semibold tracking-tight text-primary'>
                                {activeSort.label}
                            </Text>
                            <XCircle size={14} color={isDarkMode ? "#cbd5e1" : "#475569"} />
                        </Pressable>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
