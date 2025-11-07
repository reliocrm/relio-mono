import { useTRPC } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDuplicateView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const duplicateViewMutation = useMutation(
		trpc.view.duplicateView.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});
			},
		})
	);

	return {
		duplicateView: duplicateViewMutation.mutate,
		isLoading: duplicateViewMutation.isPending,
	};
}

export function useDeleteView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const deleteViewMutation = useMutation(
		trpc.view.deleteView.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});
			},
		})
	);

	return {
		deleteView: deleteViewMutation.mutate,
		isLoading: deleteViewMutation.isPending,
	};
}

export function useUpdateView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const updateViewMutation = useMutation(
		trpc.view.updateView.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewById"]],
				});
			},
		})
	);

	return {
		updateView: updateViewMutation.mutate,
		isLoading: updateViewMutation.isPending,
	};
}

export function useSetUserDefaultView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const setUserDefaultViewMutation = useMutation(
		trpc.view.setUserDefaultView.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});
				queryClient.invalidateQueries({
					queryKey: [["view", "getUserDefaultView"], { 
						input: { 
							organizationSlug: variables.organizationSlug, 
							objectType: variables.objectType 
						} 
					}],
				});
				// Also invalidate getViewById queries since isDefault field changed
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewById"]],
				});
			},
		})
	);

	return {
		setUserDefaultView: setUserDefaultViewMutation.mutate,
		isLoading: setUserDefaultViewMutation.isPending,
	};
}

export function useCreateView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createViewMutation = useMutation(
		trpc.view.createView.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});
			},
		})
	);

	return {
		createView: createViewMutation.mutate,
		isLoading: createViewMutation.isPending,
	};
}

