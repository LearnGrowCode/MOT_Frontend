import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import PaymentRecordCard from "@/components/cards/PaymentRecordCard";
import { PaymentRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import AddRecord from "@/components/modals/AddRecord";
import EditRecord from "@/components/modals/EditRecord";
import DeleteRecord from "@/components/modals/DeleteRecord";
import PaymentConfirmation from "@/components/modals/PaymentConfirmation";
import { Link } from "expo-router";
import { toPayData } from "@/dummyData/constant";
import GreetingCard from "@/components/cards/GreetingCard";
import AmountSummaryCard from "@/components/cards/AmountSummaryCard";
import { BanknoteArrowDownIcon } from "lucide-react-native";

export default function ToPayScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Modal states
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [showEditRecord, setShowEditRecord] = useState(false);
    const [showDeleteRecord, setShowDeleteRecord] = useState(false);
    const [showPaymentConfirmation, setShowPaymentConfirmation] =
        useState(false);
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

    const handleOptionsPress = (recordId: string) => {
        const record = paymentRecords.find((r) => r.id === recordId);
        if (record) {
            setSelectedRecord(record);
            Alert.alert("Options", "What would you like to do?", [
                { text: "Edit", onPress: () => setShowEditRecord(true) },
                {
                    text: "Delete",
                    onPress: () => setShowDeleteRecord(true),
                    style: "destructive",
                },
                { text: "Cancel", style: "cancel" },
            ]);
        }
    };

    const handleAddRecord = () => {
        setShowAddRecord(true);
    };

    // Modal handlers
    const handleAddNewRecord = (newRecord: Omit<PaymentRecord, "id">) => {
        const record: PaymentRecord = {
            ...newRecord,
            id: Date.now().toString(), // Simple ID generation
        };
        setPaymentRecords((prev) => [...prev, record]);
        setShowAddRecord(false);
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

    return (
        <View className='flex-1 bg-white'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <View className='px-6 space-y-8 py-6'>
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
                        onSearchChange={(query) => {
                            console.log(query);
                        }}
                        filterStatus='all'
                        onFilterChange={(status) => {
                            console.log(status);
                        }}
                        sortBy={"name_asc"}
                        onSortChange={(sort) => {
                            console.log(sort);
                        }}
                        totalRecords={0}
                        filteredRecords={0}
                        onSearch={() => {
                            console.log("search");
                        }}
                    />

                    {/* Payment Record Cards */}
                    <View className='space-y-3'>
                        {paymentRecords.map((record) => (
                            <PaymentRecordCard
                                key={record.id}
                                record={record}
                                onMarkPayment={handleMarkPayment}
                                onOptionsPress={handleOptionsPress}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <FloatingActionButton
                onPress={handleAddRecord}
                icon='+'
                size='md'
                color='blue'
                position='bottom-right'
            />

            {/* Modals */}
            <AddRecord
                visible={showAddRecord}
                onClose={() => setShowAddRecord(false)}
                onAddRecord={handleAddNewRecord}
            />

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
        </View>
    );
}
