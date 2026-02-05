import PaymentRecordCard from "@/components/cards/PaymentRecordCard";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { PaymentRecord } from "@/type/interface";
import { formatCurrency } from "@/utils/utils";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import DeleteRecord from "@/components/modals/DeleteRecord";
import FilterAndSort from "@/components/modals/FilterAndSort";
import Option from "@/components/modals/Option";
import PaymentConfirmation from "@/components/modals/PaymentConfirmation";
import {
    addSettlement,
    softDeleteBookEntry
} from "@/db/models/Book";
import { getUser, getUserPreferences, User } from "@/db/models/User";
import {
    getPayBookEntries,
    getTotalPayRemaining,
} from "@/services/book/book-entry.service";
import { uuidv4 } from "@/utils/uuid";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { BanknoteArrowDownIcon } from "lucide-react-native";

const DEFAULT_USER_ID = "1";

export default function ToPayScreen() {
    const router = useRouter();
    const { currency } = useUserCurrency();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAndSort, setFilterAndSort] = useState<{
        filter: string;
        sort: string;
    }>({
        filter: "all",
        sort: "date_desc",
    });

    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showPaymentConfirmation, setShowPaymentConfirmation] =
        useState(false);
    const [showFilterAndSort, setShowFilterAndSort] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(
        null
    );

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
        const record = paymentRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowPaymentConfirmation(true);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        try {
            await softDeleteBookEntry(recordId);
            const { records, total } = await fetchRecords();
            setPaymentRecords(records);
            setTotalToPay(total);
        } catch (error) {
            console.error("Error deleting record:", error);
            setPaymentRecords((prev) =>
                prev.filter((record) => record.id !== recordId)
            );
        } finally {
            setShowDeleteRecord(false);
            setSelectedRecord(null);
        }
    };

    const handleConfirmPayment = async (amount: number, payer: string) => {
        if (selectedRecord && amount > 0) {
            try {
                // Create settlement in database
                await addSettlement({
                    id: uuidv4(),
                    bookEntryId: selectedRecord.id,
                    amount: amount,
                    date: Date.now(),
                    description: `Payment from ${payer}`,
                });

                const { records, total } = await fetchRecords();
                setPaymentRecords(records);
                setTotalToPay(total);
            } catch (error) {
                console.error("Error adding settlement:", error);
                // On error, let the user know (could add an alert here)
                console.error("Failed to save settlement to DB");
            }
        }
        setShowPaymentConfirmation(false);
        setSelectedRecord(null);
    };

    const handleFilterAndSort = (filters: {
        filter?: string;
        sort?: string;
    }) => {
        if (filters) {
            if (filters.filter) {
                setFilterAndSort((prev) => ({
                    ...prev,
                    filter: filters.filter!,
                }));
            }
            if (filters.sort) {
                setFilterAndSort((prev) => ({
                    ...prev,
                    sort: filters.sort!,
                }));
            }
        }
        setShowFilterAndSort(false);
    };

    const handleEdit = () => {
        setShowOption(false);
        if (selectedRecord) {
            router.push({
                pathname: "/pay-book/edit-record",
                params: { id: selectedRecord.id },
            } as any);
        }
        setSelectedRecord(null);
    };
    const handleDelete = () => {
        setShowDeleteRecord(true);
        setShowOption(false);
    };
    const handleOption = (recordId: string) => {
        setShowOption(true);
        setSelectedRecord(
            paymentRecords.find((r) => r.id === recordId) as PaymentRecord
        );
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
                                <Text className='text-xs font-semibold uppercase tracking-[1px] text-orange-600 dark:text-orange-400'>
                                    Payments
                                </Text>
                                <Text className='mt-1 text-3xl font-bold text-foreground'>
                                    Pay Book
                                </Text>
                            </View>
                            <Link href='/collect-book' asChild>
                                <Pressable className='bg-brand-indigo px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-md shadow-brand-indigo/25 ml-4'>
                                    <BanknoteArrowDownIcon
                                        size={18}
                                        color='white'
                                    />
                                    <Text className='text-white text-sm font-semibold'>
                                        Collect
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>

                    {/* Hero Summary Card */}
                    <View className='mb-6 min-h-2'>
                        <View className='rounded-3xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 py-4 shadow-lg shadow-orange-500/10 flex flex-row items-center justify-between px-6 flex-wrap'>
                            <View>
                                <Text
                                    className='text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider'
                                    numberOfLines={1}
                                >
                                    Total to Pay
                                </Text>
                                <Text className='text-3xl font-bold text-orange-950 dark:text-orange-50'>
                                    {totalRemainingToPay}
                                </Text>
                            </View>
                            {isLoading && (
                                <ActivityIndicator size="small" color="#f97316" />
                            )}
                        </View>
                    </View>
                </View>

                {/* Payment Records Section */}
                <View className='px-4 pb-6'>
                    <View className='mb-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-orange-600/70 dark:text-orange-400/70 mb-2'>
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
                            setShowFilterAndSort={setShowFilterAndSort}
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
            <Link href='/pay-book/add-record' asChild>
                <FloatingActionButton
                    icon='+'
                    size='lg'
                    color='orange'
                    position='bottom-right'
                    className='shadow-2xl shadow-orange-500/40'
                />
            </Link>

            <DeleteRecord
                visible={showDeleteRecord}
                onClose={() => setShowDeleteRecord(false)}
                onDeleteRecord={handleDeleteRecord}
                record={selectedRecord}
            />
            <PaymentConfirmation
                visible={showPaymentConfirmation}
                onClose={() => setShowPaymentConfirmation(false)}
                onConfirmPayment={handleConfirmPayment}
                record={selectedRecord}
            />
            <FilterAndSort
                visible={showFilterAndSort}
                onClose={() => setShowFilterAndSort(false)}
                onFilterAndSort={handleFilterAndSort}
                filterAndSort={filterAndSort}
            />
            <Option
                visible={showOption}
                onClose={() => setShowOption(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                record={selectedRecord}
            />
        </View>
    );
}
