"use client";

import * as React from "react";
import { IconGitMerge, IconTrash, IconX } from "@tabler/icons-react";
import { NumberBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

interface TableBottomBarProps {
	selectedRows: Set<string>;
	objectType: "contact" | "company" | "property";
	data: Array<Record<string, any> & { _id?: any; id?: string }>;
	onSelectionChange: (selected: Set<string>) => void;
}

export function TableBottomBar({
	selectedRows,
	data,
	objectType,
	onSelectionChange,
}: TableBottomBarProps) {
	const params = useParams({ strict: false });
	const slug = (params.slug as string) || "";
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// Get organization info
	const organizationQuery = useQuery(
		trpc.organization.getCurrentOrganization.queryOptions({
			slug,
		})
	);

	// Get selected records from data
	const selectedRecords = React.useMemo(() => {
		return data.filter((record) => {
			const id = (record as any)._id?.toString() || (record as any).id;
			return selectedRows.has(id);
		});
	}, [data, selectedRows]);

	// Batch delete mutation
	const batchDeleteMutation = useMutation(
		trpc.view.batchDelete.mutationOptions({
			onSuccess: (data) => {
				// Invalidate relevant queries to refetch data
				queryClient.invalidateQueries({
					queryKey: [["view", "getContactsForView"]],
				});
				queryClient.invalidateQueries({
					queryKey: [["view", "getPropertiesForView"]],
				});
				queryClient.invalidateQueries({
					queryKey: [["view", "getAggregationsForView"]],
				});

				// Clear selection
				onSelectionChange(new Set());

				// Show success message
				toast.success(`Successfully deleted ${data.deletedCount} record${data.deletedCount !== 1 ? "s" : ""}`);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete records");
			},
		})
	);

	const handleBatchDelete = () => {
		if (selectedRecords.length === 0) {
			toast.error("No records selected");
			return;
		}

		if (!organizationQuery.data?._id) {
			toast.error("Organization not found");
			return;
		}

		// Get record IDs
		const recordIds = selectedRecords.map((record) => {
			const id = (record as any)._id?.toString() || (record as any).id;
			return id;
		}).filter(Boolean);

		if (recordIds.length === 0) {
			toast.error("No valid record IDs found");
			return;
		}

		// Call batch delete mutation
		batchDeleteMutation.mutate({
			organizationSlug: slug,
			objectType,
			recordIds,
		});
	};

	if (selectedRows.size === 0) {
		return null;
	}

	return (
		<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-transparent border border-border rounded-xl shadow-lg p-4 flex justify-between items-center w-11/12 max-w-3xl h-12 backdrop-blur-2xl z-50">
			<div className="flex items-center gap-1">
				<NumberBadge number={selectedRows.size} color="blue" variant="views" />
                <span className="text-xs text-muted-foreground">selected</span>
			</div>
			<div className="flex items-center space-x-1">
				{/* TODO: Create List Modal */}
				{/* TODO: Add to List Modal */}
				
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="action">
							More
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="rounded-xl space-y-1 mb-2 -mr-4 gap-x-1"
						align="end"
					>
						{selectedRecords.length > 1 && (
							<>
								<DropdownMenuItem
									className="rounded-lg gap-1"
									onClick={() => {
										// TODO: Create API call for merging records
										toast.info("Merge functionality coming soon");
									}}
								>
									<IconGitMerge className="h-3 w-3 mr-2" />
									Merge {selectedRecords.length} record{selectedRecords.length > 1 ? "s" : ""}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem
							className="rounded-lg bg-destructive! hover:bg-destructive/90! text-white gap-1"
							onClick={handleBatchDelete}
							disabled={batchDeleteMutation.isPending}
						>
							<IconTrash className="h-3 w-3" />
							{batchDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedRecords.length} record${selectedRecords.length > 1 ? "s" : ""}`}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						onSelectionChange(new Set());
					}}
				>
					<IconX className="h-3 w-3" />
				</Button>
			</div>
		</div>
	);
}

