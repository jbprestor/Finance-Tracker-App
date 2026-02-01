import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function ConnectWalletScreen() {
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 5 : 30;

    const [activeTab, setActiveTab] = useState<"Cards" | "Accounts">("Cards");
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cvc, setCvc] = useState("");
    const [expiry, setExpiry] = useState("");
    const [zip, setZip] = useState("");
    const [loading, setLoading] = useState(false);

    // Format card number with spaces every 4 digits
    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        if (cleaned.length <= 16) {
            setCardNumber(formatted);
        }
    };

    // Format expiry as MM/YY
    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned.length >= 2) {
            setExpiry(cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4));
        } else {
            setExpiry(cleaned);
        }
    };

    const handleSave = () => {
        // Placeholder save logic
        if (!cardNumber || !cardName || !cvc || !expiry) {
            Alert.alert("Error", "Please fill in all card details");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Card added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Connect Wallet</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "Cards" && styles.activeTab]}
                            onPress={() => setActiveTab("Cards")}
                        >
                            <Text style={[styles.tabText, activeTab === "Cards" ? styles.activeTabText : styles.inactiveTabText]}>
                                Cards
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "Accounts" && styles.activeTab]}
                            onPress={() => setActiveTab("Accounts")}
                        >
                            <Text style={[styles.tabText, activeTab === "Accounts" ? styles.activeTabText : styles.inactiveTabText]}>
                                Accounts
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Card Visual */}
                    <LinearGradient
                        colors={['#2CC1BE', '#115E59']} // Teal gradient to match theme
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardVisual}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.debitLabel}>Debit Card</Text>
                            <Text style={styles.cardBrand}>Mono</Text>
                        </View>

                        <View style={styles.chipContainer}>
                            {/* Valid simulated chip */}
                            <View style={styles.chip} />
                        </View>

                        <Text style={styles.cardNumberDisplay}>
                            {cardNumber || "0000 0000 0000 0000"}
                        </Text>

                        <View style={styles.cardFooter}>
                            <Text style={styles.cardNameDisplay}>{cardName.toUpperCase() || "YOUR NAME"}</Text>
                            <Text style={styles.cardExpiryDisplay}>{expiry || "MM/YY"}</Text>
                        </View>
                    </LinearGradient>

                    {/* Form Title */}
                    <Text style={styles.sectionTitle}>Add your debit Card</Text>
                    <Text style={styles.sectionSubtitle}>This card must be connected to a bank account under your name</Text>

                    {/* Form Fields */}
                    {/* Name on Card */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.labelWrapper}>
                            <Text style={styles.labelText}>NAME ON CARD</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="NAME ON CARD"
                            placeholderTextColor="#6b7280"
                            value={cardName}
                            onChangeText={setCardName}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* Row 1: Number & CVC */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="DEBIT CARD NUMBER"
                                placeholderTextColor="#6b7280"
                                keyboardType="number-pad"
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                                maxLength={19} // 16 digits + 3 spaces
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="CVC"
                                placeholderTextColor="#6b7280"
                                keyboardType="number-pad"
                                value={cvc}
                                onChangeText={setCvc}
                                maxLength={3}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {/* Row 2: Expiry & Zip */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="EXPIRATION MM/YY"
                                placeholderTextColor="#6b7280"
                                keyboardType="number-pad"
                                value={expiry}
                                onChangeText={handleExpiryChange}
                                maxLength={5}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="ZIP"
                                placeholderTextColor="#6b7280"
                                keyboardType="number-pad"
                                value={zip}
                                onChangeText={setZip}
                            />
                        </View>
                    </View>

                    {/* Placeholder for spacer */}
                    <View style={{ height: 100 }} />

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Card"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: colors.neutral900,
    },
    headerBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "white",
    },
    content: {
        padding: 20,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: colors.neutral800, // Slightly lighter than background
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: "white",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
    },
    activeTabText: {
        color: "black",
    },
    inactiveTabText: {
        color: colors.neutral400,
    },
    cardVisual: {
        height: 200,
        borderRadius: 20,
        padding: 24,
        justifyContent: "space-between",
        marginBottom: 30,
        elevation: 5,
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    debitLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        fontWeight: "600",
    },
    cardBrand: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    chipContainer: {
        marginVertical: 10,
    },
    chip: {
        width: 40,
        height: 30,
        backgroundColor: "#e2e8f0",
        borderRadius: 6,
        // Optional: Add inner details for chip realism using Views or Image
        opacity: 0.8,
    },
    cardNumberDisplay: {
        color: "white",
        fontSize: 22,
        fontWeight: "600",
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginVertical: 10,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    cardNameDisplay: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    cardExpiryDisplay: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    sectionTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: colors.neutral400,
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    labelWrapper: {
        position: 'absolute',
        top: -10,
        left: 12,
        zIndex: 1,
        backgroundColor: colors.neutral900, // Match bg to hide border
        paddingHorizontal: 4,
    },
    labelText: {
        color: colors.teal, // Accent color for label
        fontSize: 12,
        fontWeight: "700",
    },
    input: {
        borderWidth: 1,
        borderColor: colors.teal, // Active border look
        borderRadius: 12,
        padding: 16,
        color: "white",
        fontSize: 16,
        backgroundColor: "transparent", // or neutral800
    },
    row: {
        flexDirection: "row",
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.neutral900,
        borderTopWidth: 1,
        borderTopColor: colors.neutral800,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    }
});
