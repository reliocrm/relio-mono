import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { HeaderButton } from "@/components/header-button";

const DrawerLayout = () => {
	return (
		<Drawer
			screenOptions={{
				headerShown: false,
				drawerType: "slide",
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					headerShown: false,
					drawerLabel: "Home",
					drawerIcon: ({ size, color }) => (
						<Ionicons name="home-outline" size={size} color={color} />
					),
				}}
			/>
			<Drawer.Screen
				name="(tabs)"
				options={{
					headerTitle: "Tabs",
					drawerLabel: "Tabs",
					drawerIcon: ({ size, color }) => (
						<MaterialIcons name="border-bottom" size={size} color={color} />
					),
					headerRight: () => (
						<Link href="/modal" asChild>
							<HeaderButton />
						</Link>
					),
				}}
			/>
			<Drawer.Screen
				name="todos"
				options={{
					headerTitle: "Todos",
					drawerLabel: "Todos",
					drawerIcon: ({ size, color }) => (
						<Ionicons name="checkbox-outline" size={size} color={color} />
					),
				}}
			/>
			<Drawer.Screen
				name="ai"
				options={{
					headerTitle: "AI",
					drawerLabel: "AI",
					drawerIcon: ({ size, color }) => (
						<Ionicons
							name="chatbubble-ellipses-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="organizations"
				options={{
					headerShown: false,
					drawerLabel: "Organizations",
					drawerIcon: ({ size, color }) => (
						<Ionicons
							name="business-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="[slug]"
				options={{
					headerShown: false,
					drawerItemStyle: { display: "none" },
				}}
			/>
		</Drawer>
	);
};

export default DrawerLayout;
