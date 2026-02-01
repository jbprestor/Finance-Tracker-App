import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { colors } from "../../constants/theme";
import { Card } from "../ui/Card";

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
        }).format(value);
    };

    return (
        <View style={{
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
        }}>
            <Card className="bg-neutral-800 p-6 rounded-[32px] mb-0 border border-neutral-700">
                <View className="items-center mb-6">
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
                            Total Balance
                        </Text>
                        <Ionicons name="chevron-up" size={16} color={colors.neutral400} style={{ marginLeft: 5 }} />
                    </View>
                    <Text className="text-white text-4xl font-bold tracking-tight">
                        {formatCurrency(totalBalance)}
                    </Text>
                </View>

                <View className="flex-row justify-between pt-4">
                    {/* Income */}
                    <View className="flex-row items-center bg-neutral-900/50 p-3 rounded-2xl flex-1 mr-3 border border-neutral-700/50">
                        <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3 border border-neutral-700">
                            <Ionicons name="arrow-down" size={18} color="#4ade80" />
                        </View>
                        <View>
                            <Text className="text-neutral-400 text-xs text-left mb-1">Income</Text>
                            <Text className="text-white text-sm font-bold">
                                {formatCurrency(income)}
                            </Text>
                        </View>
                    </View>

                    {/* Expenses */}
                    <View className="flex-row items-center bg-neutral-900/50 p-3 rounded-2xl flex-1 ml-3 border border-neutral-700/50">
                        <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3 border border-neutral-700">
                            <Ionicons name="arrow-up" size={18} color="#f87171" />
                        </View>
                        <View>
                            <Text className="text-neutral-400 text-xs text-left mb-1">Expenses</Text>
                            <Text className="text-white text-sm font-bold">
                                {formatCurrency(expenses)}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>
        </View>
    );
}
