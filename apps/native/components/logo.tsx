import { useColorScheme } from "@/lib/use-color-scheme";
import { Image, Text, View } from "react-native";

export function Logo({
    withLabel = true,
    className,
}: {
    withLabel?: boolean;
    className?: string;
}) {
    const { isDarkColorScheme } = useColorScheme();

    return (
        <View className={["flex-row items-center", className].filter(Boolean).join(" ")}> 
            <Image
                source={require("../assets/images/icon.png")}
                className="h-10 w-10"
                resizeMode="contain"
                // Use tint to adapt to theme like the web version's currentColor
                style={{ tintColor: isDarkColorScheme ? "#ffffff" : "#0b0b0b" }}
            />
            {withLabel ? (
                <Text
                    className="ml-1 text-4xl tracking-tighter font-bold"
                    style={{
                        fontFamily: "Inter",
                        color: isDarkColorScheme ? "#ffffff" : undefined,
                    }}
                >
                    relio
                </Text>
            ) : null}
        </View>
    );
}


