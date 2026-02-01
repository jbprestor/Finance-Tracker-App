import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Typo from "../../components/Typo";
import { BalanceCard } from "../../components/finance/BalanceCard";
import { TransactionList } from "../../components/finance/TransactionList";
import { colors } from "../../constants/theme";
import { useAuth } from "../../context/authContext";
import {
    getRecentTransactions,
    subscribeToUserData,
    TransactionData,
    UserData
} from "../../services/databaseService";
import { verticalScale } from "../../utils/styling";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 10 : 30;

    const [userData, setUserData] = useState<UserData | null>(null);
    const [transactions, setTransactions] = useState<(TransactionData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Subscribe to Real-time User Data (Balance, Income, Expenses)
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserData(user.uid, (data) => {
            setUserData(data);
        });
        return () => unsubscribe();
    }, [user]);

    // 2. Fetch Transactions (Refresh when screen comes into focus)
    useFocusEffect(
        useCallback(() => {
            if (!user) return;

            const fetchTransactions = async () => {
                try {
                    const txs = await getRecentTransactions(user.uid, 20); // Fetch last 20
                    setTransactions(txs as (TransactionData & { id: string })[]);
                } catch (error) {
                    console.error("Failed to load transactions", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchTransactions();
        }, [user])
    );

    const handleLogout = async () => {
        await signOut();
    };

    if (loading && !userData) {
        return (
            <ScreenWrapper style={{ backgroundColor: colors.neutral900 }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }



    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }} useInsets={false}>
            {/* Curved Header Background */}
            <View style={styles.headerBackground}>
                {/* Header Content inside the curve */}
                <View style={[styles.headerContent, { marginTop: paddingTop }]}>
                    <View>
                        <Text style={{ color: colors.neutral200, fontSize: 14 }}>Good afternoon,</Text>
                        <Text style={{ color: colors.white, fontSize: 20, fontWeight: "bold" }}>
                            {user?.displayName || user?.email?.split('@')[0]}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100, paddingTop: verticalScale(130) }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <View style={{ paddingHorizontal: 20 }}>
                    {/* Balance Card (Floating) */}
                    {userData && (
                        <BalanceCard
                            totalBalance={userData.totalBalance}
                            income={userData.totalIncome}
                            expenses={userData.totalExpenses}
                        />
                    )}



                    {/* Recent Transactions */}
                    <View style={{ marginTop: 25 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Typo size={18} fontWeight="700" color="white">Transactions History</Typo>
                            <TouchableOpacity>
                                <Typo size={14} color={colors.neutral400}>See all</Typo>
                            </TouchableOpacity>
                        </View>

                        {transactions.length === 0 ? (
                            <View className="items-center justify-center py-10">
                                <Text className="text-gray-400">No transactions yet.</Text>
                            </View>
                        ) : (
                            <TransactionList transactions={transactions} />
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button (FAB) - Keep existing logic or remove if covered by Send Again 'add' */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg elevation-5"
                onPress={() => router.push("/add-transaction")}
                activeOpacity={0.8}
                style={{ backgroundColor: colors.primary }}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerBackground: {
        backgroundColor: colors.neutral800, // Match Profile header color
        height: verticalScale(200), // Taller header to accommodate content
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 10,
        // zIndex: -1 removed to prevent hiding behind parent background on iOS
        position: 'absolute', // Fixed at top inside wrapper
        top: 0,
        left: 0,
        right: 0,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1,
    },
    notificationButton: {
        padding: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.rose,
    },

});
