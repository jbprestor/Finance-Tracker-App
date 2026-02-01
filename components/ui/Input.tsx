import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    labelClassName?: string;
    icon?: React.ReactNode;
    containerStyle?: any;
}

export function Input({ label, labelClassName, className, icon, containerStyle, ...props }: InputProps) {
    return (
        <View className="w-full mb-4" style={containerStyle}>
            {label && <Text className={`text-gray-400 font-medium mb-1.5 ${labelClassName}`}>{label}</Text>}
            <View className="relative">
                <TextInput
                    className={`w-full bg-neutral-800 px-4 py-3 rounded-lg border border-neutral-700 focus:border-primary text-white ${icon ? 'pl-11' : ''} ${className}`}
                    placeholderTextColor="#9ca3af"
                    style={{ minHeight: 44 }}
                    {...props}
                />
                {icon && (
                    <View className="absolute left-3 top-3">
                        {icon}
                    </View>
                )}
            </View>
        </View>
    );
}
