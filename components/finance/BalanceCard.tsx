import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../constants/theme";

interface BalanceCardProps {
    totalBalance: number;
    income: number;
    expenses: number;
}

export function BalanceCard({ totalBalance, income, expenses }: BalanceCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <View style={styles.container}>
            {/* Card Background with curved accent */}
            <View style={styles.card}>
                {/* Curved accent overlay */}
                <View style={styles.accentContainer}>
                    <Svg width="150" height="200" viewBox="0 0 150 200" style={styles.accent}>
                        <Path
                            d="M150 0 C80 50, 100 150, 150 200 L150 0 Z"
                            fill="rgba(255,255,255,0.03)"
                        />
                    </Svg>
                </View>

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.label}>Total Balance</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.neutral400} />
                    </TouchableOpacity>
                </View>

                {/* Balance Amount */}
                <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>

                {/* Income & Expense Row */}
                <View style={styles.statsRow}>
                    {/* Income */}
                    <View style={styles.statItem}>
                        <View style={[styles.iconBadge, styles.incomeBadge]}>
                            <Ionicons name="arrow-down" size={14} color="#10b981" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={[styles.statValue, styles.incomeValue]}>
                                {formatCurrency(income)}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Expense */}
                    <View style={styles.statItem}>
                        <View style={[styles.iconBadge, styles.expenseBadge]}>
                            <Ionicons name="arrow-up" size={14} color="#ef4444" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Expense</Text>
                            <Text style={[styles.statValue, styles.expenseValue]}>
                                {formatCurrency(expenses)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    card: {
        backgroundColor: colors.neutral800,
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    accentContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    accent: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: colors.neutral400,
        fontWeight: '500',
    },
    menuButton: {
        padding: 4,
    },
    balance: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 16,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    incomeBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    expenseBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statLabel: {
        fontSize: 12,
        color: colors.neutral400,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    incomeValue: {
        color: '#10b981',
    },
    expenseValue: {
        color: '#ef4444',
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: colors.neutral700,
        marginHorizontal: 16,
    },
});
