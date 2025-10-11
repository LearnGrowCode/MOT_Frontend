import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import PaymentRecordCard from "@/components/cards/PaymentRecordCard";
import { PaymentRecord } from "@/type/interface";
import SearchAndFilter from "@/components/ui/SearchAndFilter";
import Avatar from "@/components/ui/Avatar";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import AddRecord from "@/components/modals/AddRecord";
import EditRecord from "@/components/modals/EditRecord";
import DeleteRecord from "@/components/modals/DeleteRecord";
import PaymentConfirmation from "@/components/modals/PaymentConfirmation";

// Mock data for demonstration
const mockPaymentRecords: PaymentRecord[] = [
    {
        id: "1",
        name: "John Doe",
        amount: 150.0,
        borrowedDate: "2024-01-15",
        category: "Personal loan",
        status: "unpaid",
        remaining: 150.0,
        avatar: null,
    },
    {
        id: "2",
        name: "Sarah Wilson",
        amount: 75.5,
        borrowedDate: "2024-02-01",
        category: "Dinner",
        status: "unpaid",
        remaining: 75.5,
        avatar: null,
    },
];

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
    const [paymentRecords, setPaymentRecords] =
        useState<PaymentRecord[]>(mockPaymentRecords);

    const totalAmount = paymentRecords.reduce(
        (sum, record) => sum + record.remaining,
        0
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
                {/* Header with greeting */}
                <View className='px-6 pt-12 pb-4'>
                    <View className='flex-row items-center mb-2'>
                        <Avatar
                            name='Akshay'
                            size='lg'
                            showStatus={true}
                            statusColor='green'
                            className='mr-3'
                        />
                        <View>
                            <Text className='text-2xl font-bold text-gray-900'>
                                Hi, Akshay
                            </Text>
                            <Text className='text-gray-600'>
                                Let&apos;s see how much you owe
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Amount to Pay Summary */}
                <View className='px-6 mb-6'>
                    <Card className='bg-gray-50 border-0'>
                        <CardContent className='p-4'>
                            <Text className='text-sm font-medium text-gray-600 mb-2'>
                                AMOUNT TO PAY
                            </Text>
                            <Text className='text-3xl font-bold text-gray-900 mb-1'>
                                ₹{totalAmount.toFixed(0)}
                            </Text>
                            <Text className='text-sm text-gray-600'>
                                Total amount you owe to all people
                            </Text>
                        </CardContent>
                    </Card>
                </View>

                {/* Payment Records Section */}
                <View className='px-6'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-lg font-bold text-gray-900'>
                            Payment Records
                        </Text>
                        <Pressable
                            onPress={handleAddRecord}
                            className='bg-blue-600 px-4 py-2 rounded-lg flex-row items-center'
                        >
                            <Text className='text-white text-sm font-medium mr-1'>
                                +
                            </Text>
                            <Text className='text-white text-sm font-medium'>
                                Add Record
                            </Text>
                        </Pressable>
                    </View>

                    <SearchAndFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        totalRecords={paymentRecords.length}
                        filteredRecords={paymentRecords.length}
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
