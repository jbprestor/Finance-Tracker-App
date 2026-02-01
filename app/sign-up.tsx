import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { useAuth } from "../context/authContext";
import { auth } from "../firebaseConfig";
import { createNewUser } from "../services/databaseService";

export default function SignUp() {
    const { signUp } = useAuth();
    const router = useRouter(); // Use router for manual navigation if needed
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        console.log("Registering with:", email); // Debug log

        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Auth User
            await signUp(email, password);
            console.log("Sign up successful");
            // 2. We should ideally create the database entry here, but 
            // since we are using `onAuthStateChanged` in context, the user might be logged in immediately.
            // However, `signUp` wraps `createUserWithEmailAndPassword`.
            // We can get the user from the context or the result of signUp if we modified it to return the UserCredential.

            // Better approach: modifying authContext to return the user or handle DB creation there?
            // Or just letting the `onAuthStateChanged` trigger.
            // But we specifically need to create the Firestore document `createNewUser`.
            // The `signUp` function in authContext returns `Promise<void>`.
            // Usage of `auth.currentUser` is synchronous after `await signUp` resolves? Yes.

            // Actually, safest is to do it here if we know it succeeded.
            if (auth.currentUser) {
                await createNewUser(auth.currentUser.uid, email);
            }

            Alert.alert("Success", "Account created successfully!");
            // Context will handle redirect to Home
        } catch (e: any) {
            console.error("Registration error:", e);
            let msg = e.message;
            if (msg.includes("auth/email-already-in-use")) {
                msg = "This email is already registered. Please sign in instead.";
            }
            Alert.alert("Registration Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-2xl font-bold text-white mb-8">Create Account</Text>

                <View className="w-full mb-4">
                    <Text className="text-gray-300 mb-2">Email</Text>
                    <TextInput
                        className="w-full border border-gray-700 rounded-lg p-3 bg-neutral-800 text-white focus:border-primary"
                        placeholder="Enter your email"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="w-full mb-4">
                    <Text className="text-gray-300 mb-2">Password</Text>
                    <TextInput
                        className="w-full border border-gray-700 rounded-lg p-3 bg-neutral-800 text-white focus:border-primary"
                        placeholder="Create a password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <View className="w-full mb-6">
                    <Text className="text-gray-300 mb-2">Confirm Password</Text>
                    <TextInput
                        className="w-full border border-gray-700 rounded-lg p-3 bg-neutral-800 text-white focus:border-primary"
                        placeholder="Confirm your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity
                    className="w-full bg-primary p-4 rounded-lg items-center mb-4"
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-neutral-900 font-semibold text-lg">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <Link href="/sign-in" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary text-sm">Already have an account? Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScreenWrapper>
    );
}
