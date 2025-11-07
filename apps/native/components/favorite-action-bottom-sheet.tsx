import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useFavoriteActionSheet } from "./favorite-action-sheet-context";
import { useFavoriteFolders } from "@/hooks/favorites/use-favorite-folders";
import { useToggleFavorite } from "@/hooks/favorites/use-toggle-favorite";
import { useLocalSearchParams } from "expo-router";

export function FavoriteActionBottomSheet() {
	const { bottomSheetRef, selectedFavorite, setSelectedFavorite } = useFavoriteActionSheet();
	const { folders, updateFavorite } = useFavoriteFolders();
	const { toggleFavorite } = useToggleFavorite();
	const { slug } = useLocalSearchParams<{ slug: string }>();

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
		setSelectedFavorite(null);
	}, [bottomSheetRef, setSelectedFavorite]);

	const handleRemoveFromFavorites = useCallback(() => {
		if (!selectedFavorite) return;

		const recordId = selectedFavorite.objectId?.toString() || selectedFavorite.objectId;
		toggleFavorite({
			recordId,
			objectType: selectedFavorite.objectType,
		});

		handleClose();
	}, [selectedFavorite, toggleFavorite, handleClose]);

	const handleMoveToFolder = useCallback(
		(folderId: string | null) => {
			if (!selectedFavorite) return;

			const favoriteId = selectedFavorite._id?.toString() || selectedFavorite._id;
			updateFavorite.mutate({
				favoriteId,
				organizationSlug: slug || "",
				folderId,
			});

			handleClose();
		},
		[selectedFavorite, updateFavorite, slug, handleClose]
	);

	const getInitials = (record: any, objectType: string) => {
		if (objectType === "contact") {
			const first = record.firstName?.charAt(0) || "";
			const last = record.lastName?.charAt(0) || "";
			return `${first}${last}`.toUpperCase() || "?";
		}
		return record.name?.charAt(0)?.toUpperCase() || "?";
	};

	const getDisplayName = (record: any, objectType: string) => {
		if (objectType === "contact") {
			return `${record.firstName || ""} ${record.lastName || ""}`.trim() || record.name || "Unknown";
		}
		return record.name || "Unknown";
	};

	if (!selectedFavorite || !selectedFavorite.record) {
		return null;
	}

	const record = selectedFavorite.record;
	const currentFolderId = selectedFavorite.folderId?.toString() || selectedFavorite.folderId;

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			snapPoints={["50%"]}
			enablePanDownToClose
			onClose={handleClose}
			backgroundStyle={{
				backgroundColor: "#1F1F1F",
			}}
			handleIndicatorStyle={{ backgroundColor: "#9ca3af" }}
		>
			<BottomSheetView style={styles.bottomSheetContent}>
				<View style={styles.contentContainer}>
					{/* Selected Favorite Item */}
					<View style={styles.selectedItem}>
						<View style={styles.selectedItemContent}>
							<View style={styles.avatarContainer}>
								{record.image ? (
									<Image source={{ uri: record.image }} style={styles.avatarImage} resizeMode="cover" />
								) : (
									<Text style={styles.avatarText}>{getInitials(record, selectedFavorite.objectType)}</Text>
								)}
							</View>
							<View style={styles.selectedItemText}>
								<Text style={styles.selectedItemName}>{getDisplayName(record, selectedFavorite.objectType)}</Text>
								<Text style={styles.selectedItemType}>
									{selectedFavorite.objectType.charAt(0).toUpperCase() + selectedFavorite.objectType.slice(1)}
								</Text>
							</View>
						</View>
					</View>

					{/* Remove from Favorites */}
					<TouchableOpacity style={styles.actionItem} onPress={handleRemoveFromFavorites}>
						<Text style={styles.actionText}>Remove from favorites</Text>
						<Ionicons name="star-outline" size={20} color="hsl(0 0% 98%)" />
					</TouchableOpacity>

					{/* Move to Folder Section */}
					<View style={styles.folderSection}>
						<Text style={styles.sectionTitle}>Move to folder</Text>

						{/* None / Root option */}
						<TouchableOpacity
							style={[styles.folderItem, currentFolderId === null && styles.folderItemSelected]}
							onPress={() => handleMoveToFolder(null)}
						>
							<Ionicons name="folder-outline" size={20} color="#9ca3af" />
							<Text style={styles.folderItemText}>None</Text>
							{currentFolderId === null && <Ionicons name="checkmark" size={20} color="hsl(0 0% 98%)" />}
						</TouchableOpacity>

						{/* Folder List */}
						{folders.data?.map((folder: any) => {
							const folderId = folder._id?.toString() || folder._id;
							const isSelected = currentFolderId === folderId;

							return (
								<TouchableOpacity
									key={folderId}
									style={[styles.folderItem, isSelected && styles.folderItemSelected]}
									onPress={() => handleMoveToFolder(folderId)}
								>
									<Ionicons name="folder" size={20} color="#9ca3af" />
									<Text style={styles.folderItemText}>{folder.name}</Text>
									{isSelected && <Ionicons name="checkmark" size={20} color="hsl(0 0% 98%)" />}
								</TouchableOpacity>
							);
						})}
					</View>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	bottomSheetContent: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	contentContainer: {
		flex: 1,
	},
	selectedItem: {
		backgroundColor: "#2B2B2B",
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
	},
	selectedItemContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	avatarContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#1F1F1F",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	avatarImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	avatarText: {
		color: "hsl(0 0% 98%)",
		fontWeight: "600",
		fontSize: 14,
	},
	selectedItemText: {
		flex: 1,
	},
	selectedItemName: {
		fontSize: 16,
		fontWeight: "600",
		color: "hsl(0 0% 98%)",
		marginBottom: 2,
	},
	selectedItemType: {
		fontSize: 12,
		color: "hsl(215 20.2% 65.1%)",
		textTransform: "capitalize",
	},
	actionItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#2B2B2B",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	actionText: {
		fontSize: 16,
		color: "hsl(0 0% 98%)",
	},
	folderSection: {
		marginTop: 8,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: "600",
		color: "hsl(215 20.2% 65.1%)",
		marginBottom: 12,
		textTransform: "uppercase",
	},
	folderItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "#2B2B2B",
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
	},
	folderItemSelected: {
		backgroundColor: "#3B3B3B",
	},
	folderItemText: {
		flex: 1,
		fontSize: 16,
		color: "hsl(0 0% 98%)",
	},
});

