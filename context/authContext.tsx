import { ResponseType } from "expo-auth-session";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import {
    createUserWithEmailAndPassword,
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    User
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    signInWithGoogle: async () => { },
    signInWithFacebook: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Social Login Request Hooks
    // TODO: Replace with your actual Client IDs from Google Console
    const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
        clientId: "880956986456-t0j0ujfq8ci16jgv7vb5l21834318r87.apps.googleusercontent.com",
        // iosClientId: "880956986456-p7d6ng83ubl6e9huj14qh4ggpcpvdhv6.apps.googleusercontent.com", // Commented out to force Web flow in Expo Go (avoids Bundle ID mismatch)
        androidClientId: "YOUR_ANDROID_CLIENT_ID",
    });

    // TODO: Replace with your actual App ID from Meta Developers
    const [facebookRequest, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
        clientId: "YOUR_FACEBOOK_APP_ID",
        responseType: ResponseType.Token,
    });

    useEffect(() => {
        if (googleRequest) {
            console.log("Google Auth Request Configured. Redirect URI:", googleRequest.redirectUri);
        }
    }, [googleRequest]);

    // Handle Auth State Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    // Handle Deep Linking & Google Responses
    useEffect(() => {
        if (!googleResponse) return;

        if (googleResponse.type === "success") {
            const { id_token, access_token } = googleResponse.params;
            if (id_token || access_token) {
                const credential = GoogleAuthProvider.credential(id_token, access_token);
                signInWithCredential(auth, credential).catch((err) => {
                    console.error("Firebase Sign-In Error:", err);
                });
            }
        }
    }, [googleResponse]);

    // Handle Facebook Responses
    useEffect(() => {
        if (facebookResponse?.type === "success") {
            const { access_token } = facebookResponse.params;
            const credential = FacebookAuthProvider.credential(access_token);
            signInWithCredential(auth, credential).catch((err) => console.error(err));
        }
    }, [facebookResponse]);

    // Handle Auth State Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signUp = async (email: string, pass: string) => {
        await createUserWithEmailAndPassword(auth, email, pass);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const signInWithGoogle = async () => {
        await promptGoogleAsync();
    };

    const signInWithFacebook = async () => {
        await promptFacebookAsync();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signUp,
                signOut,
                signInWithGoogle,
                signInWithFacebook
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
