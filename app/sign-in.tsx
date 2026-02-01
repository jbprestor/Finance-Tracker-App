import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { useAuth } from "../context/authContext";

export default function SignIn() {
    const { signIn, signInWithGoogle, signInWithFacebook, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (e: any) {
            Alert.alert("Login Failed", e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (e: any) {
            Alert.alert("Google Login Failed", e.message);
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            await signInWithFacebook();
        } catch (e: any) {
            Alert.alert("Facebook Login Failed", e.message);
        }
    };

    return (
        <ScreenWrapper>
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-3xl font-bold text-white mb-8">Welcome Back</Text>

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

                <View className="w-full mb-6">
                    <Text className="text-gray-300 mb-2">Password</Text>
                    <TextInput
                        className="w-full border border-gray-700 rounded-lg p-3 bg-neutral-800 text-white focus:border-primary"
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    className="w-full bg-primary p-4 rounded-lg items-center mb-4"
                    onPress={handleSignIn}
                    disabled={loading || isLoading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-neutral-900 font-semibold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row items-center w-full my-4">
                    <View className="flex-1 h-px bg-gray-700" />
                    <Text className="mx-4 text-gray-500">OR</Text>
                    <View className="flex-1 h-px bg-gray-700" />
                </View>

                <TouchableOpacity
                    className="w-full bg-red-500 p-4 rounded-lg items-center mb-3"
                    onPress={handleGoogleSignIn}
                >
                    <Text className="text-white font-semibold">Sign in with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full bg-blue-800 p-4 rounded-lg items-center mb-6"
                    onPress={handleFacebookSignIn}
                >
                    <Text className="text-white font-semibold">Sign in with Facebook</Text>
                </TouchableOpacity>

                <View className="flex-row">
                    <Text className="text-gray-400">Don't have an account? </Text>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary font-bold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ScreenWrapper>
    );
}
