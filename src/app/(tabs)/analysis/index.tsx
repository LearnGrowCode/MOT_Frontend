import { useUserCurrency } from "@/hooks/useUserCurrency";
import {
    getCollectBookEntries,
    getPayBookEntries,
} from "@/services/book/book-entry.service";
import { CollectionRecord, PaymentRecord } from "@/modules/book.module";
import { formatCurrency } from "@/utils/utils";
import { useFocusEffect } from "expo-router";
import {
    Calendar,
    Coins,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const chartWidth = Math.max(screenWidth - 80, 220);

// Tab index mapping
const TAB_INDEX_MAP: Record<"overview" | "pay" | "collect", number> = {
    overview: 0,
    pay: 1,
    collect: 2,
};

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
    const isDark = useColorScheme() === 'dark';
    const [activeTab, setActiveTab] = useState<"overview" | "pay" | "collect">(
        "overview"
    );
    const [payRecords, setPayRecords] = useState<PaymentRecord[]>([]);
    const [collectRecords, setCollectRecords] = useState<CollectionRecord[]>(
        []
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const isScrollingProgrammatically = useRef<boolean>(false);

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
            let isMounted = true;
            setIsLoading(true);

            fetchRecords()
                .then(({ pay, collect }) => {
                    if (!isMounted) return;
                    setPayRecords(pay);
                    setCollectRecords(collect);
                })
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });

            return () => {
                isMounted = false;
            };
        }, [fetchRecords])
    );

    // Update scroll position when tab changes
    useEffect(() => {
        const index = TAB_INDEX_MAP[activeTab];
        // Mark as programmatic scroll to prevent handleScroll from interfering
        isScrollingProgrammatically.current = true;
        // Scroll to the correct position with smooth animation
        scrollViewRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true,
        });
        // Reset flag after animation completes (300ms for smooth scroll)
        setTimeout(() => {
            isScrollingProgrammatically.current = false;
        }, 300);
    }, [activeTab]);

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
            <View className='flex-1 items-center justify-center bg-background'>
                <ActivityIndicator size='large' color='hsl(var(--primary))' />
            </View>
        );
    }

    const pieChartConfig = {
        backgroundColor: "transparent",
        backgroundGradientFrom: "transparent",
        backgroundGradientTo: "transparent",
        decimalPlaces: 0,
        color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    const CategoryTable = ({ data, type }: { data: Record<string, number>; type: "PAY" | "COLLECT" }) => {
        const rows = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const total = rows.reduce((sum, [, amount]) => sum + amount, 0);
        const isCollect = type === "COLLECT";
        const accentColor = isCollect ? "bg-primary" : "bg-tertiary-500";
        const textColor =  "text-primary-foreground" ;

        return (
            <View className='rounded-2xl border border-border overflow-hidden bg-card'>
                <View className={`flex-row items-center ${accentColor} px-4 py-3`}>
                    <Text className={`flex-1 font-bold ${textColor} text-xs uppercase tracking-wider`}>
                        Category
                    </Text>
                    <Text className={`w-24 text-right font-bold ${textColor} text-xs uppercase tracking-wider`}>
                        Amount
                    </Text>
                    <Text className={`w-14 text-right font-bold ${textColor} text-xs uppercase tracking-wider`}>
                        %
                    </Text>
                </View>
                {rows.map(([category, amount], index) => (
                    <View
                        key={category}
                        className={`flex-row items-center px-4 py-4 border-b border-border/50 ${index % 2 === 1 ? "bg-muted/30" : "bg-card"}`}
                    >
                        <Text className='flex-1 text-foreground font-semibold'>{category}</Text>
                        <Text className='w-24 text-right text-foreground font-bold'>
                            {formatCurrency(amount, currency, 2)}
                        </Text>
                        <View className='w-14 items-end'>
                            <View className={`rounded-full px-2 py-0.5 ${isCollect ? "bg-primary/10" : "bg-tertiary-500/10"}`}>
                                <Text className={`text-[10px] font-black ${isCollect ? "text-primary" : "text-tertiary-600 dark:text-tertiary-400"}`}>
                                    {total ? Math.round((amount / total) * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                <View className='flex-row items-center px-4 py-4 bg-muted/50'>
                    <Text className='flex-1 font-black text-foreground uppercase text-xs tracking-tighter'>
                        Total Distribution
                    </Text>
                    <Text className='w-24 text-right font-black text-foreground'>
                        {formatCurrency(total, currency, 2)}
                    </Text>
                    <Text className='w-14 text-right font-black text-foreground text-xs'>
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
            className={`p-5 rounded-3xl border-l-[6px] ${color} bg-card border border-border shadow-sm shadow-black/5 mb-2`}
        >
            <View className='flex-row items-center justify-between'>
                <View className='flex-1'>
                    <Text className='text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider'>{title}</Text>
                    <Text className='text-3xl font-black text-foreground'>
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
            className={`px-5 py-2.5 rounded-full ${isActive ? "bg-primary" : "bg-transparent"
                }`}
        >
            <Text
                className={`font-bold text-sm tracking-tight ${isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
            >
                {label}
            </Text>
        </Pressable>
    );

    // Handle scroll events to update active tab
    const handleScroll = (event: any) => {
        // Ignore scroll updates during programmatic scrolling (tab clicks)
        if (isScrollingProgrammatically.current) {
            return;
        }

        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / screenWidth);

        // Update active tab based on scroll position
        const tabs: ("overview" | "pay" | "collect")[] = [
            "overview",
            "pay",
            "collect",
        ];
        if (tabs[index] && tabs[index] !== activeTab) {
            setActiveTab(tabs[index]);
        }
    };

    // Handle scroll end to sync tab when user manually swipes
    const handleScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / screenWidth);

        const tabs: ("overview" | "pay" | "collect")[] = [
            "overview",
            "pay",
            "collect",
        ];
        if (tabs[index] && tabs[index] !== activeTab) {
            setActiveTab(tabs[index]);
        }
        // Reset programmatic scroll flag when scroll ends
        isScrollingProgrammatically.current = false;
    };

    const renderOverviewTab = () => (
        <View className='gap-6'>
              {/* Summary Charts */}
            <View className='bg-card p-6 rounded-3xl border border-border shadow-sm shadow-black/5'>
                <Text className='text-lg font-bold text-foreground mb-6 uppercase tracking-wider text-center'>
                    Financial Overview
                </Text>
                <View className='flex-row justify-around items-center'>
                    <View className='items-center'>
                        <Text className='text-2xl font-black text-green-500'>
                            {formatCurrency(
                                generalStats.totalToCollect,
                                currency,
                                2
                            )}
                        </Text>
                        <Text className='text-xs font-bold text-muted-foreground uppercase mt-1'>
                            To Collect
                        </Text>
                    </View>
                    <View className='w-[1px] h-12 bg-border' />
                    <View className='items-center'>
                        <Text className='text-2xl font-black text-destructive'>
                            {formatCurrency(
                                generalStats.totalToPay,
                                currency,
                                2
                            )}
                        </Text>
                        <Text className='text-xs font-bold text-muted-foreground uppercase mt-1'>To Pay</Text>
                    </View>
                </View>
            </View>
            {/* General Stats Cards */}
            <View className='grid grid-cols-2 gap-4'>
                <StatCard
                    title='Net Amount'
                    value={formatCurrency(generalStats.netAmount, currency, 2)}
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
                    value={formatCurrency(generalStats.pendingPay, currency, 2)}
                    icon={TrendingDown}
                    color='border-red-500'
                />
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
                            currency,
                            2
                        )}
                        icon={Coins}
                        color='border-red-500'
                    />
                    <StatCard
                        title='Paid Amount'
                        value={formatCurrency(
                            generalStats.paidAmount,
                            currency,
                            2
                        )}
                        icon={TrendingUp}
                        color='border-green-500'
                    />
                </View>

                {/* Status Distribution */}
                <View className='bg-card p-6 rounded-3xl border border-border shadow-sm'>
                    <Text className='text-lg font-bold text-foreground mb-6 uppercase tracking-wider'>
                        Payment Status
                    </Text>
                    <View className="items-center">
                        <PieChart
                            data={statusPieData}
                            width={chartWidth}
                            height={200}
                            chartConfig={pieChartConfig}
                            accessor='population'
                            backgroundColor='transparent'
                            paddingLeft='15'
                            absolute
                        />
                    </View>
                </View>

                {/* Category Breakdown */}
                <View className='bg-card p-6 rounded-3xl border border-border shadow-sm'>
                    <Text className='text-lg font-bold text-foreground mb-6 uppercase tracking-wider'>
                        Amount by Category
                    </Text>
                    <CategoryTable data={payAnalysis.categoryData} type="PAY" />
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
                            currency,
                            2
                        )}
                        icon={Coins}
                        color='border-green-500'
                    />
                    <StatCard
                        title='Collected Amount'
                        value={formatCurrency(
                            generalStats.collectedAmount,
                            currency,
                            2
                        )}
                        icon={TrendingUp}
                        color='border-blue-500'
                    />
                </View>

                {/* Status Distribution */}
                <View className='bg-card p-6 rounded-3xl border border-border shadow-sm'>
                    <Text className='text-lg font-bold text-foreground mb-6 uppercase tracking-wider'>
                        Collection Status
                    </Text>
                    <View className="items-center">
                        <PieChart
                            data={statusPieData}
                            width={chartWidth}
                            height={200}
                            chartConfig={pieChartConfig}
                            accessor='population'
                            backgroundColor='transparent'
                            paddingLeft='15'
                            absolute
                        />
                    </View>
                </View>

                {/* Category Breakdown */}
                <View className='bg-card p-6 rounded-3xl border border-border shadow-sm'>
                    <Text className='text-lg font-bold text-foreground mb-6 uppercase tracking-wider'>
                        Amount by Category
                    </Text>
                    <CategoryTable data={collectAnalysis.categoryData} type="COLLECT" />
                </View>
            </View>
        );
    };

    return (
        <View className='flex-1 bg-background'>
            {/* Header - Fixed */}
            <View
                className='px-6 pb-6 bg-background border-b border-border'
                style={{ zIndex: 10 }}
            >
                <View className='mb-6'>
                    <View className='flex-row items-start justify-between mb-2'>
                        <View className='flex-1'>
                            <Text className='text-xs font-bold uppercase tracking-[2px] text-primary'>
                                Analytics
                            </Text>
                            <Text className='mt-2 text-4xl font-black text-foreground tracking-tight'>
                                Financial Analysis
                            </Text>
                        </View>
                    </View>
                    <Text className='text-base text-muted-foreground font-medium'>
                        Track your pay and collect book performance
                    </Text>
                </View>

                {/* Tab Navigation */}
                <View className='flex-row gap-1 bg-muted/50 rounded-full p-1.5 border border-border'>
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
            </View>

            {/* Tab Content with Slide Animation */}
            <View
                className='flex-1 bg-background'
                style={{
                    overflow: "hidden",
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    marginTop: -20,
                    paddingTop: 20,
                }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onMomentumScrollEnd={handleScrollEnd}
                    scrollEventThrottle={16}
                    decelerationRate='fast'
                    snapToInterval={screenWidth}
                    snapToAlignment='start'
                    contentContainerStyle={{ width: screenWidth * 3 }}
                >
                    {/* Overview Tab */}
                    <ScrollView
                        className='flex-1'
                        showsVerticalScrollIndicator={false}
                        style={{ width: screenWidth }}
                    >
                        <View className='px-6 py-4'>{renderOverviewTab()}</View>
                    </ScrollView>

                    {/* Pay Book Tab */}
                    <ScrollView
                        className='flex-1'
                        showsVerticalScrollIndicator={false}
                        style={{ width: screenWidth }}
                    >
                        <View className='px-6 py-4'>{renderPayTab()}</View>
                    </ScrollView>

                    {/* Collect Book Tab */}
                    <ScrollView
                        className='flex-1'
                        showsVerticalScrollIndicator={false}
                        style={{ width: screenWidth }}
                    >
                        <View className='px-6 py-4'>{renderCollectTab()}</View>
                    </ScrollView>
                </ScrollView>
            </View>
        </View>
    );
}
