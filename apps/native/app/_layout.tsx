import "@/polyfills";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
// import {
// 	DarkTheme,
// } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { queryClient } from "@/utils/trpc";
import React, { useRef } from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Platform, View } from "react-native";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { ThemeProvider } from "@/theme/theme-provider";

export const unstable_settings = {
	initialRouteName: "(drawer)",
};

export default function RootLayout() {
	const hasMounted = useRef(false);
	const { colorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

	// const DARK_THEME_TRANSPARENT = React.useMemo(() => ({
	// 	...DarkTheme,
	// 	colors: {
	// 		...DarkTheme.colors,
	// 		background: 'transparent',
	// 		card: 'transparent',
	// 	},
	// }), []);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.add("bg-background");
		}
		setAndroidNavigationBar("dark");
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);

	if (!isColorSchemeLoaded) {
		return null;
	}
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Stack>
						<Stack.Screen name="(drawer)" options={{ headerShown: false }} />
						<Stack.Screen
							name="modal"
							options={{ title: "Modal", presentation: "modal" }}
						/>
					</Stack>
				</GestureHandlerRootView>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? React.useEffect
		: React.useLayoutEffect;
