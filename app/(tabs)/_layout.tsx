import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary, // Lime green to match Home
            tabBarInactiveTintColor: colors.neutral400,
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: colors.neutral900,
                borderTopColor: colors.neutral800,
                height: 70,
                paddingTop: 10,
            },
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: "Statistics",
                    tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: "Wallet",
                    tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />
                }}
            />
        </Tabs>
    );
}
