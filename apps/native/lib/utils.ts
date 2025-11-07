import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

