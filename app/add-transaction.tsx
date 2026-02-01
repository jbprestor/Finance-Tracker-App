import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
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
import { db } from "../firebaseConfig";
import { addTransaction, TransactionData, WalletData } from "../services/databaseService";

// Predefined categories
const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelancing", "Investment", "Gift", "Other"];

export default function AddTransaction() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [isLoading, setIsLoading] = useState(false);

    // New fields
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [wallets, setWallets] = useState<(WalletData & { id: string })[]>([]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showWalletPicker, setShowWalletPicker] = useState(false);
    const [receiptImage, setReceiptImage] = useState<string | null>(null);

    // Fetch user's wallets
    useEffect(() => {
        const fetchWallets = async () => {
            if (!user?.uid) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data?.wallets) {
                        setWallets(data.wallets);
                        if (data.wallets.length > 0) {
                            setSelectedWallet(data.wallets[0].id);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching wallets:", error);
            }
        };
        fetchWallets();
    }, [user?.uid]);

    const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const pickReceiptImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.3,
            });

            if (!result.canceled) {
                // Convert to base64 for storage
                if (Platform.OS === 'web') {
                    const response = await fetch(result.assets[0].uri);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setReceiptImage(reader.result as string);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: 'base64',
                    });
                    setReceiptImage(`data:image/jpeg;base64,${base64}`);
                }
            }
        } catch (error) {
            console.error("Pick image error:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

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
                date: date,
                type,
                walletId: selectedWallet || undefined,
                receiptImage: receiptImage || undefined,
            };

            await addTransaction(user.uid, transaction);
            requestAnimationFrame(() => {
                router.replace('/(tabs)/home');
            });
        } catch (error: any) {
            console.error("Add Transaction Error:", error);
            Alert.alert("Error", "Failed to save transaction: " + (error.message || "Unknown error"));
            setIsLoading(false);
        }
    };

    const selectedWalletName = wallets.find(w => w.id === selectedWallet)?.name || "Select Wallet";

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
                                style={[styles.typeButton, type === "expense" && styles.typeButtonActive]}
                                onPress={() => { setType("expense"); setCategory(""); }}
                            >
                                <Text style={[styles.typeButtonText, type === "expense" ? styles.expenseText : styles.inactiveText]}>
                                    Expense
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, type === "income" && styles.typeButtonActive]}
                                onPress={() => { setType("income"); setCategory(""); }}
                            >
                                <Text style={[styles.typeButtonText, type === "income" ? styles.incomeText : styles.inactiveText]}>
                                    Income
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Wallet Selector */}
                        {wallets.length > 0 && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Wallet</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={() => setShowWalletPicker(true)}>
                                    <Text style={styles.dropdownText}>{selectedWalletName}</Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.neutral400} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Category Selector */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Category</Text>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCategoryPicker(true)}>
                                <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                                    {category || "Select category"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.neutral400} />
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Date</Text>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.dropdownText}>
                                    {date.toLocaleDateString()}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.neutral400} />
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                themeVariant="dark"
                            />
                        )}

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

                        {/* Description/Note Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Add details..."
                                placeholderTextColor="#9ca3af"
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        {/* Receipt Image */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Receipt (optional)</Text>
                            <TouchableOpacity style={styles.receiptButton} onPress={pickReceiptImage}>
                                {receiptImage ? (
                                    <View style={styles.receiptPreview}>
                                        <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                                        <TouchableOpacity
                                            style={styles.removeReceipt}
                                            onPress={() => setReceiptImage(null)}
                                        >
                                            <Ionicons name="close-circle" size={24} color={colors.rose} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.receiptPlaceholder}>
                                        <Ionicons name="camera-outline" size={24} color={colors.neutral400} />
                                        <Text style={styles.receiptText}>Add Receipt</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
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

            {/* Category Picker Modal */}
            <Modal visible={showCategoryPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.modalItem, category === cat && styles.modalItemActive]}
                                    onPress={() => { setCategory(cat); setShowCategoryPicker(false); }}
                                >
                                    <Text style={[styles.modalItemText, category === cat && styles.modalItemTextActive]}>
                                        {cat}
                                    </Text>
                                    {category === cat && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Wallet Picker Modal */}
            <Modal visible={showWalletPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Wallet</Text>
                            <TouchableOpacity onPress={() => setShowWalletPicker(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {wallets.map((wallet) => (
                                <TouchableOpacity
                                    key={wallet.id}
                                    style={[styles.modalItem, selectedWallet === wallet.id && styles.modalItemActive]}
                                    onPress={() => { setSelectedWallet(wallet.id); setShowWalletPicker(false); }}
                                >
                                    <Text style={[styles.modalItemText, selectedWallet === wallet.id && styles.modalItemTextActive]}>
                                        {wallet.name}
                                    </Text>
                                    {selectedWallet === wallet.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
        color: 'white',
        minHeight: 48,
    },
    amountInput: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    dropdown: {
        backgroundColor: colors.neutral800,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: 'white',
        fontSize: 16,
    },
    placeholderText: {
        color: '#9ca3af',
    },
    receiptButton: {
        backgroundColor: colors.neutral800,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    receiptPlaceholder: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptText: {
        color: colors.neutral400,
        marginTop: 8,
    },
    receiptPreview: {
        position: 'relative',
    },
    receiptImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    removeReceipt: {
        position: 'absolute',
        top: 8,
        right: 8,
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
        borderRadius: 12,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.neutral800,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral700,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 12,
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: colors.neutral900,
    },
    modalItemActive: {
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    modalItemText: {
        color: 'white',
        fontSize: 16,
    },
    modalItemTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
});
