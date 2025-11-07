import { useTRPC } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export function useToggleFavorite(organizationSlug?: string) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const params = useParams({ strict: false });
	// Use provided organizationSlug or fall back to route params
	const slug = organizationSlug || (params.slug as string) || "";

	const toggleFavoriteMutation = useMutation(
		trpc.favorite.toggleFavorite.mutationOptions({
			onSuccess: () => {
				// Invalidate favorites query to refetch
				queryClient.invalidateQueries({
					queryKey: [["favorite", "getAllFavorites"], { input: { organizationSlug: slug } }],
				});
			},
		})
	);

	// Create a wrapper function that includes organizationSlug
	const toggleFavorite = (
		args: {
			recordId: string;
			objectType: "contact" | "property" | "company" | "view";
			folderId?: string;
		},
		options?: Parameters<typeof toggleFavoriteMutation.mutate>[1]
	) => {
		return toggleFavoriteMutation.mutate(
			{
				...args,
				organizationSlug: slug,
			},
			options
		);
	};

	return {
		toggleFavorite,
		isLoading: toggleFavoriteMutation.isPending,
	};
}

