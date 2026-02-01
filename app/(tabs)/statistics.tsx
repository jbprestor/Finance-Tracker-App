import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Typo from "../../components/Typo";
import { colors } from "../../constants/theme";
import { useAuth } from "../../context/authContext";
import { getTransactionsByDateRange, TransactionData } from "../../services/databaseService";
import { verticalScale } from "../../utils/styling";

type Period = "Day" | "Week" | "Month" | "Year";

export default function StatisticsScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("Week");
    const [transactions, setTransactions] = useState<(TransactionData & { id: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalExpense, setTotalExpense] = useState(0);
    const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [chartLabels, setChartLabels] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

    const periods: Period[] = ["Day", "Week", "Month", "Year"];

    // Fetch data when period or user changes
    useEffect(() => {
        if (!user) return;
        fetchData(selectedPeriod);
    }, [selectedPeriod, user]);

    // Aggregate data for chart whenever transactions change
    useEffect(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        let data: number[] = [];
        let labels: string[] = [];

        if (selectedPeriod === "Day") {
            // 4-hour blocks: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
            data = [0, 0, 0, 0, 0, 0];
            labels = ["4h", "8h", "12h", "16h", "20h", "24h"];

            expenses.forEach(t => {
                const hour = new Date(t.date).getHours();
                const index = Math.floor(hour / 4);
                if (index < 6) data[index] += Number(t.amount);
            });

        } else if (selectedPeriod === "Week") {
            data = [0, 0, 0, 0, 0, 0, 0];
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

            expenses.forEach(t => {
                const date = new Date(t.date);
                // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
                const dayIndex = (date.getDay() + 6) % 7;
                data[dayIndex] += Number(t.amount);
            });

        } else if (selectedPeriod === "Month") {
            // 5 Weeks max
            data = [0, 0, 0, 0, 0];
            labels = ["W1", "W2", "W3", "W4", "W5"];

            expenses.forEach(t => {
                const date = new Date(t.date);
                const day = date.getDate();
                // Simple bucket: 1-7, 8-14, 15-21, 22-28, 29+
                const index = Math.min(Math.floor((day - 1) / 7), 4);
                data[index] += Number(t.amount);
            });

        } else if (selectedPeriod === "Year") {
            data = new Array(12).fill(0);
            labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

            expenses.forEach(t => {
                const month = new Date(t.date).getMonth(); // 0-11
                data[month] += Number(t.amount);
            });
        }

        // Normalize
        const maxVal = Math.max(...data, 1);
        const normalizedData = data.map(v => (v / maxVal) * 100);

        setChartData(normalizedData);
        setChartLabels(labels);
    }, [transactions, selectedPeriod]);

    const fetchData = async (period: Period) => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date();
            // Start of today by default for Day
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            if (period === "Day") {
                // Default is correct
            } else if (period === "Week") {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                startDate.setDate(diff);
            } else if (period === "Month") {
                startDate.setDate(1);
            } else if (period === "Year") {
                startDate.setMonth(0, 1);
            }

            if (user) {
                const txs = await getTransactionsByDateRange(user.uid, startDate, endDate);
                setTransactions(txs as (TransactionData & { id: string })[]);

                // Calculate Total Expense
                const expenses = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
                setTotalExpense(expenses);
            }
        } catch (error) {
            console.error("Failed to fetch statistics", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Top Spending (Expenses only, sorted by amount)
    const topSpending = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Helper for category icons
    const getCategoryIcon = (category: string) => {
        // Map common categories to icons
        const map: { [key: string]: string } = {
            'Food': 'fast-food',
            'Transport': 'car',
            'Shopping': 'cart',
            'Entertainment': 'film',
            'Bills': 'receipt',
            'Health': 'medkit',
            'Others': 'ellipsis-horizontal'
        };
        return map[category] || 'pricetag'; // Default
    };

    // Calculate active bar index
    const getActiveIndex = () => {
        const now = new Date();
        if (selectedPeriod === "Day") {
            return Math.floor(now.getHours() / 4);
        }
        if (selectedPeriod === "Week") {
            return (now.getDay() + 6) % 7;
        }
        if (selectedPeriod === "Month") {
            return Math.min(Math.floor((now.getDate() - 1) / 7), 4);
        }
        if (selectedPeriod === "Year") {
            return now.getMonth();
        }
        return -1;
    };

    const activeIndex = getActiveIndex();

    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Typo size={20} fontWeight="700" color="white">Statistics</Typo>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Period Selector */}
                <View style={styles.periodContainer}>
                    {periods.map((period) => {
                        const isActive = selectedPeriod === period;
                        return (
                            <TouchableOpacity
                                key={period}
                                style={[styles.periodButton, isActive && styles.periodButtonActive]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Typo
                                    size={14}
                                    fontWeight={isActive ? "600" : "400"}
                                    color={isActive ? "white" : colors.neutral400}
                                >
                                    {period}
                                </Typo>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Chart Section */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <View style={styles.expenseDropdown}>
                            <Typo size={14} color={colors.neutral400} style={{ marginRight: 5 }}>Expense</Typo>
                            <Ionicons name="chevron-down" size={16} color={colors.neutral400} />
                        </View>
                    </View>

                    {/* Total Amount Bubble (Real Data) */}
                    <View style={styles.amountBubble}>
                        <Typo size={16} fontWeight="700" color={colors.primary}>
                            {formatCurrency(totalExpense)}
                        </Typo>
                    </View>

                    {/* Bar Chart Visualization */}
                    <View style={styles.chartArea}>
                        {chartData.map((height, index) => (
                            <View key={index} style={[styles.barWrapper, { width: `${100 / chartData.length}%` }]}>
                                <View style={[
                                    styles.bar,
                                    { height: `${Math.max(height, 5)}%` },
                                    index === activeIndex && styles.activeBar
                                ]} />
                                <Typo size={10} color={colors.neutral500} style={{ marginTop: 8 }}>{chartLabels[index]}</Typo>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Spending Section */}
                <View style={styles.spendingSection}>
                    <View style={styles.sectionHeader}>
                        <Typo size={18} fontWeight="700" color="white">Top Spending</Typo>
                        <TouchableOpacity>
                            <Ionicons name="swap-vertical" size={20} color={colors.neutral400} />
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <View style={{ marginTop: 15 }}>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : topSpending.length === 0 ? (
                            <Text style={{ color: colors.neutral400, marginTop: 10 }}>No expenses in this period.</Text>
                        ) : (
                            topSpending.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.spendingItem} activeOpacity={0.7}>
                                    <View style={styles.itemLeft}>
                                        <View style={[styles.iconWrapper]}>
                                            <Ionicons name={getCategoryIcon(item.category) as any} size={24} color={"#eee"} />
                                        </View>
                                        <View style={{ marginLeft: 15 }}>
                                            <Typo size={16} fontWeight="600" color="white" style={{ textTransform: 'capitalize' }}>
                                                {item.category || "Unknown"}
                                            </Typo>
                                            <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                                {formatDate(item.date)} • {item.note || "No note"}
                                            </Typo>
                                        </View>
                                    </View>
                                    <Typo size={16} fontWeight="600" color={colors.rose}>
                                        - {formatCurrency(item.amount)}
                                    </Typo>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    iconButton: {
        padding: 5,
    },
    periodContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    periodButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    periodButtonActive: {
        backgroundColor: colors.primary, // Teal
    },
    chartContainer: {
        marginHorizontal: 20,
        height: verticalScale(250),
        marginBottom: 30,
    },
    chartHeader: {
        alignItems: "flex-end",
        marginBottom: 10,
    },
    expenseDropdown: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.neutral700,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    amountBubble: {
        position: 'absolute',
        top: 40,
        left: 100,
        backgroundColor: "rgba(20, 184, 166, 0.1)", // Teal with opacity
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        zIndex: 10,
    },
    chartArea: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: 40,
    },
    barWrapper: {
        alignItems: "center",
        height: "100%",
        justifyContent: "flex-end",
        // width handled dynamically
    },
    bar: {
        width: 6,
        backgroundColor: "#2dd4bf", // Teal-400
        borderRadius: 10,
        opacity: 0.3,
    },
    activeBar: {
        opacity: 1,
        backgroundColor: colors.primary,
        width: 8,
    },
    spendingSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    spendingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.neutral800,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
    }
});
