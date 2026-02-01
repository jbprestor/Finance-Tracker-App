import { colors } from "@/constants/theme";
import { ScreenWrapperProps } from "@/types";
import React from "react";
import {
    StatusBar,
    View
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function ScreenWrapper({ style, children, useInsets = true }: ScreenWrapperProps & { useInsets?: boolean }) {
    const { top } = useSafeAreaInsets();
    const paddingTop = useInsets ? (top > 0 ? top + 5 : 30) : 0;

    return (
        <View
            style={[
                {
                    paddingTop,
                    flex: 1,
                    backgroundColor: colors.neutral900,
                },
                style,
            ]}
        >
            <StatusBar barStyle="light-content" />
            {children}
        </View>
    );
}
