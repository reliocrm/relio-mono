import { View, Text, TouchableOpacity, Image } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useFavoriteFolders } from "@/hooks/favorites/use-favorite-folders";
import { getObjectTypeRoutePath } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFavoriteActionSheet } from "./favorite-action-sheet-context";

export function Favorites() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const router = useRouter();
	const { folders } = useFavoriteFolders();
	const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
	const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
	const { bottomSheetRef, setSelectedFavorite } = useFavoriteActionSheet();

	const favorites = useQuery(
		trpc.favorite.getAllFavorites.queryOptions({
			organizationSlug: slug || "",
		})
	);

	// Group favorites by folder
	const favoritesByFolder = useMemo(() => {
		if (!favorites.data || !folders.data) return new Map();

		const map = new Map<string, any[]>();
		folders.data.forEach((folder: any) => {
			const folderId = folder._id?.toString() || folder._id;
			const folderFavorites = favorites.data.filter((fav: any) => {
				const favFolderId = fav.folderId?.toString() || fav.folderId;
				return favFolderId === folderId;
			});
			map.set(folderId, folderFavorites);
		});
		return map;
	}, [favorites.data, folders.data]);

	const rootFavorites = useMemo(() => {
		if (!favorites.data) return [];
		return favorites.data.filter((fav: any) => !fav.folderId);
	}, [favorites.data]);

	// Combine root favorites and folders into a single list, sorted by position
	// MUST be called before any early returns to follow Rules of Hooks
	const allItems = useMemo(() => {
		const items: any[] = [];
		
		// Add root favorites
		rootFavorites.forEach((fav: any) => {
			items.push({ type: "favorite", data: fav });
		});
		
		// Add folders
		if (folders.data) {
			folders.data.forEach((folder: any) => {
				items.push({ type: "folder", data: folder });
			});
		}
		
		// Sort by position if available
		return items.sort((a, b) => {
			const aPos = a.data.position || 0;
			const bPos = b.data.position || 0;
			return aPos - bPos;
		});
	}, [rootFavorites, folders.data]);

	const toggleFolder = (folderId: string) => {
		setOpenFolders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(folderId)) {
				newSet.delete(folderId);
			} else {
				newSet.add(folderId);
			}
			return newSet;
		});
	};

	const handleFavoritePress = (favorite: any) => {
		const recordId = favorite.objectId?.toString() || favorite.objectId;
		const recordType = getObjectTypeRoutePath(favorite.objectType);
		// Navigate to the record detail page
		router.push(`/(drawer)/${slug}/${recordType}/${recordId}` as any);
	};

	const handleFolderPress = (folder: any) => {
		// For now, folders are just visual - could navigate to folder view later
		toggleFolder(folder._id?.toString() || folder._id);
	};

	const handleFavoriteLongPress = (favorite: any) => {
		setSelectedFavorite(favorite);
		bottomSheetRef.current?.expand();
	};

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


	if (favorites.isLoading || folders.isLoading) {
		return (
			<View className="mb-4">
				<View className="h-10 bg-muted rounded animate-pulse mb-2" />
				{[1, 2, 3].map((i) => (
					<View key={i} className="h-12 bg-muted rounded animate-pulse mb-1" />
				))}
			</View>
		);
	}

	const hasFavorites = rootFavorites.length > 0 || (folders.data && folders.data.length > 0);

	if (!hasFavorites) {
		return null;
	}

	return (
		<>
			<View className="mb-4">
				{/* Collapsible Favorites Header */}
			<TouchableOpacity
				className="flex-row items-center py-3 px-0"
				onPress={() => setIsFavoritesOpen(!isFavoritesOpen)}
			>
                <Ionicons
					name={isFavoritesOpen ? "chevron-down" : "chevron-forward"}
					size={16}
					color="#9ca3af"
					style={{ marginRight: 8, marginLeft: -8 }}
				/>
				<Text className="text-base font-semibold text-foreground">Favorites</Text>
			</TouchableOpacity>

			{/* Favorites Content */}
			{isFavoritesOpen && (
				<View>
					{allItems.map((item, index) => {
						if (item.type === "folder") {
							const folder = item.data;
							const folderId = folder._id?.toString() || folder._id;
							const folderFavorites = favoritesByFolder.get(folderId) || [];
							const isFolderOpen = openFolders.has(folderId);

							return (
								<View key={folderId}>
									<TouchableOpacity
										className="flex-row items-center py-2.5 px-0"
										onPress={() => handleFolderPress(folder)}
									>
										<FontAwesome
											name={isFolderOpen ? "folder-open-o" : "folder-o"}
											size={20}
											color="#9ca3af"
											style={{ marginRight: 12, marginLeft: -8 }}
										/>
										<Text className="flex-1 text-foreground text-base">
											{folder.name}
										</Text>
									</TouchableOpacity>

									{isFolderOpen && folderFavorites.length > 0 && (
										<View className="">
											{folderFavorites.map((favorite: any) => {
												const record = favorite.record;
												if (!record) return null;

												return (
													<TouchableOpacity
														key={favorite._id?.toString() || favorite._id}
														className="flex-row items-center py-2.5 px-0"
														onPress={() => handleFavoritePress(favorite)}
														onLongPress={() => handleFavoriteLongPress(favorite)}
													>
														<View className="h-8 w-8 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden" style={{ marginLeft: 8 }}>
															{record.image ? (
																<Image
																	source={{ uri: record.image }}
																	className="h-full w-full"
																	resizeMode="cover"
																/>
															) : (
																<Text className="text-xs text-foreground font-medium">
																	{getInitials(record, favorite.objectType)}
																</Text>
															)}
														</View>
														<View className="flex-1">
															<Text className="text-foreground text-base" numberOfLines={1}>
																{getDisplayName(record, favorite.objectType)}
															</Text>
															<Text className="text-xs text-muted-foreground capitalize">
																{favorite.objectType}
															</Text>
														</View>
														{!["contact", "company", "property"].includes(favorite.objectType) && (
															<Ionicons
																name="chevron-forward"
																size={16}
																color="#9ca3af"
															/>
														)}
													</TouchableOpacity>
												);
											})}
										</View>
									)}
								</View>
							);
						} else {
							// Favorite item
							const favorite = item.data;
							const record = favorite.record;
							if (!record) return null;

							return (
								<TouchableOpacity
									key={favorite._id?.toString() || favorite._id}
									className="flex-row items-center py-2.5 px-0"
									onPress={() => handleFavoritePress(favorite)}
									onLongPress={() => handleFavoriteLongPress(favorite)}
								>
									<View className="h-8 w-8 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden" style={{ marginLeft: -8 }}>
										{record.image ? (
											<Image
												source={{ uri: record.image }}
												className="h-full w-full"
												resizeMode="cover"
											/>
										) : (
											<Text className="text-xs text-foreground font-medium">
												{getInitials(record, favorite.objectType)}
											</Text>
										)}
									</View>
									<View className="flex-1">
										<Text className="text-foreground text-base" numberOfLines={1}>
											{getDisplayName(record, favorite.objectType)}
										</Text>
										<Text className="text-xs text-muted-foreground capitalize">
											{favorite.objectType}
										</Text>
									</View>
									<Ionicons
										name="chevron-forward"
										size={16}
										color="#9ca3af"
									/>
								</TouchableOpacity>
							);
						}
					})}
				</View>
			)}
			</View>
		</>
	);
}

