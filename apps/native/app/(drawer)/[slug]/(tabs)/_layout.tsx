import { TabBarIcon } from "@/components/tabbar-icon";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { OrganizationSelector } from "@/components/organization-selector";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const { isDarkColorScheme } = useColorScheme();
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	// Redirect if no slug is provided
	useEffect(() => {
		if (!slug) {
			router.replace("/(drawer)/organizations");
		}
	}, [slug, router]);

	if (!slug) {
		return null;
	}

	return (
		<View className="flex-1">
			{/* Organization Selector Header with safe area padding */}
			<View style={{ paddingTop: insets.top }}>
				<OrganizationSelector currentOrganizationSlug={slug} />
			</View>

			{/* Tabs */}
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: "#fff",
					tabBarInactiveTintColor: isDarkColorScheme
						? "hsl(215 20.2% 65.1%)"
						: "hsl(215.4 16.3% 46.9%)",
					tabBarStyle: [
						{ borderTopColor: isDarkColorScheme
							? "hsl(217.2 32.6% 17.5%)"
							: "hsl(214.3 31.8% 91.4%)" },
						{ backgroundColor: undefined },
						{ /* Override with bg-card utility */ },
						{ backgroundColor: undefined }
					],
					tabBarItemStyle: [{ backgroundColor: undefined }],
					tabBarBackground: () => <View className="bg-card flex-1" />,
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Home",
						tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
					}}
				/>
				<Tabs.Screen
					name="two"
					options={{
						title: "Explore",
						tabBarIcon: ({ color }) => (
							<TabBarIcon name="compass" color={color} />
						),
					}}
				/>
			</Tabs>
		</View>
	);
}

