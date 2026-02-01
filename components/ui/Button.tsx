import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
}

export function Button({ title, onPress, variant = "primary", isLoading = false }: ButtonProps) {
    let bgClass = "bg-blue-500";
    let textClass = "text-white";

    if (variant === "secondary") {
        bgClass = "bg-gray-200";
        textClass = "text-gray-800";
    } else if (variant === "danger") {
        bgClass = "bg-red-500";
        textClass = "text-white";
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg items-center justify-center ${bgClass} ${isLoading ? "opacity-70" : ""}`}
            style={{ minHeight: 44 }} // Accessibility min-height
        >
            {isLoading ? (
                <ActivityIndicator color={variant === "secondary" ? "#1f2937" : "#ffffff"} />
            ) : (
                <Text className={`font-semibold text-base ${textClass}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
