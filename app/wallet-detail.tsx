import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { deleteWallet, getUserWallets, updateWallet, WalletData } from "../services/databaseService";

// Predefined colors
const WALLET_COLORS = [
    "#a3e635", "#22c55e", "#3b82f6", "#8b5cf6",
    "#f59e0b", "#ef4444", "#ec4899", "#06b6d4",
];

// Predefined icons
const WALLET_ICONS = [
    "wallet", "card", "cash", "business", "briefcase", "gift",
    "home", "airplane", "restaurant", "cart", "medical", "school",
];

export default function WalletDetailScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { top } = useSafeAreaInsets();

    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("wallet");
    const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch wallet data
    useEffect(() => {
        const fetchWallet = async () => {
            if (!user?.uid || !id) return;
            try {
                const wallets = await getUserWallets(user.uid);
                const found = wallets.find(w => w.id === id);
                if (found) {
                    setWallet(found);
                    setName(found.name);
                    setBalance(found.balance.toString());

                    // Parse icon
                    if (found.icon?.startsWith('data:')) {
                        setCustomImage(found.icon);
                    } else if (found.icon?.includes(':')) {
                        const [iconName, iconColor] = found.icon.split(':');
                        setSelectedIcon(iconName);
                        setSelectedColor(iconColor);
                    }
                }
            } catch (error) {
                console.error("Error fetching wallet:", error);
            }
        };
        fetchWallet();
    }, [user?.uid, id]);

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

    const handleSave = async () => {
        if (!user || !id) return;

        if (!name.trim()) {
            Alert.alert("Missing Name", "Please enter a wallet name.");
            return;
        }

        setIsLoading(true);
        try {
            await updateWallet(user.uid, id, {
                name: name.trim(),
                icon: customImage || `${selectedIcon}:${selectedColor}`,
                balance: parseFloat(balance) || 0,
            });
            Alert.alert("Success", "Wallet updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Update error:", error);
            Alert.alert("Error", "Failed to update wallet: " + (error.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Wallet",
            `Are you sure you want to delete "${wallet?.name}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (!user || !id) return;
                        setIsDeleting(true);
                        try {
                            await deleteWallet(user.uid, id);
                            router.back();
                        } catch (error: any) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Failed to delete wallet");
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (!wallet) {
        return (
            <View style={[styles.container, { paddingTop: top > 0 ? top + 5 : 30, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.neutral400 }}>Loading...</Text>
            </View>
        );
    }

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
                            <Text style={styles.headerTitle}>Edit Wallet</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Wallet Preview */}
                        <View style={styles.previewContainer}>
                            <View style={[styles.previewIcon, { backgroundColor: customImage ? 'transparent' : selectedColor }]}>
                                {customImage ? (
                                    <Image source={{ uri: customImage }} style={styles.previewImage} />
                                ) : (
                                    <Ionicons name={selectedIcon as any} size={40} color="white" />
                                )}
                            </View>
                            <Text style={styles.previewName}>{name || "Wallet Name"}</Text>
                        </View>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Wallet Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Salary, Savings"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Balance Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Balance</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={balance}
                                onChangeText={setBalance}
                            />
                        </View>

                        {/* Icon Selection */}
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

                                    {/* Icon Grid */}
                                    <View style={styles.iconGrid}>
                                        {WALLET_ICONS.map((icon) => (
                                            <TouchableOpacity
                                                key={icon}
                                                style={[
                                                    styles.iconOption,
                                                    selectedIcon === icon && [styles.iconOptionSelected, { backgroundColor: selectedColor }],
                                                ]}
                                                onPress={() => setSelectedIcon(icon)}
                                            >
                                                <Ionicons
                                                    name={icon as any}
                                                    size={22}
                                                    color={selectedIcon === icon ? "white" : colors.neutral400}
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

                        {/* Delete Button */}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDelete}
                            disabled={isDeleting}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.rose} />
                            <Text style={styles.deleteButtonText}>
                                {isDeleting ? "Deleting..." : "Delete Wallet"}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Footer Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            <Text style={styles.saveButtonText}>
                                {isLoading ? "Saving..." : "Save Changes"}
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
    previewContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    previewIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewName: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
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
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    iconOption: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.neutral800,
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
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.rose,
        marginTop: 20,
        marginBottom: 20,
    },
    deleteButtonText: {
        color: colors.rose,
        fontWeight: '600',
        fontSize: 16,
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
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: colors.neutral900,
        fontWeight: '700',
        fontSize: 16,
    },
});
