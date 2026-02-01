import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    labelClassName?: string;
}

export function Input({ label, labelClassName, className, ...props }: InputProps) {
    return (
        <View className="w-full mb-4">
            {label && <Text className={`text-gray-400 font-medium mb-1.5 ${labelClassName}`}>{label}</Text>}
            <TextInput
                className={`w-full bg-neutral-800 px-4 py-3 rounded-lg border border-neutral-700 focus:border-primary text-white ${className}`}
                placeholderTextColor="#9ca3af"
                style={{ minHeight: 44 }} // Accessibility min-height
                {...props}
            />
        </View>
    );
}
