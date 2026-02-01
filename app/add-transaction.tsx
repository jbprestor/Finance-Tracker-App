import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { useAuth } from "../context/authContext";
import { addTransaction, TransactionData } from "../services/databaseService";

export default function AddTransaction() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;

        if (!amount || !category) {
            Alert.alert("Missing Fields", "Please enter an amount and category.");
            return;
        }

        const cleanAmount = amount.replace(/,/g, '.');
        const parsedAmount = parseFloat(cleanAmount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid positive number.");
            return;
        }

        setIsLoading(true);
        try {
            const transaction: TransactionData = {
                amount: parsedAmount,
                category,
                note,
                date: new Date(),
                type,
            };

            await addTransaction(user.uid, transaction);
            // Defer navigation to next frame
            requestAnimationFrame(() => {
                router.replace('/(tabs)/home');
            });
        } catch (error: any) {
            console.error("Add Transaction Error:", error);
            Alert.alert("Error", "Failed to save transaction: " + (error.message || "Unknown error"));
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: top > 0 ? top + 5 : 30 }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                <View style={styles.flex1}>
                    <ScrollView style={styles.scrollView}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Add Transaction</Text>
                        </View>

                        {/* Type Selector (Pill) */}
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === "expense" && styles.typeButtonActive
                                ]}
                                onPress={() => setType("expense")}
                            >
                                <Text style={[
                                    styles.typeButtonText,
                                    type === "expense" ? styles.expenseText : styles.inactiveText
                                ]}>
                                    Expense
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === "income" && styles.typeButtonActive
                                ]}
                                onPress={() => setType("income")}
                            >
                                <Text style={[
                                    styles.typeButtonText,
                                    type === "income" ? styles.incomeText : styles.inactiveText
                                ]}>
                                    Income
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Amount Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                style={[styles.input, styles.amountInput]}
                                placeholder="0.00"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        {/* Category Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Category</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Food, Transport, Salary"
                                placeholderTextColor="#9ca3af"
                                value={category}
                                onChangeText={setCategory}
                            />
                        </View>

                        {/* Note Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Note (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.noteInput]}
                                placeholder="Add details..."
                                placeholderTextColor="#9ca3af"
                                value={note}
                                onChangeText={setNote}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </ScrollView>

                    {/* Sticky Footer Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            <Text style={styles.saveButtonText}>
                                {isLoading ? "Saving..." : "Save Transaction"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    flex1: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.neutral800,
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: colors.neutral700,
    },
    typeButtonText: {
        fontWeight: '600',
    },
    expenseText: {
        color: '#f87171',
    },
    incomeText: {
        color: '#4ade80',
    },
    inactiveText: {
        color: '#9ca3af',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: '#d1d5db',
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.neutral800,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.neutral700,
        color: 'white',
        minHeight: 44,
    },
    amountInput: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    noteInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: colors.neutral800,
        backgroundColor: colors.neutral900,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});
