import { useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { trpc } from "@/utils/trpc";
import { useOrganizationSelector } from "./organization-selector-context";

interface OrganizationSelectorProps {
	currentOrganizationSlug?: string;
}

export function OrganizationSelector({ currentOrganizationSlug }: OrganizationSelectorProps) {
	const router = useRouter();
	const { bottomSheetRef } = useOrganizationSelector();

	// Get current organization
	const currentOrganization = useQuery({
		...trpc.organization.getCurrentOrganization.queryOptions({
			slug: currentOrganizationSlug || "",
		}),
		enabled: !!currentOrganizationSlug,
	});

	// Get all user organizations
	const allOrganizations = useQuery(
		trpc.organization.getUserOrganizations.queryOptions({
			status: "active",
		})
	);

	const organization = currentOrganization.data;

	const handleOpen = useCallback(() => {
		bottomSheetRef.current?.expand();
	}, [bottomSheetRef]);

	const initial = organization?.name?.charAt(0).toUpperCase() || "O";

	return (
		<TouchableOpacity
			onPress={handleOpen}
			className="flex-row items-center px-4 py-3 bg-transparent"
		>
			<View className="flex-row items-center gap-3 flex-1">
				{/* Organization Avatar */}
				<View className="w-8 h-8 rounded-lg bg-transparent items-center justify-center overflow-hidden">
					{organization?.logo ? (
						<Image
							source={{ uri: organization.logo }}
							className="w-8 h-8 rounded-lg"
							resizeMode="cover"
						/>
					) : (
						<Text className="text-foreground font-bold text-sm">{initial}</Text>
					)}
				</View>

				{/* Organization Name */}
				<Text className="text-base font-semibold text-foreground flex-1" numberOfLines={1}>
					{organization?.name || "Select Organization"}
				</Text>
			</View>

			{/* Chevron Down */}
			<Ionicons name="chevron-down" size={20} color="#9ca3af" />
		</TouchableOpacity>
	);
}


