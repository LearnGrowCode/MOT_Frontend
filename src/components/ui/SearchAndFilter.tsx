import { ListFilter, Search, XCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useColorScheme } from "nativewind";

interface SearchAndFilterProps {
    searchQuery: string;
    totalRecords: number;
    filteredRecords: number;
    onSearch: (query: string) => void;
    setShowFilterAndSort: (show: boolean) => void;
}

// Reserved for future inline filter options

const DEBOUNCE_DELAY = 400;

export default function SearchAndFilter({
    searchQuery,
    totalRecords,
    filteredRecords,
    onSearch,
    setShowFilterAndSort,
}: SearchAndFilterProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
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
                <Search size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                <TextInput
                    placeholder='Search records...'
                    value={search}
                    onChangeText={setSearch}
                    className='flex-1 text-base text-foreground ml-3'
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    returnKeyType='search'
                />
                {search.length > 0 && (
                    <Pressable
                        onPress={handleClearSearch}
                        className='flex-row items-center gap-1 bg-muted px-3 py-1.5 rounded-full'
                        accessibilityLabel='Clear search'
                    >
                        <XCircle size={16} color={isDark ? "#94a3b8" : "#64748b"} />
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
                        <ListFilter size={24} color={isDark ? "#f8fafc" : "#1e293b"} />
                        <Text className='text-sm text-foreground'>
                            Filter and sort
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>
        </View>
    );
}
