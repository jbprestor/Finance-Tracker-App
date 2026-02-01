import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import Typo from "../components/Typo";
import { Input } from "../components/ui/Input";
import { colors } from "../constants/theme";
import { useAuth } from "../context/authContext";
import { db } from "../firebaseConfig";
import { updateUserProfile } from "../services/databaseService";

export default function PersonalProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [name, setName] = useState(user?.displayName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [image, setImage] = useState<string | null>(user?.photoURL || null);
    const [loading, setLoading] = useState(false);

    // Fetch user's photo from Firestore on mount
    useEffect(() => {
        const fetchUserPhoto = async () => {
            if (!user?.uid) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data?.photoURL) {
                        setImage(data.photoURL);
                    }
                    if (data?.phone) {
                        setPhone(data.phone);
                    }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchUserPhoto();
    }, [user?.uid]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.3, // Lower quality to reduce base64 size
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Pick image error:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const convertToBase64 = async (uri: string): Promise<string> => {
        try {
            // Web platform: use fetch + FileReader
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }

            // Native (iOS/Android): use expo-file-system
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            // Return as data URI so it can be used directly in Image source
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            console.error("Base64 conversion error:", error);
            throw error;
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let photoURL = user.photoURL;

            // Convert new local image to base64
            if (image && image !== user.photoURL && !image.startsWith("data:") && !image.startsWith("http")) {
                console.log("Converting image to base64...");
                photoURL = await convertToBase64(image);
                console.log("Base64 conversion done, length:", photoURL?.length);
            } else if (image?.startsWith("data:")) {
                // Already base64
                photoURL = image;
            }

            // Update Firebase Auth Profile (name only - Base64 is too long for photoURL, max 2KB)
            await updateProfile(user, {
                displayName: name,
                // Note: photoURL stored in Firestore only due to Auth's 2KB limit
            });

            // Update Firestore User Doc
            await updateUserProfile(user.uid, {
                name,
                phone,
                photoURL: photoURL || undefined
            });

            // Reload user to refresh state
            await user.reload();

            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error: any) {
            console.error("Save profile error:", error);
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={{ backgroundColor: colors.neutral900 }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Typo size={20} fontWeight="700" color="white">Personal Profile</Typo>
                <View style={{ width: 34 }} />
            </View>

            <View style={styles.container}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        <Image
                            source={image ? { uri: image } : require("../assets/images/welcome.png")}
                            style={styles.avatar}
                        />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Fields */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Typo size={14} color={colors.neutral400} style={{ marginBottom: 8 }}>Full Name</Typo>
                        <Input
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                            icon={<Ionicons name="person-outline" size={20} color={colors.neutral500} />}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typo size={14} color={colors.neutral400} style={{ marginBottom: 8 }}>Email Address</Typo>
                        <Input
                            value={email}
                            editable={false}
                            placeholder="Email"
                            icon={<Ionicons name="mail-outline" size={20} color={colors.neutral500} />}
                            containerStyle={{ opacity: 0.5 }}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typo size={14} color={colors.neutral400} style={{ marginBottom: 8 }}>Phone Number</Typo>
                        <Input
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone Number"
                            icon={<Ionicons name="call-outline" size={20} color={colors.neutral500} />}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <Typo size={16} fontWeight="700" color="white">Saving...</Typo>
                    ) : (
                        <Typo size={16} fontWeight="700" color="white">Save Changes</Typo>
                    )}
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
        marginBottom: 20,
    },
    iconButton: {
        padding: 5,
        backgroundColor: colors.neutral800,
        borderRadius: 12,
    },
    container: {
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.neutral700,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.neutral900,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
    }
});
