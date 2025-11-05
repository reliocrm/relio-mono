import { hairlineWidth } from "nativewind/theme";
import { Colors, DarkColors } from "./theme/colors";

/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = [
	"./app/**/*.{js,ts,tsx}",
	"./components/**/*.{js,ts,tsx}",
];
export const presets = [require("nativewind/preset")];
export const theme = {
	extend: {
		colors: {
			// Use dark colors by default since dark mode is forced
			background: DarkColors.background,
			foreground: DarkColors.foreground,
			card: {
				DEFAULT: DarkColors.card,
				foreground: DarkColors.cardForeground,
			},
			popover: {
				DEFAULT: DarkColors.popover,
				foreground: DarkColors.popoverForeground,
			},
			primary: {
				DEFAULT: DarkColors.primary,
				foreground: DarkColors.primaryForeground,
			},
			secondary: {
				DEFAULT: DarkColors.secondary,
				foreground: DarkColors.secondaryForeground,
			},
			muted: {
				DEFAULT: DarkColors.muted,
				foreground: DarkColors.mutedForeground,
			},
			accent: {
				DEFAULT: DarkColors.accent,
				foreground: DarkColors.accentForeground,
			},
			destructive: {
				DEFAULT: DarkColors.destructive,
				foreground: DarkColors.destructiveForeground,
			},
			border: DarkColors.border,
			input: DarkColors.input,
			ring: DarkColors.ring,
		},
		borderRadius: {
			xl: "calc(0.625rem + 4px)",
			lg: "0.625rem",
			md: "calc(0.625rem - 2px)",
			sm: "calc(0.625rem - 4px)",
		},
		borderWidth: {
			hairline: hairlineWidth(),
		},
	},
};
export const plugins = [];
