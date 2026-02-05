import CollectionRecordCard from "@/components/cards/CollectionRecordCard";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { CollectionRecord } from "@/type/interface";
import { formatCurrency } from "@/utils/utils";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from "react-native";

import CollectionConfirmation from "@/components/modals/CollectionConfirmation";
import CollectionOption from "@/components/modals/CollectionOption";
import DeleteCollectionRecord from "@/components/modals/DeleteCollectionRecord";
import FilterAndSort from "@/components/modals/FilterAndSort";
import ReminderModal from "@/components/modals/ReminderModal";
import { addSettlement, softDeleteBookEntry } from "@/db/models/Book";
import { getUser, getUserPreferences, User } from "@/db/models/User";
import {
    getCollectBookEntries,
    getTotalCollectRemaining,
} from "@/services/book/book-entry.service";
import { uuidv4 } from "@/utils/uuid";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { BanknoteArrowUpIcon } from "lucide-react-native";

const DEFAULT_USER_ID = "1";

export default function ToCollectScreen() {
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

    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showCollectionConfirmation, setShowCollectionConfirmation] =
        useState(false);
    const [showFilterAndSort, setShowFilterAndSort] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<CollectionRecord | null>(null);

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
        const record = collectionRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowCollectionConfirmation(true);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        try {
            await softDeleteBookEntry(recordId);
            const { records, total } = await fetchRecords();
            setCollectionRecords(records);
            setTotalToCollect(total);
        } catch (error) {
            console.error("Error deleting record:", error);
            setCollectionRecords((prev) =>
                prev.filter((record) => record.id !== recordId)
            );
        } finally {
            setShowDeleteRecord(false);
            setSelectedRecord(null);
        }
    };

    const handleConfirmCollection = async (
        amount: number,
        collector: string
    ) => {
        if (selectedRecord && amount > 0) {
            try {
                await addSettlement({
                    id: uuidv4(),
                    bookEntryId: selectedRecord.id,
                    amount: amount,
                    date: Date.now(),
                    description: `Collection from ${collector}`,
                });
                const { records, total } = await fetchRecords();
                setCollectionRecords(records);
                setTotalToCollect(total);
            } catch {
                const updatedRecord: CollectionRecord = {
                    ...selectedRecord,
                    remaining: Math.max(0, selectedRecord.remaining - amount),
                    status:
                        selectedRecord.remaining - amount <= 0
                            ? "collected"
                            : "partial",
                };
                setCollectionRecords((prev) =>
                    prev.map((record) =>
                        record.id === selectedRecord.id ? updatedRecord : record
                    )
                );
            }
        }
        setShowCollectionConfirmation(false);
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
                pathname: "/collect-book/edit-record",
                params: { id: selectedRecord.id },
            } as any);
        }
        setSelectedRecord(null);
    };
    const handleDelete = () => {
        setShowDeleteRecord(true);
        setShowOption(false);
    };
    const handleSendReminderPress = () => {
        setShowOption(false);
        setShowReminderModal(true);
    };
    const handleSendReminder = async (message: string) => {
        if (!selectedRecord || !message) {
            setShowReminderModal(false);
            return;
        }
        try {
            await Share.share({ message });
        } catch (error) {
            console.error("Error sharing reminder:", error);
            Alert.alert(
                "Unable to share reminder",
                "Please try again in a moment."
            );
        } finally {
            setShowReminderModal(false);
        }
    };
    const handleOption = (recordId: string) => {
        setShowOption(true);
        setSelectedRecord(
            collectionRecords.find((r) => r.id === recordId) as CollectionRecord
        );
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
                                <Text className='text-xs font-semibold uppercase tracking-[1px] text-indigo-600 dark:text-indigo-400'>
                                    Collections
                                </Text>
                                <Text className='mt-1 text-3xl font-bold text-foreground'>
                                    Collect Book
                                </Text>
                            </View>
                            <Link href='/pay-book' asChild>
                                <Pressable className='bg-brand-orange px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-md shadow-brand-orange/25 ml-4'>
                                    <BanknoteArrowUpIcon
                                        size={18}
                                        color='white'
                                    />
                                    <Text className='text-white text-sm font-semibold'>
                                        Pay
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>

                    {/* Hero Summary Card */}
                    <View className='mb-6 min-h-2'>
                        <View className='rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 py-4 shadow-lg shadow-indigo-500/10 flex flex-row items-center justify-between px-6 flex-wrap'>
                            <View>
                                <Text
                                    className='text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider'
                                    numberOfLines={1}
                                >
                                    Total to Collect
                                </Text>
                                <Text className='text-3xl font-bold text-indigo-950 dark:text-indigo-50'>
                                    {totalRemainingToCollect}
                                </Text>
                            </View>
                            {isLoading && (
                                <ActivityIndicator size="small" color="#6366f1" />
                            )}
                        </View>
                    </View>
                </View>

                {/* Collection Records Section */}
                <View className='px-4 pb-6'>
                    <View className='mb-4'>
                        <Text className='text-xs font-semibold uppercase tracking-[1px] text-indigo-600/70 dark:text-indigo-400/70 mb-2'>
                            Records
                        </Text>
                        <Text className='text-xl font-bold text-foreground'>
                            Collection Entries
                        </Text>
                    </View>

                    <View className='rounded-2xl border border-border bg-card/50 px-4 py-4 shadow-sm mb-4'>
                        <SearchAndFilter
                            searchQuery={searchQuery}
                            totalRecords={collectionRecords.length}
                            filteredRecords={visibleRecords.length}
                            onSearch={(q) => setSearchQuery(q)}
                            setShowFilterAndSort={setShowFilterAndSort}
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
            <Link href='/collect-book/add-record' asChild>
                <FloatingActionButton
                    icon='+'
                    size='lg'
                    color='indigo'
                    position='bottom-right'
                    className='shadow-2xl shadow-indigo-600/40'
                />
            </Link>

            <DeleteCollectionRecord
                visible={showDeleteRecord}
                onClose={() => setShowDeleteRecord(false)}
                onDeleteRecord={handleDeleteRecord}
                record={selectedRecord}
            />
            <CollectionConfirmation
                visible={showCollectionConfirmation}
                onClose={() => setShowCollectionConfirmation(false)}
                onConfirmCollection={handleConfirmCollection}
                record={selectedRecord}
            />
            <FilterAndSort
                visible={showFilterAndSort}
                onClose={() => setShowFilterAndSort(false)}
                onFilterAndSort={handleFilterAndSort}
                filterAndSort={filterAndSort}
            />
            <CollectionOption
                visible={showOption}
                onClose={() => setShowOption(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSendReminder={handleSendReminderPress}
                record={selectedRecord}
            />
            <ReminderModal
                visible={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                record={selectedRecord}
                onSendReminder={handleSendReminder}
            />
        </View>
    );
}
