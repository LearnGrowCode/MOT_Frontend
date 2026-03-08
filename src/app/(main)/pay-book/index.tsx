import PaymentRecordCard from "@/shared/components/cards/PaymentRecordCard";
import FloatingActionButton from "@/shared/components/ui/FloatingActionButton";
import SearchAndFilter from "@/shared/components/ui/SearchAndFilter";
import { useUserCurrency } from "@/shared/hooks/useUserCurrency";
import { PaymentRecord } from "@/features/books/types";
import { formatCurrency } from "@/shared/utils/utils";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import Snackbar from "@/shared/components/ui/Snackbar";
import { getUser, getUserPreferences, User } from "@/db/models/User";
import {
    getPayBookEntries,
    getTotalPayRemaining,
} from "@/features/books/api/book-entry.service";
import { Link, useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
// BanknoteArrowDownIcon removed

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

export default function ToPayScreen() {
    const router = useRouter();
    const { currency } = useUserCurrency();
    const [searchQuery, setSearchQuery] = useState("");
    const params = useLocalSearchParams<{ filter: string; sort: string }>();
    const filterAndSort = {
        filter: params.filter ?? "all",
        sort: params.sort ?? "date_desc",
    };

    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [pageSnackbar, setPageSnackbar] = useState<{
        visible: boolean;
        message: string;
    }>({ visible: false, message: "" });

    // Payment records state (loaded from DB)
    const [totalToPay, setTotalToPay] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // User data state
    const [, setUser] = useState<User | null>(null);

    const fetchRecords = useCallback(async () => {
        const [records, total] = await Promise.all([
            getPayBookEntries(),
            getTotalPayRemaining(),
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



    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            setIsLoading(true);
            Promise.all([fetchRecords(), fetchUserData()])
                .then(([{ records, total }]) => {
                    if (!isActive) return;
                    setPaymentRecords(records);
                    setTotalToPay(total);
                })
                .finally(() => {
                    if (isActive) setIsLoading(false);
                });
            return () => {
                isActive = false;
            };
        }, [fetchRecords, fetchUserData])
    );

    const handleMarkPayment = (recordId: string) => {
        router.push({
            pathname: "/(main)/pay-book/confirm",
            params: { id: recordId },
        } as any);
    };




    const handleFilterAndSort = () => {
        router.push({
            pathname: "/(main)/pay-book/filter",
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
            pathname: "/(main)/pay-book/options",
            params: { id: recordId },
        } as any);
    };

    // Derived visible records based on search/filter/sort
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = paymentRecords.filter((record) => {
        const matchesQuery =
            normalizedQuery.length === 0 ||
            record.name.toLowerCase().includes(normalizedQuery) ||
            record.category.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
            filterAndSort.filter === "all" ||
            record.status === (filterAndSort.filter as any);
        return matchesQuery && matchesStatus;
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
                    new Date(a.borrowedDate).getTime() -
                    new Date(b.borrowedDate).getTime()
                );
            case "date_desc":
                return (
                    new Date(b.borrowedDate).getTime() -
                    new Date(a.borrowedDate).getTime()
                );
            default:
                return 0;
        }
    });

    const activeFilterOption = FILTER_SORT_OPTIONS.filter.find(
        (f) => f.id === filterAndSort.filter
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


    const totalRemainingToPay = formatCurrency(
        totalToPay ?? 0,
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
                                <Text className='text-xs font-semibold uppercase tracking-[1px] text-tertiary-600 dark:text-tertiary-400'>
                                    Payments
                                </Text>
                                <Text className='mt-1 text-3xl font-bold text-foreground'>
                                    Pay Book
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Hero Summary Card */}
                    <View className='mb-6 min-h-2'>
                        <View className='rounded-3xl border border-tertiary-200 dark:border-tertiary-900 bg-tertiary-50 dark:bg-tertiary-950/20 py-4 shadow-md shadow-tertiary-500/5 flex flex-row items-center justify-between px-6 flex-wrap'>
                            <View>
                                <Text
                                    className='text-xs font-bold text-tertiary-600 dark:text-tertiary-400 mb-1 uppercase tracking-wider'
                                    numberOfLines={1}
                                >
                                    Total to Pay
                                </Text>
                                <Text className='text-3xl font-bold text-tertiary-950 dark:text-tertiary-50'>
                                    {totalRemainingToPay}
                                </Text>
                            </View>
                            {isLoading && (
                                <ActivityIndicator size="small" color="hsl(var(--tertiary-500))" />
                            )}
                        </View>
                    </View>
                </View>

                {/* Payment Records Section */}
                <View className='px-4 pb-6'>
                    <View className='mb-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-tertiary-600/70 dark:text-tertiary-400/70 mb-2'>
                            Records
                        </Text>
                        <Text className='text-xl font-bold text-foreground'>
                            Payment Entries
                        </Text>
                    </View>

                    <View className='rounded-2xl border border-border px-4 py-4 mb-4'>
                        <SearchAndFilter
                            searchQuery={searchQuery}
                            totalRecords={paymentRecords.length}
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
                            {paymentRecords.length} records
                        </Text>
                    </View>

                    {/* Payment Record Cards */}
                    <View className='flex gap-3 w-full'>
                        {isLoading ? (
                            <Text className='text-gray-500'>Loading...</Text>
                        ) : visibleRecords.length === 0 ? (
                            <Text className='text-gray-500'>
                                No payment entries.
                            </Text>
                        ) : (
                            visibleRecords.map((record) => (
                                <PaymentRecordCard
                                    key={record.id}
                                    record={record}
                                    onMarkPayment={handleMarkPayment}
                                    onOption={handleOption}
                                />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
            {/* Floating Action Button */}
            <Link href='/(screen)/pay-book/add' asChild>
                <FloatingActionButton
                    icon='+'
                    size='lg'
                    color='orange'
                    position='bottom-right'
                    className='shadow-lg shadow-tertiary-500/20 mb-10'
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
