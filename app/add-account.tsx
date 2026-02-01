import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
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
import { addWallet } from "../services/databaseService";

// Card types
const CARD_TYPES = [
    { id: 'visa', name: 'Visa', icon: 'card' },
    { id: 'mastercard', name: 'Mastercard', icon: 'card' },
    { id: 'amex', name: 'Amex', icon: 'card' },
    { id: 'debit', name: 'Debit Card', icon: 'card-outline' },
    { id: 'credit', name: 'Credit Card', icon: 'card' },
];

// Account types
const ACCOUNT_TYPES = [
    { id: 'savings', name: 'Savings', icon: 'wallet' },
    { id: 'checking', name: 'Checking', icon: 'cash' },
    { id: 'investment', name: 'Investment', icon: 'trending-up' },
    { id: 'cash', name: 'Cash', icon: 'cash-outline' },
];

// Predefined colors
const WALLET_COLORS = [
    "#a3e635", "#22c55e", "#3b82f6", "#8b5cf6",
    "#f59e0b", "#ef4444", "#ec4899", "#06b6d4",
];

type TabType = "Cards" | "Accounts";

export default function AddAccountScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<TabType>("Cards");
    const [name, setName] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [initialBalance, setInitialBalance] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const pickCustomImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.3,
            });

            if (!result.canceled) {
                if (Platform.OS === 'web') {
                    const response = await fetch(result.assets[0].uri);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setCustomImage(reader.result as string);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: 'base64',
                    });
                    setCustomImage(`data:image/jpeg;base64,${base64}`);
                }
            }
        } catch (error) {
            console.error("Pick image error:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleAdd = async () => {
        if (!user) return;

        if (!name.trim()) {
            Alert.alert("Missing Name", `Please enter a ${activeTab === 'Cards' ? 'card' : 'account'} name.`);
            return;
        }

        setIsLoading(true);
        try {
            const typeInfo = activeTab === 'Cards'
                ? CARD_TYPES.find(t => t.id === selectedType)
                : ACCOUNT_TYPES.find(t => t.id === selectedType);

            await addWallet(user.uid, {
                name: name.trim(),
                icon: customImage || `${typeInfo?.icon || 'wallet'}:${selectedColor}`,
                balance: parseFloat(initialBalance) || 0,
            });
            Alert.alert("Success", `${activeTab === 'Cards' ? 'Card' : 'Account'} added successfully!`, [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Add error:", error);
            Alert.alert("Error", "Failed to add: " + (error.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const types = activeTab === 'Cards' ? CARD_TYPES : ACCOUNT_TYPES;

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
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Add New</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Tab Selector */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === "Cards" && styles.activeTab]}
                                onPress={() => { setActiveTab("Cards"); setSelectedType(""); }}
                            >
                                <Text style={[styles.tabText, activeTab === "Cards" && styles.activeTabText]}>
                                    Cards
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === "Accounts" && styles.activeTab]}
                                onPress={() => { setActiveTab("Accounts"); setSelectedType(""); }}
                            >
                                <Text style={[styles.tabText, activeTab === "Accounts" && styles.activeTabText]}>
                                    Accounts
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{activeTab === 'Cards' ? 'Card' : 'Account'} Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={activeTab === 'Cards' ? "e.g. My Visa Card" : "e.g. Savings Account"}
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Card Number (only for cards) */}
                        {activeTab === 'Cards' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Card Number (last 4 digits)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="•••• 1234"
                                    placeholderTextColor="#9ca3af"
                                    value={cardNumber}
                                    onChangeText={(text) => setCardNumber(text.replace(/[^0-9]/g, '').slice(0, 4))}
                                    keyboardType="numeric"
                                    maxLength={4}
                                />
                            </View>
                        )}

                        {/* Initial Balance */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Balance</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={initialBalance}
                                onChangeText={setInitialBalance}
                            />
                        </View>

                        {/* Type Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{activeTab === 'Cards' ? 'Card' : 'Account'} Type</Text>
                            <View style={styles.typeGrid}>
                                {types.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeOption,
                                            selectedType === type.id && [styles.typeOptionSelected, { borderColor: selectedColor }],
                                        ]}
                                        onPress={() => setSelectedType(type.id)}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={24}
                                            color={selectedType === type.id ? selectedColor : colors.neutral400}
                                        />
                                        <Text style={[
                                            styles.typeText,
                                            selectedType === type.id && { color: selectedColor }
                                        ]}>
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Icon/Image Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Icon</Text>

                            {customImage ? (
                                <View style={styles.customImageContainer}>
                                    <Image source={{ uri: customImage }} style={styles.customImage} />
                                    <TouchableOpacity
                                        style={styles.removeImage}
                                        onPress={() => setCustomImage(null)}
                                    >
                                        <Ionicons name="close-circle" size={24} color={colors.rose} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickCustomImage}>
                                        <Ionicons name="image-outline" size={20} color={colors.neutral400} />
                                        <Text style={styles.uploadText}>Upload Custom Image</Text>
                                    </TouchableOpacity>

                                    {/* Color Picker */}
                                    <View style={styles.colorGrid}>
                                        {WALLET_COLORS.map((color) => (
                                            <TouchableOpacity
                                                key={color}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: color },
                                                    selectedColor === color && styles.colorOptionSelected,
                                                ]}
                                                onPress={() => setSelectedColor(color)}
                                            >
                                                {selectedColor === color && (
                                                    <Ionicons name="checkmark" size={16} color="white" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
                            onPress={handleAdd}
                            disabled={isLoading}
                        >
                            <Text style={styles.addButtonText}>
                                {isLoading ? "Adding..." : `Add ${activeTab === 'Cards' ? 'Card' : 'Account'}`}
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
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.neutral800,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: colors.white,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.neutral400,
    },
    activeTabText: {
        color: colors.neutral900,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: colors.neutral400,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.neutral800,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
        color: 'white',
        fontSize: 16,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: colors.neutral800,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    typeOptionSelected: {
        borderWidth: 2,
    },
    typeText: {
        color: colors.neutral400,
        fontSize: 14,
    },
    customImageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    customImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    removeImage: {
        position: 'absolute',
        top: -8,
        right: '35%',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    uploadText: {
        color: colors.neutral400,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: 'white',
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: colors.neutral800,
        backgroundColor: colors.neutral900,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        color: colors.neutral900,
        fontWeight: '700',
        fontSize: 16,
    },
});
