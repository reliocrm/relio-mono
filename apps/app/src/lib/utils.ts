import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IconLayoutGrid, IconColumns, type Icon as TablerIcon, IconLayoutKanban } from "@tabler/icons-react";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Maps singular object types to their plural route paths.
 * Used for constructing navigation URLs consistently across the app.
 * 
 * @param objectType - The singular object type (contact, property, company)
 * @returns The plural route path (contacts, properties, companies)
 */
export function getObjectTypeRoutePath(objectType: "contact" | "property" | "company"): string {
	const routeMap: Record<"contact" | "property" | "company", string> = {
		contact: "contacts",
		property: "properties",
		company: "companies",
	};
	return routeMap[objectType] || objectType;
}

/**
 * Generates initials for a record based on its object type.
 * 
 * @param record - The record object (contact, property, company, etc.)
 * @param objectType - The type of object ("contact", "property", "company", etc.)
 * @returns A string of initials (e.g., "JD" for John Doe, "H" for House)
 */
export function getRecordInitials(
	record: { firstName?: string; lastName?: string; name?: string },
	objectType: "contact" | "property" | "company" | string
): string {
	if (objectType === "contact") {
		const first = record.firstName?.charAt(0)?.toUpperCase() || "";
		const last = record.lastName?.charAt(0)?.toUpperCase() || "";
		return first + last || "?";
	} else {
		// For property, company, and other types, use the first letter of the name
		return record.name?.charAt(0)?.toUpperCase() || "?";
	}
}

/**
 * Constructs the route path for a favorite item (record or view).
 * 
 * @param slug - The organization slug
 * @param objectType - The type of favorite ("contact", "property", "company", "view", etc.)
 * @param recordId - The ID of the record or view
 * @param recordType - The record type path (used for non-view favorites)
 * @param viewObjectType - The object type of the view (required when objectType is "view")
 * @returns The route path string
 */
export function getFavoriteRoutePath(
	slug: string,
	objectType: "contact" | "property" | "company" | "view" | string,
	recordId: string,
	recordType: string,
	viewObjectType?: "contact" | "property" | "company" | string
): string {
	if (objectType === "view") {
		// For views, we need to get the objectType from the view and construct the path
		const viewObjType = viewObjectType || "contact"; // Default to contact if not provided
		const routePath = getObjectTypeRoutePath(viewObjType as "contact" | "property" | "company");
		return `/${slug}/${routePath}/view/${recordId}`;
	} else {
		// For records, use the standard path
		return `/${slug}/${recordType}/${recordId}`;
	}
}

/**
 * Gets the icon component and background color for a view based on its view type.
 * 
 * @param viewType - The type of view ("table", "kanban", "map", or undefined/default)
 * @returns An object with the Icon component and bgColor className string
 */
export function getViewIconConfig(viewType?: string): {
	Icon: TablerIcon;
	bgColor: string;
	iconClassName: string;
} {
	switch (viewType) {
		case "kanban":
			return {
				Icon: IconLayoutKanban,
				bgColor: "bg-orange-400",
				iconClassName: "fill-white stroke-white !text-white",
			};
		case "table":
		default:
			return {
				Icon: IconLayoutGrid,
				bgColor: "bg-green-400",
				iconClassName: "fill-white stroke-white !text-white",
			};
	}
}
