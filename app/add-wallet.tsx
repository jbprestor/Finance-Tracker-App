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

// Predefined wallet icons (using Ionicons names)
const WALLET_ICONS = [
    { name: "wallet", label: "Wallet" },
    { name: "card", label: "Card" },
    { name: "cash", label: "Cash" },
    { name: "business", label: "Business" },
    { name: "briefcase", label: "Work" },
    { name: "gift", label: "Gift" },
    { name: "home", label: "Home" },
    { name: "airplane", label: "Travel" },
    { name: "restaurant", label: "Food" },
    { name: "cart", label: "Shopping" },
    { name: "medical", label: "Medical" },
    { name: "school", label: "Education" },
];

// Predefined colors for wallet icons
const WALLET_COLORS = [
    "#a3e635", // lime
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
];

export default function AddWalletScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { top } = useSafeAreaInsets();

    const [name, setName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("wallet");
    const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [initialBalance, setInitialBalance] = useState("");
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

    const handleAddWallet = async () => {
        if (!user) return;

        if (!name.trim()) {
            Alert.alert("Missing Name", "Please enter a wallet name.");
            return;
        }

        setIsLoading(true);
        try {
            await addWallet(user.uid, {
                name: name.trim(),
                icon: customImage || `${selectedIcon}:${selectedColor}`,
                balance: parseFloat(initialBalance) || 0,
            });
            Alert.alert("Success", "Wallet added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Add wallet error:", error);
            Alert.alert("Error", "Failed to add wallet: " + (error.message || "Unknown error"));
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
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>New Wallet</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Wallet Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Wallet Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Salary, Side Hustle"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Initial Balance (optional) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Initial Balance (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={initialBalance}
                                onChangeText={setInitialBalance}
                            />
                        </View>

                        {/* Wallet Icon */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Wallet Icon</Text>

                            {/* Custom Image Preview */}
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
                                    {/* Selected Icon Preview */}
                                    <View style={[styles.selectedIconPreview, { backgroundColor: selectedColor }]}>
                                        <Ionicons name={selectedIcon as any} size={48} color="white" />
                                    </View>

                                    {/* Upload Custom Image */}
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickCustomImage}>
                                        <Ionicons name="image-outline" size={20} color={colors.neutral400} />
                                        <Text style={styles.uploadText}>Upload Custom Image</Text>
                                    </TouchableOpacity>

                                    {/* Icon Grid */}
                                    <View style={styles.iconGrid}>
                                        {WALLET_ICONS.map((icon) => (
                                            <TouchableOpacity
                                                key={icon.name}
                                                style={[
                                                    styles.iconOption,
                                                    selectedIcon === icon.name && styles.iconOptionSelected,
                                                    { backgroundColor: selectedIcon === icon.name ? selectedColor : colors.neutral800 }
                                                ]}
                                                onPress={() => setSelectedIcon(icon.name)}
                                            >
                                                <Ionicons
                                                    name={icon.name as any}
                                                    size={24}
                                                    color={selectedIcon === icon.name ? "white" : colors.neutral400}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>

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
                            onPress={handleAddWallet}
                            disabled={isLoading}
                        >
                            <Text style={styles.addButtonText}>
                                {isLoading ? "Adding..." : "Add Wallet"}
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
        marginBottom: 32,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    inputContainer: {
        marginBottom: 24,
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
    selectedIconPreview: {
        width: 100,
        height: 100,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    customImageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    customImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
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
        marginBottom: 20,
    },
    uploadText: {
        color: colors.neutral400,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconOptionSelected: {
        borderWidth: 2,
        borderColor: 'white',
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
