import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, spacingY, verticalScale } from "../../constants/theme";
import Typo from "../Typo";

export default function WalletActions({ onAddPress }: { onAddPress?: () => void }) {
    const router = useRouter();

    const actions = [
        {
            id: 1,
            icon: "add" as const,
            label: "Add",
            onPress: () => {
                if (onAddPress) {
                    onAddPress();
                } else {
                    router.push("/add-transaction");
                }
            },
        },
        {
            id: 2,
            icon: "card" as const, // or "grid" if using different icon set
            label: "Pay",
            onPress: () => { console.log("Pay pressed") }, // Placeholder
        },
        {
            id: 3,
            icon: "paper-plane" as const,
            label: "Send",
            onPress: () => { console.log("Send pressed") }, // Placeholder
        },
    ];

    return (
        <View style={styles.container}>
            {actions.map((item) => (
                <View key={item.id} style={styles.actionItem}>
                    <TouchableOpacity
                        style={styles.circle}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={item.icon} size={28} color={colors.tealLight} />
                    </TouchableOpacity>
                    <Typo size={14} color={colors.neutral200} style={{ marginTop: 8 }}>
                        {item.label}
                    </Typo>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: spacingY._20,
    },
    actionItem: {
        alignItems: "center",
    },
    circle: {
        width: verticalScale(60),
        height: verticalScale(60),
        borderRadius: verticalScale(30),
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.neutral600,
        alignItems: "center",
        justifyContent: "center",
    },
});
