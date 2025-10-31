import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import CollectionRecordCard from "@/components/cards/CollectionRecordCard";
import { CollectionRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

import EditCollectionRecord from "@/components/modals/EditCollectionRecord";
import DeleteCollectionRecord from "@/components/modals/DeleteCollectionRecord";
import CollectionConfirmation from "@/components/modals/CollectionConfirmation";
import { Link } from "expo-router";
import { toCollectData } from "@/dummyData/constant";
import GreetingCard from "@/components/cards/GreetingCard";
import AmountSummaryCard from "@/components/cards/AmountSummaryCard";
import { BanknoteArrowUpIcon } from "lucide-react-native";
import FilterAndSort from "@/components/modals/FilterAndSort";
import CollectionOption from "@/components/modals/CollectionOption";

export default function ToCollectScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus] = useState("all");
    const [sortBy] = useState("newest");

    const [showEditRecord, setShowEditRecord] = useState(false);
    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showCollectionConfirmation, setShowCollectionConfirmation] =
        useState(false);
    const [showFilterAndSort, setShowFilterAndSort] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<CollectionRecord | null>(null);

    // Collection records state
    const [collectionRecords, setCollectionRecords] = useState<
        CollectionRecord[]
    >(toCollectData.userCollectionRecords as unknown as CollectionRecord[]);

    const handleMarkCollection = (recordId: string) => {
        const record = collectionRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowCollectionConfirmation(true);
        }
    };

    const handleSaveRecord = (updatedRecord: CollectionRecord) => {
        setCollectionRecords((prev) =>
            prev.map((record) =>
                record.id === updatedRecord.id ? updatedRecord : record
            )
        );
        setShowEditRecord(false);
        setSelectedRecord(null);
    };

    const handleDeleteRecord = (recordId: string) => {
        setCollectionRecords((prev) =>
            prev.filter((record) => record.id !== recordId)
        );
        setShowDeleteRecord(false);
        setSelectedRecord(null);
    };

    const handleConfirmCollection = (amount: number, collector: string) => {
        if (selectedRecord) {
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
        setShowCollectionConfirmation(false);
        setSelectedRecord(null);
    };

    const handleFilterAndSort = (filters: any) => {
        console.log(filters);
    };

    const handleEdit = () => {
        setShowOption(false);
        setShowEditRecord(true);
        setShowOption(false);
        setSelectedRecord(null);
    };
    const handleDelete = () => {
        setShowDeleteRecord(true);
        setShowOption(false);
        setSelectedRecord(null);
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
        const matchesStatus =
            filterStatus === "all" || record.status === (filterStatus as any);
        return matchesQuery && matchesStatus;
    });

    const visibleRecords = [...filtered].sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);
        if (sortBy === "oldest")
            return (
                new Date(a.lentDate).getTime() - new Date(b.lentDate).getTime()
            );
        // newest default
        return new Date(b.lentDate).getTime() - new Date(a.lentDate).getTime();
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
                        amount={toCollectData.userAmountToCollect}
                        message={toCollectData.userAmountToCollectMessage}
                    />
                </View>

                {/* Collection Records Section */}
                <View className='px-6 pb-6'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-lg font-bold text-gray-900'>
                            Collection Entries
                        </Text>
                        <Link href='/(auth)/pay-book' asChild>
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
                        {visibleRecords.map((record) => (
                            <CollectionRecordCard
                                key={record.id}
                                record={record}
                                onMarkCollection={handleMarkCollection}
                                onOption={handleOption}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
            {/* Floating Action Button */}
            <Link href='/(auth)/collect-book/add-record' asChild>
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
