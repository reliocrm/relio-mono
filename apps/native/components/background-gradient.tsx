import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Colors, DarkColors } from "@/theme/colors";

/**
 * BackgroundGradient
 * - Renders a matching linear gradient background for web + native.
 * - Gradient goes from muted (top) to background (bottom).
 * - Uses theme colors directly for consistency.
 */
export function BackgroundGradient() {
	const { colorScheme } = useColorScheme();

	// Use theme colors directly - gradient from muted (top) to background (bottom)
	const palette = colorScheme === "dark" ? DarkColors : Colors;
	const colors = [palette.muted, palette.background] as [string, string];

	if (Platform.OS === "web") {
		// Use Tailwind-style background for web - always from-muted to-background (top to bottom)
		return (
			<View
				className="absolute inset-0 bg-gradient-to-b from-muted to-background"
				style={{ zIndex: -1 }}
			/>
		);
	}

	// Native mobile version - top to bottom gradient
	return (
		<LinearGradient
			colors={colors}
			start={{ x: 0.5, y: 0 }}
			end={{ x: 0.5, y: 1 }}
			style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
		/>
	);
}
