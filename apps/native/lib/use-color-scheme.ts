import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useColorScheme as useReactNativeColorScheme } from "react-native";
import { useEffect } from "react";

export function useColorScheme() {
    const { colorScheme: nwScheme, setColorScheme, toggleColorScheme } =
        useNativewindColorScheme();
    const rnScheme = useReactNativeColorScheme();

    // Force dark mode globally as default and active scheme
    useEffect(() => {
        if (nwScheme !== "dark") {
            setColorScheme("dark");
        }
    }, [nwScheme, setColorScheme]);

    const resolved = "dark" as const;

    return {
        color: resolved, // preserved for potential consumers
        colorScheme: resolved,
        isDarkColorScheme: true,
        setColorScheme,
        toggleColorScheme,
    };
}
