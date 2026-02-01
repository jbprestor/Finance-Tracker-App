import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { TransactionData } from "../../services/databaseService";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
    transactions: (TransactionData & { id: string })[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const sections = useMemo(() => {
        const groups: { [key: string]: typeof transactions } = {};

        transactions.forEach((tx) => {
            // Check if date is a Firestore Timestamp (has toDate) or a JS Date
            const txDate = (tx.date as any).toDate ? (tx.date as any).toDate() : new Date(tx.date);

            const dateString = txDate.toDateString();
            let header = dateString;

            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (dateString === today.toDateString()) {
                header = "Today";
            } else if (dateString === yesterday.toDateString()) {
                header = "Yesterday";
            } else {
                // Format: October 24
                header = txDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            }

            if (!groups[header]) {
                groups[header] = [];
            }
            groups[header].push({ ...tx, date: txDate }); // Ensure date is Date object for Item if needed
        });

        // Sort keys if needed, but assuming input transactions are already sorted desc
        // The headers show up in the order they appear in the sorted list usually
        const sectionData = Object.keys(groups).map((key) => ({
            title: key,
            data: groups[key],
        }));

        return sectionData;
    }, [transactions]);

    return (
        <View style={{ marginBottom: 20 }}>
            {sections.map((section, index) => (
                <View key={section.title + index}>
                    {/* Section Header */}
                    <View className="bg-neutral-900 py-2 mt-2">
                        <Text className="text-sm font-semibold text-neutral-400 capitalize">
                            {section.title}
                        </Text>
                    </View>

                    {/* Items */}
                    <View>
                        {section.data.map((item) => (
                            <TransactionItem key={item.id} transaction={item} />
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}
