import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { trpc } from "@/utils/trpc";
import { Ionicons } from "@expo/vector-icons";
import { queryClient } from "@/utils/trpc";

export default function Organizations() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const organizations = useQuery(
		trpc.organization.getUserOrganizations.queryOptions({
			status: "active",
		})
	);

	// Redirect to login if not authenticated
	useFocusEffect(
		useCallback(() => {
			if (!session?.user) {
				router.replace("/(drawer)");
			}
		}, [session?.user, router])
	);

	if (!session?.user) {
		return null;
	}

	const handleSignOut = async () => {
		await authClient.signOut();
		queryClient.invalidateQueries();
	};

	return (
		<Container>
			<View className="flex-1 px-6">
				<ScrollView className="flex-1">
					<View className="w-full max-w-md m-auto">
						{/* Logo */}
						<View className="w-full mb-8 flex items-center pt-4">
							<Logo />
						</View>

						{organizations.isLoading ? (
							<View className="flex-1 items-center justify-center py-8">
								<ActivityIndicator size="large" />
							</View>
						) : (
							<>
								{/* Header */}
								<View className="w-full mb-8 mt-8 flex items-center flex-col space-y-1">
									{organizations.data && organizations.data?.length > 0 ? (
										<Text className="text-3xl font-semibold text-foreground">
											Select organization
										</Text>
									) : (
										<Text className="text-xl font-bold">
											No Organizations
										</Text>
									)}
									<Text className="text-sm text-muted-foreground text-center">
										Select an organization to continue
									</Text>
								</View>

								{/* Organizations List */}
								<View className="flex flex-col justify-start items-start gap-y-2 mb-6">
									{organizations.data?.map((organization) => {
										if (!organization._id || !organization.slug) return null;
										const initial = organization.name.charAt(0).toUpperCase();
										
										return (
											<TouchableOpacity
												key={organization._id.toString()}
												className="group w-full border border-border rounded-2xl p-2 bg-card/50"
												onPress={async () => {
													// Invalidate queries to ensure fresh data for the new organization
													await queryClient.invalidateQueries({
														predicate: (query) => {
															const queryKey = query.queryKey;
															if (Array.isArray(queryKey) && queryKey[0] && Array.isArray(queryKey[0])) {
																const firstKey = queryKey[0][0];
																return firstKey === "organization" || firstKey === "view";
															}
															return false;
														},
													});
													// Navigate to the organization tabs
													router.push(`/(drawer)/${organization.slug}/(tabs)`);
												}}
											>
												<View className="w-full flex flex-row justify-between items-center">
													<View className="flex flex-row items-center gap-2">
														{/* Avatar */}
														<View className="w-7 h-7 rounded-lg bg-muted items-center justify-center overflow-hidden">
															{organization.logo ? (
																<Image
																	source={{ uri: organization.logo }}
																	className="w-7 h-7 rounded-lg"
																	resizeMode="cover"
																/>
															) : (
																<Text className="text-foreground font-bold text-sm">
																	{initial}
																</Text>
															)}
														</View>

														{/* Organization Info */}
														<View className="flex flex-col justify-start items-start">
															<Text className="text-sm text-foreground">
																{organization.name}
															</Text>
														</View>
													</View>

													{/* Chevron */}
													<Ionicons
														name="chevron-forward"
														size={16}
														color="#9ca3af"
													/>
												</View>
											</TouchableOpacity>
										);
									})}
								</View>

								{/* Sign Out Button */}
								<View className="w-full items-center">
									<TouchableOpacity onPress={handleSignOut}>
										<Text className="text-lg text-muted-foreground">
											Sign out
										</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</ScrollView>
			</View>
		</Container>
	);
}

