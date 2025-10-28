import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import PaymentRecordCard from "@/components/cards/PaymentRecordCard";
import { PaymentRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

import EditRecord from "@/components/modals/EditRecord";
import DeleteRecord from "@/components/modals/DeleteRecord";
import PaymentConfirmation from "@/components/modals/PaymentConfirmation";
import { Link } from "expo-router";
import { toPayData } from "@/dummyData/constant";
import GreetingCard from "@/components/cards/GreetingCard";
import AmountSummaryCard from "@/components/cards/AmountSummaryCard";
import { BanknoteArrowDownIcon } from "lucide-react-native";
import FilterAndSort from "@/components/modals/FilterAndSort";
import Option from "@/components/modals/Option";

export default function ToPayScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [showEditRecord, setShowEditRecord] = useState(false);
    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showPaymentConfirmation, setShowPaymentConfirmation] =
        useState(false);
    const [showFilterAndSort, setShowFilterAndSort] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(
        null
    );

    // Payment records state
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(
        toPayData.userPaymentRecords as unknown as PaymentRecord[]
    );

    const handleMarkPayment = (recordId: string) => {
        const record = paymentRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            setShowPaymentConfirmation(true);
        }
    };

    const handleSaveRecord = (updatedRecord: PaymentRecord) => {
        setPaymentRecords((prev) =>
            prev.map((record) =>
                record.id === updatedRecord.id ? updatedRecord : record
            )
        );
        setShowEditRecord(false);
        setSelectedRecord(null);
    };

    const handleDeleteRecord = (recordId: string) => {
        setPaymentRecords((prev) =>
            prev.filter((record) => record.id !== recordId)
        );
        setShowDeleteRecord(false);
        setSelectedRecord(null);
    };

    const handleConfirmPayment = (amount: number, payer: string) => {
        if (selectedRecord) {
            const updatedRecord: PaymentRecord = {
                ...selectedRecord,
                remaining: Math.max(0, selectedRecord.remaining - amount),
                status:
                    selectedRecord.remaining - amount <= 0 ? "paid" : "partial",
            };
            setPaymentRecords((prev) =>
                prev.map((record) =>
                    record.id === selectedRecord.id ? updatedRecord : record
                )
            );
        }
        setShowPaymentConfirmation(false);
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
            paymentRecords.find((r) => r.id === recordId) as PaymentRecord
        );
    };
    return (
        <View className='flex-1'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <View className='px-6 flex flex-col gap-6 py-6'>
                    <GreetingCard
                        userName={toPayData.userName}
                        userAvatar={toPayData.userAvatar}
                        greet={toPayData.userGreeting}
                        subGreet={toPayData.userGreetingMessage}
                    />
                    {/* Amount to Pay Summary */}
                    <AmountSummaryCard
                        amount={toPayData.userAmountToPay}
                        message={toPayData.userAmountToPayMessage}
                    />
                </View>

                {/* Payment Records Section */}
                <View className='px-6'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-lg font-bold text-gray-900'>
                            Payment Entries
                        </Text>
                        <Link
                            href='/(auth)/collect-book'
                            asChild
                            className='bg-blue-600 px-4 py-2 rounded-lg flex-row items-center'
                        >
                            <View className='flex-row items-center gap-2'>
                                <BanknoteArrowDownIcon
                                    size={16}
                                    color='white'
                                />
                                <Text className='text-white text-sm font-medium '>
                                    Collect Book
                                </Text>
                            </View>
                        </Link>
                    </View>

                    <SearchAndFilter
                        searchQuery={""}
                        totalRecords={0}
                        filteredRecords={0}
                        onSearch={() => {
                            console.log("search");
                        }}
                        setShowFilterAndSort={setShowFilterAndSort}
                    />

                    {/* Payment Record Cards */}
                    <View className='flex gap-3 w-full'>
                        {paymentRecords.map((record) => (
                            <PaymentRecordCard
                                key={record.id}
                                record={record}
                                onMarkPayment={handleMarkPayment}
                                onOption={handleOption}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
            {/* Floating Action Button */}
            <Link href='/(auth)/pay-book/add-record' asChild>
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
