import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export function useFavoriteFolders() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const params = useParams({ strict: false });
	const slug = (params.slug as string) || "";

	const folders = useQuery(
		trpc.favorite.getAllFolders.queryOptions({
			organizationSlug: slug,
		})
	);

	const createFolder = useMutation(
		trpc.favorite.createFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug: slug } }],
				});
			},
		})
	);

	const updateFolder = useMutation(
		trpc.favorite.updateFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug: slug } }],
				});
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug: slug } }],
				});
			},
		})
	);

	const deleteFolder = useMutation(
		trpc.favorite.deleteFolder.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFolders"], { input: { organizationSlug: slug } }],
				});
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug: slug } }],
				});
			},
		})
	);

	const updateFavorite = useMutation(
		trpc.favorite.updateFavorite.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug: slug } }],
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

