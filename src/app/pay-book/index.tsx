import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import PaymentRecordCard from "@/components/cards/PaymentRecordCard";
import { PaymentRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

import EditRecord from "@/components/modals/EditRecord";
import DeleteRecord from "@/components/modals/DeleteRecord";
import PaymentConfirmation from "@/components/modals/PaymentConfirmation";
import { Link, useFocusEffect } from "expo-router";
// import { toPayData } from "@/dummyData/constant";
import GreetingCard from "@/components/cards/GreetingCard";
import AmountSummaryCard from "@/components/cards/AmountSummaryCard";
import { BanknoteArrowDownIcon } from "lucide-react-native";
import FilterAndSort from "@/components/modals/FilterAndSort";
import Option from "@/components/modals/Option";
import {
    getPayBookEntries,
    getTotalPayRemaining,
} from "@/services/book/book-entry.service";
import { addSettlement, updateBookEntryWithPrincipal } from "@/db/models/Book";
import { uuidv4 } from "@/utils/uuid";

export default function ToPayScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAndSort, setFilterAndSort] = useState<{
        filter: string;
        sort: string;
    }>({
        filter: "all",
        sort: "date_desc",
    });

    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [showEditRecord, setShowEditRecord] = useState(false);
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

    const fetchRecords = useCallback(async () => {
        const [records, total] = await Promise.all([
            getPayBookEntries(),
            getTotalPayRemaining(),
        ]);
        return { records, total };
    }, []);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        fetchRecords()
            .then(({ records, total }) => {
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
    }, [fetchRecords]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            setIsLoading(true);
            fetchRecords()
                .then(({ records, total }) => {
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
        }, [fetchRecords])
    );

    const handleMarkPayment = (recordId: string) => {
        const record = paymentRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowPaymentConfirmation(true);
        }
    };

    const handleSaveRecord = async (updatedRecord: PaymentRecord) => {
        try {
            // Persist changes to DB with recalculated remaining based on settlements
            await updateBookEntryWithPrincipal({
                id: updatedRecord.id,
                counterparty: updatedRecord.name,
                principalAmount: updatedRecord.amount,
                currency: updatedRecord.category,
            });

            const { records, total } = await fetchRecords();
            setPaymentRecords(records);
            setTotalToPay(total);
        } catch {
            setPaymentRecords((prev) =>
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
        setPaymentRecords((prev) =>
            prev.filter((record) => record.id !== recordId)
        );
        setShowDeleteRecord(false);
        setSelectedRecord(null);
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
                // Still update UI even if there's an error (for now)
                const updatedRecord: PaymentRecord = {
                    ...selectedRecord,
                    remaining: Math.max(0, selectedRecord.remaining - amount),
                    status:
                        selectedRecord.remaining - amount <= 0
                            ? "paid"
                            : "partial",
                };
                setPaymentRecords((prev) =>
                    prev.map((record) =>
                        record.id === selectedRecord.id ? updatedRecord : record
                    )
                );
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
        setShowEditRecord(true);
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

    return (
        <View className='flex-1'>
            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 96 }}
            >
                <View className='px-6 flex flex-col gap-6 py-6'>
                    <GreetingCard
                        userName={"You"}
                        userAvatar={null}
                        greet={"Welcome back!"}
                        subGreet={"Track and settle your dues."}
                    />
                    {/* Amount to Pay Summary */}
                    <AmountSummaryCard
                        amount={totalToPay}
                        message={"Total remaining to pay"}
                    />
                </View>

                {/* Payment Records Section */}
                <View className='px-6 pb-6'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-lg font-bold text-gray-900'>
                            Payment Entries
                        </Text>
                        <Link href='/collect-book' asChild>
                            <Pressable className='bg-green-600 px-4 py-2 rounded-full flex-row items-center gap-2'>
                                <BanknoteArrowDownIcon
                                    size={16}
                                    color='white'
                                />
                                <Text className='text-white text-sm font-semibold'>
                                    Collect Book
                                </Text>
                            </Pressable>
                        </Link>
                    </View>

                    <SearchAndFilter
                        searchQuery={searchQuery}
                        totalRecords={paymentRecords.length}
                        filteredRecords={visibleRecords.length}
                        onSearch={(q) => setSearchQuery(q)}
                        setShowFilterAndSort={setShowFilterAndSort}
                    />

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
                    size='md'
                    color='blue'
                    position='bottom-right'
                />
            </Link>

            <EditRecord
                visible={showEditRecord}
                onClose={() => setShowEditRecord(false)}
                onSaveRecord={handleSaveRecord}
                record={selectedRecord}
            />
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
