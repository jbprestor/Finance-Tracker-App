import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import Typo from "../components/Typo";
import { colors } from "../constants/theme";
import { useAuth } from "../context/authContext";

export default function AccountInfoScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // Formatting join date or using mock
    const joinDate = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : "January 2026";

    const InfoRow = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
        <View style={styles.row}>
            <View style={styles.iconWrapper}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Typo size={14} color={colors.neutral400}>{label}</Typo>
                <Typo size={16} fontWeight="600" color="white" style={{ marginTop: 4 }}>{value}</Typo>
            </View>
        </View>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Typo size={20} fontWeight="700" color="white">Account Info</Typo>
                <View style={{ width: 34 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.card}>
                    <InfoRow
                        label="Account Status"
                        value="Active"
                        icon="checkmark-circle-outline"
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        label="Member Since"
                        value={joinDate}
                        icon="calendar-outline"
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        label="Account Type"
                        value="Free Plan"
                        icon="pricetag-outline"
                    />
                </View>

                <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={colors.rose} />
                    <Typo size={16} fontWeight="600" color={colors.rose} style={{ marginLeft: 10 }}>
                        Delete Account
                    </Typo>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 30,
    },
    iconButton: {
        padding: 5,
        backgroundColor: colors.neutral800,
        borderRadius: 12,
    },
    container: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: colors.neutral800,
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral700,
        marginVertical: 10,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(20, 184, 166, 0.1)", // Primary with opacity
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: colors.rose,
        borderRadius: 15,
        opacity: 0.8,
    }
});
