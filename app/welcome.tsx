import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import ScreenWrapper from "../components/ScreenWrapper";
import Typo from "../components/Typo";
import { colors, spacingY } from "../constants/theme";
import { useAuth } from "../context/authContext";
import { verticalScale } from "../utils/styling";

export default function Welcome() {
    const router = useRouter();
    const { signInWithGoogle } = useAuth();

    return (
        <ScreenWrapper>
            <View className="flex-1 justify-between bg-neutral-900">
                {/* Header: Sign In Link */}
                <View className="items-end p-5">
                    <TouchableOpacity onPress={() => router.push("/sign-in")}>
                        <Typo size={16} color={colors.textLight} fontWeight="500">
                            Sign in
                        </Typo>
                    </TouchableOpacity>
                </View>

                {/* Hero Image - Centered and Animated */}
                <View className="flex-1 items-center justify-center -mt-10">
                    <Animated.Image
                        entering={FadeIn.duration(1000)}
                        source={require("../assets/images/welcome.png")}
                        resizeMode="contain"
                        style={{
                            width: "100%",
                            height: verticalScale(350),
                            maxHeight: 400,
                        }}
                    />
                </View>

                {/* Bottom Content - Swipe/Fade Up */}
                <View className="w-full px-5 pb-10">
                    <Animated.View entering={FadeInDown.duration(1000).springify().damping(12)}>
                        <Typo
                            size={36}
                            fontWeight="800"
                            style={{ textAlign: "center", marginBottom: spacingY._15 }}
                        >
                            Always take control
                            <Typo size={36} fontWeight="800" color={colors.primary}>
                                {"\n"}of your finances
                            </Typo>
                        </Typo>

                        <Typo
                            size={16}
                            color={colors.textLight}
                            style={{
                                textAlign: "center",
                                marginBottom: spacingY._35,
                                paddingHorizontal: 20,
                                lineHeight: 24
                            }}
                        >
                            Finances must be arranged to set a better lifestyle in future
                        </Typo>

                        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify().damping(12)}>
                            <TouchableOpacity
                                className="w-full py-4 rounded-full items-center justify-center bg-primary"
                                style={{
                                    shadowColor: colors.primary,
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 20,
                                    elevation: 10,
                                    marginBottom: spacingY._15
                                }}
                                onPress={() => router.push("/sign-up")}
                                activeOpacity={0.8}
                            >
                                <Typo size={20} fontWeight="700" color={colors.neutral900}>
                                    Get Started
                                </Typo>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </View>
            </View>
        </ScreenWrapper>
    );
}
