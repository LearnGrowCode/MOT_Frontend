import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import CollectionRecordCard from "@/components/cards/CollectionRecordCard";
import { CollectionRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

import EditCollectionRecord from "@/components/modals/EditCollectionRecord";
import DeleteCollectionRecord from "@/components/modals/DeleteCollectionRecord";
import CollectionConfirmation from "@/components/modals/CollectionConfirmation";
import { Link, useFocusEffect } from "expo-router";
import { toCollectData } from "@/dummyData/constant";
import GreetingCard from "@/components/cards/GreetingCard";
import AmountSummaryCard from "@/components/cards/AmountSummaryCard";
import { BanknoteArrowUpIcon } from "lucide-react-native";
import FilterAndSort from "@/components/modals/FilterAndSort";
import CollectionOption from "@/components/modals/CollectionOption";
import {
    getCollectBookEntries,
    getTotalCollectRemaining,
} from "@/services/book/book-entry.service";
import { addSettlement, updateBookEntryWithPrincipal } from "@/db/models/Book";
import { uuidv4 } from "@/utils/uuid";

export default function ToCollectScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAndSort, setFilterAndSort] = useState<{
        filter: string;
        sort: string;
    }>({
        filter: "all",
        sort: "date_desc",
    });

    const [showEditRecord, setShowEditRecord] = useState(false);
    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showCollectionConfirmation, setShowCollectionConfirmation] =
        useState(false);
    const [showFilterAndSort, setShowFilterAndSort] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<CollectionRecord | null>(null);

    // Collection records state (loaded from DB)
    const [collectionRecords, setCollectionRecords] = useState<
        CollectionRecord[]
    >([]);
    const [totalToCollect, setTotalToCollect] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchRecords = useCallback(async () => {
        const [records, total] = await Promise.all([
            getCollectBookEntries(),
            getTotalCollectRemaining(),
        ]);
        return { records, total };
    }, []);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        fetchRecords()
            .then(({ records, total }) => {
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
    }, [fetchRecords]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            setIsLoading(true);
            fetchRecords()
                .then(({ records, total }) => {
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
        }, [fetchRecords])
    );

    const handleMarkCollection = (recordId: string) => {
        const record = collectionRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowCollectionConfirmation(true);
        }
    };

    const handleSaveRecord = async (updatedRecord: CollectionRecord) => {
        try {
            await updateBookEntryWithPrincipal({
                id: updatedRecord.id,
                counterparty: updatedRecord.name,
                principalAmount: updatedRecord.amount,
                currency: updatedRecord.category,
            });
            const { records, total } = await fetchRecords();
            setCollectionRecords(records);
            setTotalToCollect(total);
        } catch {
            setCollectionRecords((prev) =>
                prev.map((record) =>
                    record.id === updatedRecord.id ? updatedRecord : record
                )
            );
        } finally {
            setShowEditRecord(false);
            setSelectedRecord(null);
        }
    };

    const handleDeleteRecord = (recordId: string) => {
        setCollectionRecords((prev) =>
            prev.filter((record) => record.id !== recordId)
        );
        setShowDeleteRecord(false);
        setSelectedRecord(null);
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
        setShowEditRecord(true);
    };
    const handleDelete = () => {
        setShowDeleteRecord(true);
        setShowOption(false);
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

    return (
        <View className='flex-1'>
            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 96 }}
            >
                <View className='px-6 flex flex-col gap-6 py-6'>
                    <GreetingCard
                        userName={toCollectData.userName}
                        userAvatar={toCollectData.userAvatar}
                        greet={toCollectData.userGreeting}
                        subGreet={toCollectData.userGreetingMessage}
                    />
                    {/* Amount to Collect Summary */}
                    <AmountSummaryCard
                        amount={totalToCollect}
                        message={"Total remaining to collect"}
                    />
                </View>

                {/* Collection Records Section */}
                <View className='px-6 pb-6'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-lg font-bold text-gray-900'>
                            Collection Entries
                        </Text>
                        <Link href='/pay-book' asChild>
                            <Pressable className='bg-blue-600 px-4 py-2 rounded-full flex-row items-center gap-2'>
                                <BanknoteArrowUpIcon size={16} color='white' />
                                <Text className='text-white text-sm font-semibold'>
                                    Pay Book
                                </Text>
                            </Pressable>
                        </Link>
                    </View>

                    <SearchAndFilter
                        searchQuery={searchQuery}
                        totalRecords={collectionRecords.length}
                        filteredRecords={visibleRecords.length}
                        onSearch={(q) => setSearchQuery(q)}
                        setShowFilterAndSort={setShowFilterAndSort}
                    />

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
                    size='md'
                    color='green'
                    position='bottom-right'
                />
            </Link>

            <EditCollectionRecord
                visible={showEditRecord}
                onClose={() => setShowEditRecord(false)}
                onSaveRecord={handleSaveRecord}
                record={selectedRecord}
            />
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
                record={selectedRecord}
            />
        </View>
    );
}
