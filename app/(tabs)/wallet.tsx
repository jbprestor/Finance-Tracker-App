import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenWrapper from "../../components/ScreenWrapper";
import Typo from "../../components/Typo";
import { TransactionList } from "../../components/finance/TransactionList";
import WalletActions from "../../components/wallet/WalletActions";
import { colors, spacingY, verticalScale } from "../../constants/theme";
import { useAuth } from "../../context/authContext";
import { BillData, getRecentTransactions, getUpcomingBills, subscribeToUserData, TransactionData, UserData } from "../../services/databaseService";

export default function WalletScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 10 : 30;

    const [userData, setUserData] = useState<UserData | null>(null);
    const [transactions, setTransactions] = useState<(TransactionData & { id: string })[]>([]);
    const [bills, setBills] = useState<(BillData & { id: string })[]>([]);
    const [activeTab, setActiveTab] = useState<"Transactions" | "Upcoming Bills">("Transactions");
    const [loading, setLoading] = useState(true);

    // 1. Subscribe to User Data (Balance)
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserData(user.uid, (data) => {
            setUserData(data);
        });
        return () => unsubscribe();
    }, [user]);

    // 2. Fetch Transactions & Bills
    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [txs, upcomingBills] = await Promise.all([
                    getRecentTransactions(user.uid, 20),
                    getUpcomingBills(user.uid)
                ]);
                setTransactions(txs as (TransactionData & { id: string })[]);
                setBills(upcomingBills as (BillData & { id: string })[]);
            } catch (error) {
                console.error("Failed to load wallet data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, activeTab]);

    const handleAddPress = () => {
        if (activeTab === "Transactions") {
            router.push("/connect-wallet");
        } else {
            router.push("/add-bill");
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        });
    };

    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }} useInsets={false}>
            {/* Header Background (Curved) */}
            <View style={styles.headerBackground}>
                {/* Header Top Row */}
                <View style={[styles.headerTopRow, { marginTop: paddingTop }]}>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Typo size={20} fontWeight="700" color="white">Wallet</Typo>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Balance Section */}
                <View style={styles.balanceContainer}>
                    <Typo size={14} color={colors.neutral100} style={{ opacity: 0.8 }}>Total Balance</Typo>
                    <Typo size={32} fontWeight="700" color="white" style={{ marginTop: 5 }}>
                        {userData ? formatCurrency(userData.totalBalance) : "$0.00"}
                    </Typo>
                </View>
            </View>

            {/* Main Content (Overlapping Header) */}
            <View style={styles.contentContainer}>
                {/* Actions (Add, Pay, Send) */}
                <View style={styles.actionsWrapper}>
                    <WalletActions onAddPress={handleAddPress} />
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Transactions" && styles.activeTab]}
                        onPress={() => setActiveTab("Transactions")}
                    >
                        <Typo
                            size={16}
                            fontWeight={activeTab === "Transactions" ? "600" : "500"}
                            color={activeTab === "Transactions" ? colors.neutral900 : colors.neutral400}
                        >
                            Transactions
                        </Typo>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Upcoming Bills" && styles.activeTab]}
                        onPress={() => setActiveTab("Upcoming Bills")}
                    >
                        <Typo
                            size={16}
                            fontWeight={activeTab === "Upcoming Bills" ? "600" : "500"}
                            color={activeTab === "Upcoming Bills" ? colors.neutral900 : colors.neutral400}
                        >
                            Upcoming Bills
                        </Typo>
                    </TouchableOpacity>
                </View>

                {/* List Content */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    style={{ flex: 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                    ) : activeTab === "Transactions" ? (
                        <View style={{ marginTop: 10 }}>
                            {transactions.length === 0 ? (
                                <View style={{ alignItems: "center", marginTop: 40 }}>
                                    <Typo color={colors.neutral400}>No transactions yet</Typo>
                                </View>
                            ) : (
                                <TransactionList transactions={transactions} />
                            )}
                        </View>
                    ) : (
                        <View style={{ marginTop: 10 }}>
                            {bills.length === 0 ? (
                                <View style={{ alignItems: "center", marginTop: 40 }}>
                                    <Typo color={colors.neutral400}>No upcoming bills</Typo>
                                </View>
                            ) : (
                                bills.map(bill => (
                                    <View key={bill.id} style={styles.billItem}>
                                        <View style={styles.billIcon}>
                                            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Typo size={16} fontWeight="600" color="white">{bill.name}</Typo>
                                            <Typo size={12} color={colors.neutral400}>Due: {new Date((bill.dueDate as any).seconds * 1000).toLocaleDateString()}</Typo>
                                        </View>
                                        <Typo size={16} fontWeight="600" color="white">{formatCurrency(bill.amount)}</Typo>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    billItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.neutral800,
        borderRadius: 16,
        marginBottom: 12,
        gap: 12
    },
    billIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.neutral700,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBackground: {
        backgroundColor: colors.teal, // Using the new teal color
        height: verticalScale(280),
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1, // Higher than ScreenWrapper bg
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._20,
    },
    balanceContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacingY._12,
    },
    contentContainer: {
        flex: 1,
        marginTop: verticalScale(220), // Push down to start below header content but overlap curvature
        backgroundColor: colors.neutral900,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 40,
        paddingHorizontal: 20,
        zIndex: 2, // Ensure it sits on top if needed, or adjust margin
        // Actually, design has header distinct. Let's make content start slightly overlapping or just below.
        // If we want the "Card" look for Actions, we might want it to float.
        // Design: Header is tall, Actions are *inside* the header or floating?
        // Design image: Actions are on the white/dark background below header?
        // Wait, design image shows Actions *on white card* overlapping header? No, they are on white bg.
        // Let's assume standard flow: Header -> Actions (on bg) -> Tabs -> List.
        // I'll adjust marginTop.
    },
    actionsWrapper: {
        marginTop: -40, // Pull up to overlap header slightly? Or just sit below.
        // The design image shows Actions clearly below the balance.
        // Let's just padding nicely.
        marginBottom: spacingY._10,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: colors.neutral800,
        borderRadius: 25,
        padding: 4,
        marginBottom: spacingY._20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: colors.white,
    },
});
