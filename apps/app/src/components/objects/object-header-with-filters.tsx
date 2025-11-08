"use client";

import * as React from "react";
import { ObjectHeader } from "./object-header";
import { FilterBar } from "./filter-bar";
import { useFilters } from "@/hooks/filters/use-filters";

interface ObjectHeaderWithFiltersProps {
	organizationSlug: string;
	objectType: "contact" | "property" | "company";
	currentViewId?: string;
	onViewChange?: (viewId: string) => void;
}

export function ObjectHeaderWithFilters({
	organizationSlug,
	objectType,
	currentViewId,
	onViewChange,
}: ObjectHeaderWithFiltersProps) {
	const { filters, updateFilters, isUpdating } = useFilters({
		organizationSlug,
		objectType,
		viewId: currentViewId,
	});

	return (
		<div className="flex flex-col">
			<ObjectHeader
				organizationSlug={organizationSlug}
				objectType={objectType}
				currentViewId={currentViewId}
				onViewChange={onViewChange}
			/>
			<FilterBar
				objectType={objectType}
				filters={filters}
				onFiltersChange={updateFilters}
			/>
		</div>
	);
}

