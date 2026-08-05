import CollectionRecordCard from "@/shared/components/cards/CollectionRecordCard";
import FloatingActionButton from "@/shared/components/ui/FloatingActionButton";
import SearchAndFilter from "@/shared/components/ui/SearchAndFilter";
import { useUserCurrency } from "@/shared/hooks/useUserCurrency";
import { CollectionRecord } from "@/features/books/types";
import { formatCurrency } from "@/shared/utils/utils";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";


import Snackbar from "@/shared/components/ui/Snackbar";
import { getUser, getUserPreferences, User } from "@/db/models/User";
import {
    getCollectBookEntries,
    getTotalCollectRemaining,
} from "@/features/books/api/book-entry.service";
import { Link, useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
// BanknoteArrowUpIcon removed

const DEFAULT_USER_ID = "1";

const FILTER_SORT_OPTIONS = {
    filter: [
        { id: "all", label: "All" },
        { id: "unpaid", label: "Unpaid" },
        { id: "partial", label: "Partially Paid" },
        { id: "paid", label: "Paid" },
    ],
    sort: [
        { id: "name_asc", label: "A to Z" },
        { id: "name_desc", label: "Z to A" },
        { id: "amount_asc", label: "Low to High" },
        { id: "amount_desc", label: "High to Low" },
        { id: "date_asc", label: "Oldest First" },
        { id: "date_desc", label: "Newest First" },
    ],
};

export default function ToCollectScreen() {
    const router = useRouter();
    const { currency } = useUserCurrency();
    const [searchQuery, setSearchQuery] = useState("");
    const [showPaid, setShowPaid] = useState(true);
    const params = useLocalSearchParams<{ filter: string; sort: string }>();
    const filterAndSort = {
        filter: params.filter ?? "all",
        sort: params.sort ?? "date_desc",
    };

    const [pageSnackbar, setPageSnackbar] = useState<{
        visible: boolean;
        message: string;
    }>({ visible: false, message: "" });

    // Collection records state (loaded from DB)
    const [collectionRecords, setCollectionRecords] = useState<
        CollectionRecord[]
    >([]);
    const [totalToCollect, setTotalToCollect] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // User data state
    const [, setUser] = useState<User | null>(null);

    const fetchRecords = useCallback(async () => {
        const [records, total] = await Promise.all([
            getCollectBookEntries(),
            getTotalCollectRemaining(),
        ]);
        return { records, total };
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            const [userData] = await Promise.all([
                getUser(DEFAULT_USER_ID),
                getUserPreferences(DEFAULT_USER_ID),
            ]);

            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, []);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        Promise.all([fetchRecords(), fetchUserData()])
            .then(([{ records, total }]) => {
                if (!isActive) return;
                setCollectionRecords(records);
                setTotalToCollect(total);
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });
        return () => {
            isActive = false;
        };
    }, [fetchRecords, fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            setIsLoading(true);
            Promise.all([fetchRecords(), fetchUserData()])
                .then(([{ records, total }]) => {
                    if (!isActive) return;
                    setCollectionRecords(records);
                    setTotalToCollect(total);
                })
                .finally(() => {
                    if (isActive) setIsLoading(false);
                });
            return () => {
                isActive = false;
            };
        }, [fetchRecords, fetchUserData])
    );

    const handleMarkCollection = (recordId: string) => {
        router.push({
            pathname: "/(main)/collect-book/confirm",
            params: { id: recordId },
        } as any);
    };




    const handleFilterAndSort = () => {
        router.push({
            pathname: "/(main)/collect-book/filter",
            params: filterAndSort,
        } as any);
    };

    const handleRemoveFilter = () => {
        router.setParams({ filter: "all" } as any);
    };

    const handleRemoveSort = () => {
        router.setParams({ sort: "date_desc" } as any);
    };

    const handleOption = (recordId: string) => {
        router.push({
            pathname: "/(main)/collect-book/options",
            params: { id: recordId },
        } as any);
    };
    // Derived visible records based on search/filter/sort
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = collectionRecords.filter((record) => {
        const matchesQuery =
            normalizedQuery.length === 0 ||
            record.name.toLowerCase().includes(normalizedQuery) ||
            record.category.toLowerCase().includes(normalizedQuery);
        // Map "paid" filter to "collected" status for collection records
        const statusToMatch =
            filterAndSort.filter === "paid"
                ? "collected"
                : filterAndSort.filter;
        const matchesStatus =
            filterAndSort.filter === "all" ||
            record.status === (statusToMatch as any);
        const matchesShowPaid = showPaid || record.status !== "collected";
        return matchesQuery && matchesStatus && matchesShowPaid;
    });

    const visibleRecords = [...filtered].sort((a, b) => {
        switch (filterAndSort.sort) {
            case "name_asc":
                return a.name.localeCompare(b.name);
            case "name_desc":
                return b.name.localeCompare(a.name);
            case "amount_asc":
                return a.amount - b.amount;
            case "amount_desc":
                return b.amount - a.amount;
            case "date_asc":
                return (
                    new Date(a.lentDate).getTime() -
                    new Date(b.lentDate).getTime()
                );
            case "date_desc":
                return (
                    new Date(b.lentDate).getTime() -
                    new Date(a.lentDate).getTime()
                );
            default:
                return 0;
        }
    });

    const activeFilterOption = FILTER_SORT_OPTIONS.filter.find(
        (f) =>
            f.id === filterAndSort.filter ||
            (f.id === "paid" && filterAndSort.filter === "collected")
    );
    const activeFilter =
        activeFilterOption && activeFilterOption.id !== "all"
            ? activeFilterOption
            : null;

    const activeSortOption = FILTER_SORT_OPTIONS.sort.find(
        (s) =>
            s.id === filterAndSort.sort ||
            (filterAndSort.sort === "oldest" && s.id === "date_asc") ||
            (filterAndSort.sort === "newest" && s.id === "date_desc")
    );
    const activeSort =
        activeSortOption && activeSortOption.id !== "date_desc"
            ? activeSortOption
            : null;


    const totalRemainingToCollect = formatCurrency(
        totalToCollect ?? 0,
        currency,
        2,
        ""
    );

    return (
        <View className='flex-1 bg-background'>
            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className='px-4 pt-2'>
                    {/* Header Section */}
                    <View className='mb-6'>
                        <View className='flex-row items-start justify-between mb-2'>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold uppercase tracking-[1px] text-primary-600 dark:text-primary-400'>
                                    Collections
                                </Text>
                                <Text className='mt-1 text-3xl font-bold text-foreground'>
                                    Collect Book
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Hero Summary Card */}
                    <View className='mb-6 min-h-2'>
                        <View className='rounded-3xl border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/20 py-4 shadow-md shadow-primary-500/5 flex flex-row items-center justify-between px-6 flex-wrap'>
                            <View>
                                <Text
                                    className='text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider'
                                    numberOfLines={1}
                                >
                                    Total to Collect
                                </Text>
                                <Text className='text-3xl font-bold text-primary-950 dark:text-primary-50'>
                                    {totalRemainingToCollect}
                                </Text>
                            </View>
                            {isLoading && (
                                <ActivityIndicator size="small" color="hsl(var(--primary-500))" />
                            )}
                        </View>
                    </View>
                </View>

                {/* Collection Records Section */}
                <View className='px-4 pb-6'>
                    <View className='mb-4 flex-row items-center justify-between'>
                        <View>
                            <Text className='text-xs font-semibold uppercase tracking-[1px] text-primary-600/70 dark:text-primary-400/70 mb-2'>
                                Records
                            </Text>
                            <Text className='text-xl font-bold text-foreground'>
                                Collection Entries
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setShowPaid(!showPaid)}
                            className='py-2 px-3 rounded-full bg-primary-100 dark:bg-primary-900 flex-row items-center gap-2'
                        >
                            <Text className="text-xs font-medium text-primary-700 dark:text-primary-300">
                                {showPaid ? 'Hide Collected' : 'Show Collected'}
                            </Text>
                            {showPaid ? (
                                <Eye size={20} className='text-primary-700 dark:text-primary-300' color="currentColor" />
                            ) : (
                                <EyeOff size={20} className='text-primary-700 dark:text-primary-300' color="currentColor" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className='mb-4'>
                        <SearchAndFilter
                            searchQuery={searchQuery}
                            totalRecords={collectionRecords.length}
                            filteredRecords={visibleRecords.length}
                            onSearch={(q) => setSearchQuery(q)}
                            setShowFilterAndSort={handleFilterAndSort}
                            activeFilter={activeFilter}
                            activeSort={activeSort}
                            onRemoveFilter={handleRemoveFilter}
                            onRemoveSort={handleRemoveSort}
                        />
                    </View>
                    <View className='flex flex-row items-center justify-between mb-4'>
                        <Text className='mt-1 text-sm font-medium text-muted-foreground'>
                            {visibleRecords.length} of{" "}
                            {collectionRecords.length} records
                        </Text>
                    </View>

                    {/* Collection Record Cards */}
                    <View className='flex gap-3 w-full'>
                        {isLoading ? (
                            <Text className='text-gray-500'>Loading...</Text>
                        ) : visibleRecords.length === 0 ? (
                            <Text className='text-gray-500'>
                                No collection entries.
                            </Text>
                        ) : (
                            visibleRecords.map((record) => (
                                <CollectionRecordCard
                                    key={record.id}
                                    record={record}
                                    onMarkCollection={handleMarkCollection}
                                    onOption={handleOption}
                                />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
            {/* Floating Action Button */}
            <Link href='/(screen)/collect-book/add' asChild>
                <FloatingActionButton
                    icon='+'
                    size='lg'
                    color='indigo'
                    position='bottom-right'
                    className='shadow-lg shadow-primary-500/20 mb-10'
                />
            </Link>


            <Snackbar
                visible={pageSnackbar.visible}
                message={pageSnackbar.message}
                onDismiss={() => setPageSnackbar({ ...pageSnackbar, visible: false })}
            />
        </View>
    );
}
