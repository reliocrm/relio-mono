import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export function useToggleFavorite() {
	const queryClient = useQueryClient();
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const organizationSlug = slug || "";

	const toggleFavoriteMutation = useMutation(
		trpc.favorite.toggleFavorite.mutationOptions({
			onSuccess: () => {
				// Invalidate favorites query to refetch
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug } }],
				});
			},
		})
	);

	return {
		toggleFavorite: (args: {
			recordId: string;
			objectType: "contact" | "property" | "company";
			folderId?: string;
		}) => {
			toggleFavoriteMutation.mutate({
				...args,
				organizationSlug,
			});
		},
		isLoading: toggleFavoriteMutation.isPending,
	};
}

