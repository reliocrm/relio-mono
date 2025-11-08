import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export function useFavoriteFolders() {
	const queryClient = useQueryClient();
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const organizationSlug = slug || "";

	const folders = useQuery(
		trpc.favorite.getAllFolders.queryOptions({
			organizationSlug,
		})
	);

	const createFolder = useMutation(
		trpc.favorite.createFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug } }],
				});
			},
		})
	);

	const updateFolder = useMutation(
		trpc.favorite.updateFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug } }],
				});
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug } }],
				});
			},
		})
	);

	const deleteFolder = useMutation(
		trpc.favorite.deleteFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug } }],
				});
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug } }],
				});
			},
		})
	);

	const updateFavorite = useMutation(
		trpc.favorite.updateFavorite.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug } }],
				});
			},
		})
	);

	return {
		folders,
		createFolder: {
			mutate: createFolder.mutate,
			mutateAsync: createFolder.mutateAsync,
			isPending: createFolder.isPending,
		},
		updateFolder: {
			mutate: updateFolder.mutate,
			mutateAsync: updateFolder.mutateAsync,
			isPending: updateFolder.isPending,
		},
		deleteFolder: {
			mutate: deleteFolder.mutate,
			mutateAsync: deleteFolder.mutateAsync,
			isPending: deleteFolder.isPending,
		},
		updateFavorite: {
			mutate: updateFavorite.mutate,
			mutateAsync: updateFavorite.mutateAsync,
			isPending: updateFavorite.isPending,
		},
	};
}



