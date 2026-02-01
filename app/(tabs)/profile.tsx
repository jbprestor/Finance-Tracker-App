import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Typo from "../../components/Typo";
import { colors } from "../../constants/theme";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebaseConfig";
import { verticalScale } from "../../utils/styling";

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    // Fetch user's profile photo from Firestore
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user?.uid) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data?.photoURL) {
                        setProfilePhoto(data.photoURL);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchUserProfile();
    }, [user?.uid]);

    const handleLogout = async () => {
        await signOut();
    };

    const menuItems = [
        { icon: "diamond-outline", label: "Invite Friends", route: "/invite" },
        { icon: "person-outline", label: "Account info", route: "/account-info" },
        { icon: "people-outline", label: "Personal profile", route: "/personal-profile" },
        { icon: "mail-outline", label: "Message center", route: "/message-center" },
        { icon: "shield-checkmark-outline", label: "Login and security", route: "/security" },
        { icon: "lock-closed-outline", label: "Data and privacy", route: "/privacy" },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Typo size={20} fontWeight="700" color="white">Profile</Typo>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Avatar Section (Overlapping) */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                    <Image
                        source={profilePhoto ? { uri: profilePhoto } : require("../../assets/images/welcome.png")}
                        style={styles.avatar}
                    />
                </View>
                <Typo size={22} fontWeight="700" color={colors.text} style={{ marginTop: 10 }}>
                    {user?.displayName || "Enjelin Morgeana"}
                </Typo>
                <Typo size={14} color={colors.neutral400} style={{ marginTop: 5 }}>
                    @{user?.email?.split('@')[0] || "enjelin_morgeana"}
                </Typo>
            </View>

            {/* Menu Options */}
            <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => {
                    const isFirst = index === 0;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => item.route && router.push(item.route as any)}
                        >
                            <View style={[
                                styles.iconContainer,
                                isFirst && styles.inviteIconContainer
                            ]}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={24}
                                    color={isFirst ? "#059669" : colors.neutral400}
                                />
                            </View>
                            <Typo size={16} color={colors.textLight} fontWeight="500" style={{ flex: 1, marginLeft: 15 }}>
                                {item.label}
                            </Typo>
                            {/* Chevron for indication */}
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral600} />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: colors.neutral800, // Darker header to match theme
        height: verticalScale(200),
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        padding: 5,
    },
    notificationButton: {
        padding: 5,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.rose,
    },
    avatarContainer: {
        marginTop: -60,
        alignItems: "center",
    },
    avatarWrapper: {
        backgroundColor: colors.neutral900,
        padding: 5,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: colors.neutral700,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    menuContainer: {
        paddingTop: 30,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    iconContainer: {
        width: 40,
        alignItems: "center",
        justifyContent: "center", // ensure centered
    },
    inviteIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(163, 230, 53, 0.1)", // Dark mode friendly (primary color with opacity)
        alignItems: "center",
        justifyContent: "center",
        marginRight: -4,
    },
});
