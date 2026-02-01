import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { useAuth } from "../context/authContext";
import { addBill } from "../services/databaseService";

export default function AddBillScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [dayOfMonth, setDayOfMonth] = useState(""); // Simplified date input (e.g. "15" for 15th)
    const [frequency, setFrequency] = useState<"Monthly" | "Weekly" | "Yearly">("Monthly");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !amount || !dayOfMonth) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (!user) {
            Alert.alert("Error", "User not found. Please login again.");
            return;
        }

        setIsLoading(true);
        console.log("Submitting bill:", { name, amount, dayOfMonth, frequency, uid: user.uid });
        try {
            const cleanAmount = amount.replace(/,/g, '.');
            const parsedAmount = parseFloat(cleanAmount);

            if (isNaN(parsedAmount)) {
                Alert.alert("Error", "Invalid amount");
                return;
            }

            // Calculate next due date
            const today = new Date();
            const day = parseInt(dayOfMonth);
            if (isNaN(day) || day < 1 || day > 31) {
                Alert.alert("Error", "Invalid day of month");
                return;
            }
            let dueDate = new Date(today.getFullYear(), today.getMonth(), day);
            if (dueDate < today) {
                // If the day has passed this month, set to next month
                dueDate.setMonth(dueDate.getMonth() + 1);
            }

            const billData = {
                name,
                amount: parsedAmount,
                dueDate: Timestamp.fromDate(dueDate),
                frequency,
                isPaid: false,
            };

            await addBill(user.uid, billData);
            console.log("Bill saved successfully");

            Alert.alert("Success", "Bill added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Add Bill Error:", error);
            Alert.alert("Error", "Failed to save bill");
        } finally {
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
                            <Text style={styles.headerTitle}>Add Recurring Bill</Text>
                        </View>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Bill Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Netflix, Rent"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
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

                        {/* Due Date (Simplified) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Day of Month Due</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 15 (for 15th)"
                                placeholderTextColor="#9ca3af"
                                keyboardType="number-pad"
                                value={dayOfMonth}
                                onChangeText={setDayOfMonth}
                                maxLength={2}
                            />
                        </View>

                        {/* Frequency Selector */}
                        <Text style={styles.label}>Frequency</Text>
                        <View style={styles.typeSelector}>
                            {["Weekly", "Monthly", "Yearly"].map((freq) => (
                                <TouchableOpacity
                                    key={freq}
                                    style={[
                                        styles.typeButton,
                                        frequency === freq && styles.typeButtonActive
                                    ]}
                                    onPress={() => setFrequency(freq as any)}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        frequency === freq ? styles.activeText : styles.inactiveText
                                    ]}>
                                        {freq}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            <Text style={styles.saveButtonText}>
                                {isLoading ? "Saving..." : "Save Bill"}
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
    activeText: {
        color: colors.primary,
    },
    inactiveText: {
        color: '#9ca3af',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#d1d5db',
        fontWeight: '500',
        marginBottom: 8,
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
