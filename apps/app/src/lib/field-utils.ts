import {
	IconAt,
	IconLetterCaseToggle,
	IconPhone,
	IconCalendar,
	Icon123,
	IconToggleLeft,
	IconLink,
	IconPhoto,
	IconId,
	IconChevronDown,
	IconBox,
	IconBrackets,
	type Icon as TablerIcon,
} from "@tabler/icons-react";

/**
 * System fields that are read-only and cannot be edited
 */
export const SYSTEM_FIELDS = [
	"_id",
	"id",
	"createdAt",
	"updatedAt",
	"createdBy",
	"updatedBy",
	"organizationId",
	"isDeleted",
	"deletedAt",
	"deletedBy",
	"lastViewedAt",
	"lastViewedBy",
] as const;

/**
 * Check if a field is a system field (read-only)
 * Handles nested fields like "address.location.city" by checking the base field
 */
export function isSystemField(field: string): boolean {
	if (!field) return false;
	// Extract the base field name (first part before any dots)
	const baseField = field.split(".")[0];
	return SYSTEM_FIELDS.includes(baseField as any);
}

/**
 * Get the field type from a column definition
 */
export function getFieldType(columnDef: any): string {
	if (columnDef?.type) {
		return columnDef.type;
	}
	if (columnDef?.meta?.type) {
		return columnDef.meta.type;
	}
	// Infer type from field name
	if (columnDef?.field) {
		const field = columnDef.field.toLowerCase();
		if (field.includes("email")) return "email";
		if (field.includes("phone")) return "phone";
		if (field.includes("date") || field.includes("at")) return "date";
		if (field.includes("image") || field.includes("photo") || field.includes("avatar")) return "image";
		if (field.includes("url") || field.includes("website")) return "url";
		if (field === "age" || field.includes("count") || field.includes("number")) return "number";
		if (field.includes("id")) return "id";
	}
	return "text";
}

/**
 * Format field type for display
 */
export function formatFieldType(type: string): string {
	const typeMap: Record<string, string> = {
		text: "Text",
		email: "Email",
		phone: "Phone",
		date: "Date",
		number: "Number",
		boolean: "Boolean",
		select: "Select",
		multiselect: "Multi-select",
		url: "URL",
		image: "Image",
		id: "ID",
		object: "Object",
		array: "Array",
	};
	return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get the icon component for a field type
 */
export function getFieldTypeIcon(type: string): TablerIcon {
	const iconMap: Record<string, TablerIcon> = {
		text: IconLetterCaseToggle,
		email: IconAt,
		phone: IconPhone,
		date: IconCalendar,
		number: Icon123,
		boolean: IconToggleLeft,
		select: IconChevronDown,
		multiselect: IconBrackets,
		url: IconLink,
		image: IconPhoto,
		id: IconId,
		object: IconBox,
		array: IconBrackets,
	};
	return iconMap[type.toLowerCase()] || IconBox;
}

