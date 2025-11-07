import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, TouchableOpacity, View, Linking } from "react-native";
import Constants from "expo-constants";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { Logo } from "@/components/logo";
import { queryClient, trpc } from "@/utils/trpc";
import { BackgroundGradient } from "@/components/background-gradient";

export default function Home() {
	const router = useRouter();
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const privateData = useQuery(trpc.privateData.queryOptions());
	const { data: session } = authClient.useSession();

	// Redirect authenticated users to organizations screen
	useFocusEffect(
		useCallback(() => {
			if (session?.user) {
				router.replace("/(drawer)/organizations");
			}
		}, [session?.user, router])
	);

	function resolveWebURL(): string | undefined {
		const explicit = process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_SERVER_URL;
		if (explicit) return explicit;
		const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
		if (hostUri && hostUri.includes(":")) {
			const host = hostUri.split(":")[0];
			return `http://${host}:5173`;
		}
		return undefined;
	}

	function openCreateAccountInBrowser() {
		const base = resolveWebURL();
		const url = base ? `${base}/login` : "/login";
		Linking.openURL(url);
	}

	return (
		<Container>
			<BackgroundGradient />
			<View className="flex-1 px-6">
				<View className="absolute inset-0 bg-linear-to-b from-muted to-background" />
				{session?.user ? (
					<ScrollView className="flex-1">
						<View className="max-w-92 m-auto h-fit w-full">
							<View className="items-center mt-0 pt-2">
								<Logo withLabel />
							</View>
						{session?.user ? (
						<View className="mb-6 p-4 bg-card rounded-lg border border-border">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-foreground text-base">
									Welcome,{" "}
									<Text className="font-medium">{session.user.name}</Text>
								</Text>
							</View>
							<Text className="text-muted-foreground text-sm mb-4">
								{session.user.email}
							</Text>

							<TouchableOpacity
								className="bg-destructive py-2 px-4 rounded-md self-start"
								onPress={() => {
									authClient.signOut();
									queryClient.invalidateQueries();
								}}
							>
								<Text className="text-white font-medium">Sign Out</Text>
							</TouchableOpacity>
						</View>
					) : null}
					{session?.user ? (
						<>
							<View className="mb-6 rounded-lg border border-border p-4">
								<Text className="mb-3 font-medium text-foreground">API Status</Text>
								<View className="flex-row items-center gap-2">
									<View
										className={`h-3 w-3 rounded-full ${
											healthCheck.data ? "bg-green-400" : "bg-red-500"
										}`}
									/>
									<Text className="text-muted-foreground">
										{healthCheck.isLoading
											? "Checking..."
											: healthCheck.data
												? "Connected to API"
												: "API Disconnected"}
									</Text>
								</View>
							</View>
							<View className="mb-6 rounded-lg border border-border p-4">
								<Text className="mb-3 font-medium text-foreground">
									Private Data
								</Text>
								{privateData && (
									<View>
										<Text className="text-muted-foreground">
											{privateData.data?.message}
										</Text>
									</View>
								)}
							</View>
						</>
					) : null}
						</View>
					</ScrollView>
				) : (
					<View className="flex-1">
						<View className="max-w-92 m-auto h-full w-full justify-between">
							<View className="items-center mt-0 pt-2">
								<Logo withLabel />
							</View>
							<View className="justify-center">
								<SignIn />
							</View>
							<View className="items-center">
								<Text className="text-muted-foreground text-sm text-center">
									Don't have an account? <Text className="underline" onPress={openCreateAccountInBrowser}>Create account</Text>
								</Text>
							</View>
						</View>
					</View>
				)}
			</View>
		</Container>
	);
}
