import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <View className={`rounded-xl p-4 shadow-sm ${className}`} {...props}>
            {children}
        </View>
    );
}
