import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { TransactionData } from "../../services/databaseService";

interface TransactionItemProps {
    transaction: TransactionData;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
    const isIncome = transaction.type === "income";
    const amountColor = isIncome ? "text-green-600" : "text-red-500";
    const iconName = isIncome ? "arrow-down-circle" : "arrow-up-circle"; // Incoming vs Outgoing

    // PHP Currency Formatter
    const formattedAmount = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(transaction.amount);

    return (
        <View className="flex-row items-center justify-between py-3 px-4 bg-white border-b border-gray-100">
            {/* Left: Icon */}
            <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
                    <Ionicons
                        name={isIncome ? "wallet-outline" : "cart-outline"}
                        size={20}
                        color={isIncome ? "#16a34a" : "#ef4444"}
                    />
                </View>

                {/* Middle: Category & Note */}
                <View className="flex-1 mr-2">
                    <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
                        {transaction.category}
                    </Text>
                    {transaction.note ? (
                        <Text className="text-gray-500 text-sm" numberOfLines={1}>
                            {transaction.note}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Right: Amount */}
            <Text className={`font-bold text-base ${amountColor}`}>
                {isIncome ? "+" : "-"}{formattedAmount}
            </Text>
        </View>
    );
}
