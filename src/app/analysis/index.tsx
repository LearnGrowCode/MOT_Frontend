import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { PaymentRecord, CollectionRecord } from "@/type/interface";
import {
    TrendingUp,
    TrendingDown,
    Coins,
    Users,
    Calendar,
} from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import {
    getPayBookEntries,
    getCollectBookEntries,
} from "@/services/book/book-entry.service";
import { formatCurrency } from "@/utils/utils";
import { useUserCurrency } from "@/hooks/useUserCurrency";

const screenWidth = Dimensions.get("window").width;
const chartWidth = Math.max(screenWidth - 80, 220);

const STATUS_LABELS: Record<string, string> = {
    paid: "Paid",
    unpaid: "Pending",
    partial: "Partial",
    overdue: "Overdue",
    collected: "Collected",
};

const STATUS_COLOR_MAP: Record<string, string> = {
    paid: "#10b981",
    collected: "#10b981",
    unpaid: "#f59e0b",
    partial: "#8b5cf6",
    overdue: "#ef4444",
};

const FALLBACK_PIE_COLORS = ["#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

function buildStatusPieData(statusData: Record<string, number>) {
    const entries = Object.entries(statusData).filter(([, value]) => value > 0);
    if (!entries.length) {
        return [
            {
                name: "No Data",
                population: 1,
                color: "#E5E7EB",
                legendFontColor: "#9CA3AF",
                legendFontSize: 12,
            },
        ];
    }

    return entries.map(([key, value], index) => {
        const label =
            STATUS_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
        const color =
            STATUS_COLOR_MAP[key] ??
            FALLBACK_PIE_COLORS[index % FALLBACK_PIE_COLORS.length];

        return {
            name: label,
            population: value,
            color,
            legendFontColor: "#7F7F7F",
            legendFontSize: 12,
        };
    });
}

export default function AnalysisScreen() {
    const { currency } = useUserCurrency();
    const [activeTab, setActiveTab] = useState<"overview" | "pay" | "collect">(
        "overview"
    );
    const [payRecords, setPayRecords] = useState<PaymentRecord[]>([]);
    const [collectRecords, setCollectRecords] = useState<CollectionRecord[]>(
        []
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchRecords = useCallback(async () => {
        const [pay, collect] = await Promise.all([
            getPayBookEntries(),
            getCollectBookEntries(),
        ]);
        return { pay, collect };
    }, []);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        fetchRecords()
            .then(({ pay, collect }) => {
                if (!isActive) return;
                setPayRecords(pay);
                setCollectRecords(collect);
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
                .then(({ pay, collect }) => {
                    if (!isActive) return;
                    setPayRecords(pay);
                    setCollectRecords(collect);
                })
                .finally(() => {
                    if (isActive) setIsLoading(false);
                });
            return () => {
                isActive = false;
            };
        }, [fetchRecords])
    );

    const generalStats = useMemo(() => {
        const totalToPay = payRecords.reduce(
            (sum, record) => sum + (record.amount || 0),
            0
        );
        const totalToCollect = collectRecords.reduce(
            (sum, record) => sum + (record.amount || 0),
            0
        );
        const netAmount = totalToCollect - totalToPay;

        const paidAmount = payRecords
            .filter((record) => record.status === "paid")
            .reduce((sum, record) => sum + (record.amount || 0), 0);

        const collectedAmount = collectRecords
            .filter((record) => record.status === "collected")
            .reduce((sum, record) => sum + (record.amount || 0), 0);

        const pendingPay = payRecords
            .filter((record) => record.status !== "paid")
            .reduce((sum, record) => sum + (record.remaining || 0), 0);

        const pendingCollect = collectRecords
            .filter((record) => record.status !== "collected")
            .reduce((sum, record) => sum + (record.remaining || 0), 0);

        return {
            totalToPay,
            totalToCollect,
            netAmount,
            paidAmount,
            collectedAmount,
            pendingPay,
            pendingCollect,
            totalRecords: payRecords.length + collectRecords.length,
            completedRecords:
                payRecords.filter((r) => r.status === "paid").length +
                collectRecords.filter((r) => r.status === "collected").length,
        };
    }, [payRecords, collectRecords]);

    const payAnalysis = useMemo(() => {
        const statusData = payRecords.reduce(
            (acc, record) => {
                acc[record.status] = (acc[record.status] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const categoryData = payRecords.reduce(
            (acc, record) => {
                acc[record.category] =
                    (acc[record.category] || 0) + (record.amount || 0);
                return acc;
            },
            {} as Record<string, number>
        );

        const monthlyData = payRecords.reduce(
            (acc, record) => {
                const date = new Date(record.borrowedDate);
                const month = Number.isNaN(date.getTime())
                    ? "Unknown"
                    : date.toLocaleDateString("en-US", { month: "short" });
                acc[month] = (acc[month] || 0) + (record.amount || 0);
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            statusData,
            categoryData,
            monthlyData,
            records: payRecords,
        };
    }, [payRecords]);

    const collectAnalysis = useMemo(() => {
        const statusData = collectRecords.reduce(
            (acc, record) => {
                acc[record.status] = (acc[record.status] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const categoryData = collectRecords.reduce(
            (acc, record) => {
                acc[record.category] =
                    (acc[record.category] || 0) + (record.amount || 0);
                return acc;
            },
            {} as Record<string, number>
        );

        const monthlyData = collectRecords.reduce(
            (acc, record) => {
                const date = new Date(record.lentDate);
                const month = Number.isNaN(date.getTime())
                    ? "Unknown"
                    : date.toLocaleDateString("en-US", { month: "short" });
                acc[month] = (acc[month] || 0) + (record.amount || 0);
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            statusData,
            categoryData,
            monthlyData,
            records: collectRecords,
        };
    }, [collectRecords]);

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-white'>
                <ActivityIndicator size='large' color='#2563eb' />
            </View>
        );
    }

    const pieChartConfig = {
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    const CategoryTable = ({ data }: { data: Record<string, number> }) => {
        const rows = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const total = rows.reduce((sum, [, amount]) => sum + amount, 0);

        return (
            <View className='rounded-lg border border-gray-200 overflow-hidden'>
                <View className='flex-row items-center bg-gray-50 px-4 py-2'>
                    <Text className='flex-1 font-semibold text-gray-700'>
                        Category
                    </Text>
                    <Text className='w-24 text-right font-semibold text-gray-700'>
                        Amount
                    </Text>
                    <Text className='w-14 text-right font-semibold text-gray-700'>
                        %
                    </Text>
                </View>
                {rows.map(([category, amount], index) => (
                    <View
                        key={category}
                        className={`flex-row items-center px-4 py-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                        <Text className='flex-1 text-gray-900'>{category}</Text>
                        <Text className='w-24 text-right text-gray-900'>
                            {formatCurrency(amount, currency, 2)}
                        </Text>
                        <Text className='w-14 text-right text-gray-600'>
                            {total ? Math.round((amount / total) * 100) : 0}%
                        </Text>
                    </View>
                ))}
                <View className='flex-row items-center px-4 py-3 border-t border-gray-200 bg-white'>
                    <Text className='flex-1 font-semibold text-gray-900'>
                        Total
                    </Text>
                    <Text className='w-24 text-right font-semibold text-gray-900'>
                        {formatCurrency(total, currency, 2)}
                    </Text>
                    <Text className='w-14 text-right font-semibold text-gray-900'>
                        100%
                    </Text>
                </View>
            </View>
        );
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        color,
        trend,
    }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
        trend?: "up" | "down" | "neutral";
    }) => (
        <View
            className={`p-4 rounded-xl border-l-4 ${color} bg-white shadow-sm`}
        >
            <View className='flex-row items-center justify-between'>
                <View className='flex-1'>
                    <Text className='text-sm text-gray-600 mb-1'>{title}</Text>
                    <Text className='text-2xl font-bold text-gray-900'>
                        {value}
                    </Text>
                </View>
                <View className='items-center'>
                    <Icon
                        size={24}
                        color={
                            trend === "up"
                                ? "#10b981"
                                : trend === "down"
                                  ? "#ef4444"
                                  : "#6b7280"
                        }
                    />
                    {trend && (
                        <View className={`flex-row items-center mt-1`}>
                            {trend === "up" ? (
                                <TrendingUp size={12} color='#10b981' />
                            ) : trend === "down" ? (
                                <TrendingDown size={12} color='#ef4444' />
                            ) : null}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    const TabButton = ({
        tab,
        label,
        isActive,
        onPress,
    }: {
        tab: "overview" | "pay" | "collect";
        label: string;
        isActive: boolean;
        onPress: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            className={`px-4 py-2 rounded-lg ${
                isActive ? "bg-blue-600" : "bg-gray-100"
            }`}
        >
            <Text
                className={`font-medium ${
                    isActive ? "text-white" : "text-gray-700"
                }`}
            >
                {label}
            </Text>
        </Pressable>
    );

    const renderOverviewTab = () => (
        <View className='gap-6'>
            {/* General Stats Cards */}
            <View className='grid grid-cols-2 gap-4'>
                <StatCard
                    title='Net Amount'
                    value={formatCurrency(
                        generalStats.netAmount,
                        "INR",
                        "en-IN",
                        2
                    )}
                    icon={Coins}
                    color='border-green-500'
                    trend={
                        generalStats.netAmount > 0
                            ? "up"
                            : generalStats.netAmount < 0
                              ? "down"
                              : "neutral"
                    }
                />
                <StatCard
                    title='Total Records'
                    value={generalStats.totalRecords}
                    icon={Users}
                    color='border-blue-500'
                />
                <StatCard
                    title='Completed'
                    value={`${generalStats.completedRecords}/${generalStats.totalRecords}`}
                    icon={Calendar}
                    color='border-purple-500'
                />
                <StatCard
                    title='Pending Pay'
                    value={formatCurrency(
                        generalStats.pendingPay,
                        "INR",
                        "en-IN",
                        2
                    )}
                    icon={TrendingDown}
                    color='border-red-500'
                />
            </View>

            {/* Summary Charts */}
            <View className='bg-white p-4 rounded-xl shadow-sm'>
                <Text className='text-lg font-bold text-gray-900 mb-4'>
                    Financial Overview
                </Text>
                <View className='flex-row justify-between items-center'>
                    <View className='items-center'>
                        <Text className='text-2xl font-bold text-green-600'>
                            {formatCurrency(
                                generalStats.totalToCollect,
                                "INR",
                                "en-IN",
                                2
                            )}
                        </Text>
                        <Text className='text-sm text-gray-600'>
                            To Collect
                        </Text>
                    </View>
                    <View className='items-center'>
                        <Text className='text-2xl font-bold text-red-600'>
                            {formatCurrency(
                                generalStats.totalToPay,
                                "INR",
                                "en-IN",
                                2
                            )}
                        </Text>
                        <Text className='text-sm text-gray-600'>To Pay</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPayTab = () => {
        const statusPieData = buildStatusPieData(payAnalysis.statusData);

        return (
            <View className='gap-6'>
                {/* Pay Book Stats */}
                <View className='grid grid-cols-2 gap-4'>
                    <StatCard
                        title='Total Owed'
                        value={formatCurrency(
                            generalStats.totalToPay,
                            "INR",
                            "en-IN",
                            2
                        )}
                        icon={Coins}
                        color='border-red-500'
                    />
                    <StatCard
                        title='Paid Amount'
                        value={formatCurrency(
                            generalStats.paidAmount,
                            "INR",
                            "en-IN",
                            2
                        )}
                        icon={TrendingUp}
                        color='border-green-500'
                    />
                </View>

                {/* Status Distribution */}
                <View className='bg-white p-4 rounded-xl shadow-sm'>
                    <Text className='text-lg font-bold text-gray-900 mb-4'>
                        Payment Status
                    </Text>
                    <PieChart
                        data={statusPieData}
                        width={chartWidth}
                        height={200}
                        chartConfig={pieChartConfig}
                        accessor='population'
                        backgroundColor='transparent'
                        paddingLeft='15'
                    />
                </View>

                {/* Category Breakdown */}
                <View className='bg-white p-4 rounded-xl shadow-sm'>
                    <Text className='text-lg font-bold text-gray-900 mb-4'>
                        Amount by Category
                    </Text>
                    <CategoryTable data={payAnalysis.categoryData} />
                </View>
            </View>
        );
    };

    const renderCollectTab = () => {
        const statusPieData = buildStatusPieData(collectAnalysis.statusData);

        return (
            <View className='gap-6'>
                {/* Collect Book Stats */}
                <View className='grid grid-cols-2 gap-4'>
                    <StatCard
                        title='Total to Collect'
                        value={formatCurrency(
                            generalStats.totalToCollect,
                            "INR",
                            "en-IN",
                            2
                        )}
                        icon={Coins}
                        color='border-green-500'
                    />
                    <StatCard
                        title='Collected Amount'
                        value={formatCurrency(
                            generalStats.collectedAmount,
                            "INR",
                            "en-IN",
                            2
                        )}
                        icon={TrendingUp}
                        color='border-blue-500'
                    />
                </View>

                {/* Status Distribution */}
                <View className='bg-white p-4 rounded-xl shadow-sm'>
                    <Text className='text-lg font-bold text-gray-900 mb-4'>
                        Collection Status
                    </Text>
                    <PieChart
                        data={statusPieData}
                        width={chartWidth}
                        height={200}
                        chartConfig={pieChartConfig}
                        accessor='population'
                        backgroundColor='transparent'
                        paddingLeft='15'
                    />
                </View>

                {/* Category Breakdown */}
                <View className='bg-white p-4 rounded-xl shadow-sm'>
                    <Text className='text-lg font-bold text-gray-900 mb-4'>
                        Amount by Category
                    </Text>
                    <CategoryTable data={collectAnalysis.categoryData} />
                </View>
            </View>
        );
    };

    return (
        <View className='flex-1 bg-gray-50'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <View className='px-6 py-6'>
                    {/* Header */}
                    <View className='mb-6'>
                        <Text className='text-2xl font-bold text-gray-900 mb-2'>
                            Financial Analysis
                        </Text>
                        <Text className='text-gray-600'>
                            Track your pay and collect book performance
                        </Text>
                    </View>

                    {/* Tab Navigation */}
                    <View className='flex-row gap-2 mb-6'>
                        <TabButton
                            tab='overview'
                            label='Overview'
                            isActive={activeTab === "overview"}
                            onPress={() => setActiveTab("overview")}
                        />
                        <TabButton
                            tab='pay'
                            label='Pay Book'
                            isActive={activeTab === "pay"}
                            onPress={() => setActiveTab("pay")}
                        />
                        <TabButton
                            tab='collect'
                            label='Collect Book'
                            isActive={activeTab === "collect"}
                            onPress={() => setActiveTab("collect")}
                        />
                    </View>

                    {/* Tab Content */}
                    {activeTab === "overview" && renderOverviewTab()}
                    {activeTab === "pay" && renderPayTab()}
                    {activeTab === "collect" && renderCollectTab()}
                </View>
            </ScrollView>
        </View>
    );
}
