import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { trpc, queryClient } from "@/utils/trpc";
import { useOrganizationSelector } from "./organization-selector-context";
import { authClient } from "@/lib/auth-client";
import Constants from "expo-constants";

export function OrganizationBottomSheet() {
	const router = useRouter();
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const { bottomSheetRef } = useOrganizationSelector();
	const { data: session } = authClient.useSession();

	// Get current organization
	const currentOrganization = useQuery({
		...trpc.organization.getCurrentOrganization.queryOptions({
			slug: slug || "",
		}),
		enabled: !!slug,
	});

	// Get all user organizations
	const allOrganizations = useQuery(
		trpc.organization.getUserOrganizations.queryOptions({
			status: "active",
		})
	);

	const organization = currentOrganization.data;
	const organizations = allOrganizations.data || [];
	
	// Get app version
	const appVersion = Constants.expoConfig?.version || "1.0.0";
	const buildId = Constants.expoConfig?.extra?.buildId || Constants.expoConfig?.ios?.buildNumber || "dev";

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
	}, [bottomSheetRef]);

	const handleSelectOrganization = async (orgSlug: string) => {
		if (orgSlug === slug) {
			handleClose();
			return;
		}

		// Invalidate queries to ensure fresh data
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

		handleClose();
		router.push(`/(drawer)/${orgSlug}/(tabs)`);
	};

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			snapPoints={["86%"]}
			enablePanDownToClose
			onClose={handleClose}
			backgroundStyle={{
                backgroundColor: "#1F1F1F",
            }}
			handleIndicatorStyle={{ display: "none" }}
		>
			<BottomSheetView style={styles.bottomSheetContent}>
				<View style={styles.contentContainer}>
					{/* Scrollable Top Section - Header and Organizations */}
					<ScrollView 
						style={styles.scrollableSection}
						contentContainerStyle={styles.scrollableContent}
						showsVerticalScrollIndicator={false}
					>
						{/* Header */}
						<View style={styles.header}>
							<Text style={styles.headerText}>Organizations</Text>
						</View>

						{/* Organizations List */}
						<View style={styles.workspacesList}>
							{organizations
								?.sort((a, b) => {
									if (a._id?.toString() === organization?._id?.toString()) return -1;
									if (b._id?.toString() === organization?._id?.toString()) return 1;
									return 0;
								})
								.map((org) => {
									if (!org._id || !org.slug) return null;
									const orgInitial = org.name?.charAt(0).toUpperCase() || "O";
									const isSelected = org._id?.toString() === organization?._id?.toString();

									return (
										<TouchableOpacity
											key={org._id.toString()}
											onPress={() => handleSelectOrganization(org.slug!)}
											style={styles.orgItem}
										>
											<View style={styles.orgItemContent}>
												{/* Avatar - circular and green for selected */}
												<View style={[
													styles.orgAvatar,
													isSelected && styles.orgAvatarSelected
												]}>
													{org.logo ? (
														<Image
															source={{ uri: org.logo }}
															style={styles.orgAvatarImage}
															resizeMode="cover"
														/>
													) : (
														<Text style={styles.orgAvatarText}>
															{orgInitial}
														</Text>
													)}
												</View>

												{/* Organization Name */}
												<Text style={styles.orgName} numberOfLines={1}>
													{org.name}
												</Text>
											</View>

											{/* Checkmark if selected - blue circle */}
											{isSelected && (
												<View style={styles.checkmarkContainer}>
													<Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
												</View>
											)}
										</TouchableOpacity>
									);
								})}
						</View>
					</ScrollView>

					{/* Fixed Bottom Section - Menu and Footer */}
					<View style={styles.bottomSection}>
						{/* Separator */}
						<View style={styles.separator} />

						{/* Menu Options */}
						<View style={styles.menuSection}>
							<TouchableOpacity style={styles.menuItem}>
								<View style={styles.menuItemContent}>
									<Ionicons name="help-circle-outline" size={20} color="hsl(0 0% 98%)" />
									<Text style={styles.menuItemText}>Help & Support</Text>
								</View>
							</TouchableOpacity>

							<TouchableOpacity style={styles.menuItem}>
								<View style={styles.menuItemContent}>
									<Ionicons name="shield-checkmark-outline" size={20} color="hsl(0 0% 98%)" />
									<Text style={styles.menuItemText}>Privacy</Text>
								</View>
							</TouchableOpacity>

							<TouchableOpacity 
								style={styles.menuItem}
								onPress={async () => {
									handleClose();
									await authClient.signOut();
									queryClient.invalidateQueries();
								}}
							>
								<View style={styles.menuItemContent}>
									<Ionicons name="log-out-outline" size={20} color="#ef4444" />
									<Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
								</View>
							</TouchableOpacity>
						</View>

						{/* Footer with email and version */}
						<View style={styles.footer}>
							<Text style={styles.footerEmail}>{session?.user?.email || ""}</Text>
							<Text style={styles.footerVersion}>
								Version {appVersion} - {buildId.substring(0, 7)}
							</Text>
						</View>
					</View>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	bottomSheetBackground: {
		backgroundColor: "#1F1F1F",
	},
	bottomSheetContent: {
		flex: 1,
        height: "100%",
		justifyContent: "space-between",
        paddingBottom: 20,
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 8,
	},
	scrollableSection: {
		flex: 1,
	},
	scrollableContent: {
		paddingBottom: 200,
	},
	header: {
		alignItems: "center",
	},
	headerText: {
		fontSize: 12,
		fontWeight: "600",
		color: "hsl(0 0% 98%)",
	},
	workspacesList: {
		marginTop: 8,
	},
	bottomSection: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#1F1F1F",
		paddingHorizontal: 8,
	},
	orgItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 5,
		paddingHorizontal: 8,
	},
	orgItemContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	orgAvatar: {
		width: 36,
		height: 36,
		borderRadius: 12,
		backgroundColor: "#2B2B2B",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	orgAvatarSelected: {
		backgroundColor: "#2B2B2B",
	},
	orgAvatarImage: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},
	orgAvatarText: {
		color: "hsl(0 0% 98%)",
		fontWeight: "bold",
		fontSize: 14,
	},
	orgName: {
		fontSize: 14,
		color: "hsl(0 0% 98%)",
		flex: 1,
	},
	checkmarkContainer: {
		marginLeft: 8,
	},
	separator: {
		height: 1,
		backgroundColor: "#2B2B2B",
		marginVertical: 12,
	},
	menuSection: {
		paddingHorizontal: 16,
	},
	menuItem: {
		paddingVertical: 10,
	},
	menuItemContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	menuItemText: {
		fontSize: 14,
		color: "hsl(0 0% 98%)",
	},
	signOutText: {
		color: "#ef4444",
	},
	footer: {
		paddingTop: 20,
		paddingBottom: 12,
		paddingHorizontal: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	footerEmail: {
		fontSize: 11,
		color: "hsl(215 20.2% 65.1%)",
	},
	footerVersion: {
		fontSize: 11,
		color: "hsl(215 20.2% 65.1%)",
	},
});

