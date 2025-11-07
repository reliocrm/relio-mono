import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Colors, DarkColors } from "@/theme/colors";
import { BORDER_RADIUS } from "@/theme/globals";

export function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const { isDarkColorScheme } = useColorScheme();
    const palette = isDarkColorScheme ? DarkColors : Colors;

    const SOCIAL_CONNECTIONS: Array<{
        type: string;
        uri: string;
        useTint: boolean;
        label: string;
    }> = [
        {
			label: "Apple",
            type: "oauth_apple",
            uri: "https://img.clerk.com/static/apple.png?width=160",
            useTint: true,
        },
        {
			label: "Google",
            type: "oauth_google",
            uri: "https://img.clerk.com/static/google.png?width=160",
            useTint: false,
        }
    ];

	const handleLogin = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign in");
					setIsLoading(false);
				},
				onSuccess: () => {
					setEmail("");
					setPassword("");
					queryClient.refetchQueries();
					// Navigate will be handled by the index screen redirect
				},
				onFinished: () => {
					setIsLoading(false);
				},
			},
		);
	};

	return (
		<View className="mt-6">
			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

		{/* Form */}

			{/* Email */}
			<View className="mb-3">
				<Text className="block text-sm text-muted-foreground mb-2">Email address</Text>
                <TextInput
					className="h-11 rounded-xl bg-input text-foreground px-4 border border-input"
					placeholder="john@example.com"
					value={email}
					onChangeText={setEmail}
					placeholderTextColor={palette.mutedForeground}
					keyboardType="email-address"
					autoCapitalize="none"
					style={{
						color: palette.text,
						borderRadius: BORDER_RADIUS,
					}}
				/>
			</View>

			{/* Password */}
			<View className="mb-4">
				<Text className="block text-sm text-muted-foreground mb-2">Password</Text>
                <TextInput
					className="h-11 rounded-xl bg-input text-foreground px-4 border border-input"
					placeholder="********"
					value={password}
					onChangeText={setPassword}
					placeholderTextColor={palette.mutedForeground}
					secureTextEntry
					style={{
						color: palette.text,
						borderRadius: BORDER_RADIUS,
					}}
				/>
			</View>

			<TouchableOpacity
				onPress={handleLogin}
				disabled={isLoading}
				className="rounded-lg flex-row justify-center items-center border border-primary bg-primary py-2 px-4"
				style={{
					borderRadius: BORDER_RADIUS,
				}}
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={palette.primaryForeground} />
				) : (
					<Text className="text-primary-foreground font-semibold text-[17px]">Sign in</Text>
				)}
			</TouchableOpacity>

			<View className="flex flex-row items-center my-4 mt-8">
				<View className="flex-1 h-px bg-border" />
				<Text className="mx-3 text-muted-foreground">or</Text>
				<View className="flex-1 h-px bg-border" />
			</View>

			{/* Social connections below button, in a row */}
			<View className="flex-row gap-2 mt-4">
				{SOCIAL_CONNECTIONS.map((s) => (
					<TouchableOpacity
						key={s.type}
						disabled={isLoading}
						className="flex-1 rounded-xl bg-card py-3 items-center border border-border flex-row gap-2 justify-center"
						style={{
							borderRadius: BORDER_RADIUS,
						}}
						onPress={() => {}}
					>
						<Image
							source={{ uri: s.uri }}
							style={{ width: 16, height: 16, tintColor: s.useTint ? palette.foreground : undefined }}
						/>
						<Text className="text-foreground font-semibold text-md">{s.label}</Text>
					</TouchableOpacity>
				))}
			</View>

		</View>
	);
}
