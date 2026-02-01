import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import ScreenWrapper from "../components/ScreenWrapper";
import { useAuth } from "../context/authContext";

export default function Index() {
    const router = useRouter();

    const { user } = useAuth(); // Get user state

    useEffect(() => {
        console.log("Splash Screen Mounted");
        const timer = setTimeout(() => {
            console.log("Splash Time Ended");
            // Navigate based on auth state
            if (user) {
                router.replace("/(tabs)/home");
            } else {
                router.replace("/welcome");
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, [user]); // Add user dependence to ensure we have latest state

    return (
        <ScreenWrapper style={styles.container}>
            <Animated.Image
                entering={FadeIn.duration(1000)}
                exiting={FadeOut.duration(500)}
                style={styles.image}
                resizeMode="contain"
                source={require("../assets/images/splashImage.png")}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "50%",
        height: "30%",
    },
});
