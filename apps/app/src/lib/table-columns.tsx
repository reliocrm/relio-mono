import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// TableData type - can be Contact, Company, or Property
type TableData = Record<string, any> & {
	_id?: any;
	id?: string;
	firstName?: string;
	lastName?: string;
	email?: any;
	phone?: any;
	image?: string;
	summary?: string;
	title?: string;
	social?: Record<string, string>;
	company?: any;
	createdAt?: Date | string;
	name?: string;
	description?: string;
	industry?: string;
	website?: string;
	logo?: string;
	size?: string;
	propertyType?: string;
	status?: string;
	market?: string;
};

// Helper to get nested value from object
function getNestedValue(obj: any, path: string): any {
	return path.split(".").reduce((current, prop) => current?.[prop], obj);
}

// Helper to format email
function formatEmail(email: any): string {
	if (typeof email === "string") return email;
	if (Array.isArray(email) && email.length > 0) {
		return typeof email[0] === "string" ? email[0] : email[0]?.value || "";
	}
	if (email?.value) return email.value;
	return "";
}

// Helper to format phone
function formatPhone(phone: any): string {
	if (typeof phone === "string") return phone;
	if (Array.isArray(phone) && phone.length > 0) {
		return typeof phone[0] === "string" ? phone[0] : phone[0]?.value || "";
	}
	if (phone?.value) return phone.value;
	return "";
}

// Helper to format social links
function formatSocial(social: any, platform: string): string {
	if (!social || typeof social !== "object") return "";
	return social[platform] || "";
}

// Contact columns
export function getContactColumns(): ColumnDef<TableData>[] {
	return [
		{
			id: "contact", // Use a separate ID for the Contact column, not "firstName"
			accessorKey: "firstName", // Still access firstName for data, but column ID is "contact"
			header: "Contact",
			enablePinning: true,
			enableHiding: false, // Contact column cannot be hidden or removed
			size: 300,
			cell: ({ row }) => {
				const contact = row.original;
				const firstName = contact.firstName || "";
				const lastName = contact.lastName || "";
				const name = `${firstName} ${lastName}`.trim() || formatEmail(contact.email);
				const email = formatEmail(contact.email);

				return (
					<div className="flex items-center gap-2">
						{contact.image && (
							<img
								src={contact.image}
								alt={name}
								className="h-6 w-6 rounded-full object-cover"
							/>
						)}
						<div className="flex flex-col">
							<span className="font-medium text-foreground">{name}</span>
							{email && <span className="text-xs text-muted-foreground">{email}</span>}
						</div>
					</div>
				);
			},
			minSize: 200,
		},
		{
			accessorKey: "_id",
			id: "recordId",
			header: "Record ID",
			cell: ({ row }) => {
				const id = row.original._id?.toString() || "";
				return <span className="text-xs text-muted-foreground font-mono">{id}</span>;
			},
			minSize: 200,
		},
		{
			accessorKey: "summary",
			header: "Description",
			cell: ({ row }) => {
				const summary = row.original.summary || "";
				return (
					<span className="text-sm text-muted-foreground line-clamp-1">
						{summary || "-"}
					</span>
				);
			},
			minSize: 150,
		},
		{
			accessorKey: "title",
			header: "Job title",
			cell: ({ row }) => {
				const title = row.original.title || "";
				return <span className="text-sm">{title || "-"}</span>;
			},
			minSize: 120,
		},
		{
			accessorKey: "email",
			header: "Email addresses",
			cell: ({ row }) => {
				const email = formatEmail(row.original.email);
				if (!email) return <span className="text-muted-foreground">-</span>;
				return (
					<a
						href={`mailto:${email}`}
						className="text-blue-400 hover:underline text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						{email}
					</a>
				);
			},
			minSize: 180,
		},
		{
			id: "social.angelList",
			header: "AngelList",
			cell: ({ row }) => {
				const value = formatSocial(row.original.social, "angelList");
				return <span className="text-sm">{value || "-"}</span>;
			},
			minSize: 120,
		},
		{
			id: "social.linkedIn",
			header: "LinkedIn",
			cell: ({ row }) => {
				const value = formatSocial(row.original.social, "linkedIn");
				if (!value) return <span className="text-muted-foreground">-</span>;
				return (
					<a
						href={`https://linkedin.com/in/${value}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-400 hover:underline text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						{value}
					</a>
				);
			},
			minSize: 120,
		},
		{
			id: "social.instagram",
			header: "Instagram",
			cell: ({ row }) => {
				const value = formatSocial(row.original.social, "instagram");
				if (!value) return <span className="text-muted-foreground">-</span>;
				return (
					<a
						href={`https://instagram.com/${value}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-400 hover:underline text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						{value}
					</a>
				);
			},
			minSize: 120,
		},
		{
			id: "company",
			header: "Company",
			cell: ({ row }) => {
				const company = (row.original as any).company;
				if (!company) return <span className="text-muted-foreground">-</span>;
				const companyName = typeof company === "string" ? company : company.name || "";
				return (
					<div className="flex items-center gap-2">
						{company.logo && (
							<img
								src={company.logo}
								alt={companyName}
								className="h-5 w-5 rounded object-cover"
							/>
						)}
						<span className="text-sm">{companyName}</span>
					</div>
				);
			},
			minSize: 150,
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const date = row.original.createdAt;
				if (!date) return <span className="text-muted-foreground">-</span>;
				return (
					<span className="text-sm text-muted-foreground">
						{format(new Date(date), "MMM d, yyyy")}
					</span>
				);
			},
			minSize: 120,
		},
	];
}

// Company columns
export function getCompanyColumns(): ColumnDef<TableData>[] {
	return [
		{
			accessorKey: "name",
			header: "Company",
			cell: ({ row }) => {
				const company = row.original;
				return (
					<div className="flex items-center gap-2">
						{company.logo && (
							<img
								src={company.logo}
								alt={company.name}
								className="h-6 w-6 rounded object-cover"
							/>
						)}
						<span className="font-medium text-foreground">{company.name}</span>
					</div>
				);
			},
			minSize: 200,
		},
		{
			accessorKey: "_id",
			id: "recordId",
			header: "Record ID",
			cell: ({ row }) => {
				const id = row.original._id?.toString() || "";
				return <span className="text-xs text-muted-foreground font-mono">{id}</span>;
			},
			minSize: 200,
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => {
				const description = row.original.description || "";
				return (
					<span className="text-sm text-muted-foreground line-clamp-1">
						{description || "-"}
					</span>
				);
			},
			minSize: 150,
		},
		{
			accessorKey: "industry",
			header: "Industry",
			cell: ({ row }) => {
				const industry = row.original.industry || "";
				return <span className="text-sm">{industry || "-"}</span>;
			},
			minSize: 120,
		},
		{
			accessorKey: "website",
			header: "Website",
			cell: ({ row }) => {
				const website = row.original.website || "";
				if (!website) return <span className="text-muted-foreground">-</span>;
				return (
					<a
						href={website.startsWith("http") ? website : `https://${website}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-400 hover:underline text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						{website}
					</a>
				);
			},
			minSize: 150,
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => {
				const email = row.original.email || "";
				if (!email) return <span className="text-muted-foreground">-</span>;
				return (
					<a
						href={`mailto:${email}`}
						className="text-blue-400 hover:underline text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						{email}
					</a>
				);
			},
			minSize: 180,
		},
		{
			accessorKey: "phone",
			header: "Phone",
			cell: ({ row }) => {
				const phone = row.original.phone || "";
				return <span className="text-sm">{phone || "-"}</span>;
			},
			minSize: 120,
		},
		{
			accessorKey: "size",
			header: "Size",
			cell: ({ row }) => {
				const size = row.original.size || "";
				return <span className="text-sm">{size || "-"}</span>;
			},
			minSize: 100,
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const date = row.original.createdAt;
				if (!date) return <span className="text-muted-foreground">-</span>;
				return (
					<span className="text-sm text-muted-foreground">
						{format(new Date(date), "MMM d, yyyy")}
					</span>
				);
			},
			minSize: 120,
		},
	];
}

// Property columns
export function getPropertyColumns(): ColumnDef<TableData>[] {
	return [
		{
			accessorKey: "name",
			header: "Property",
			cell: ({ row }) => {
				const property = row.original;
				return (
					<div className="flex items-center gap-2">
						{property.image && (
							<img
								src={property.image}
								alt={property.name}
								className="h-6 w-6 rounded object-cover"
							/>
						)}
						<span className="font-medium text-foreground">{property.name}</span>
					</div>
				);
			},
			minSize: 200,
		},
		{
			accessorKey: "_id",
			id: "recordId",
			header: "Record ID",
			cell: ({ row }) => {
				const id = row.original._id?.toString() || "";
				return <span className="text-xs text-muted-foreground font-mono">{id}</span>;
			},
			minSize: 200,
		},
		{
			accessorKey: "propertyType",
			header: "Type",
			cell: ({ row }) => {
				const type = row.original.propertyType || "";
				return <span className="text-sm">{type || "-"}</span>;
			},
			minSize: 120,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status || "";
				return <span className="text-sm">{status || "-"}</span>;
			},
			minSize: 100,
		},
		{
			accessorKey: "market",
			header: "Market",
			cell: ({ row }) => {
				const market = row.original.market || "";
				return <span className="text-sm">{market || "-"}</span>;
			},
			minSize: 120,
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const date = row.original.createdAt;
				if (!date) return <span className="text-muted-foreground">-</span>;
				return (
					<span className="text-sm text-muted-foreground">
						{format(new Date(date), "MMM d, yyyy")}
					</span>
				);
			},
			minSize: 120,
		},
	];
}

// Get all available fields for an object type (for column selection)
export interface AvailableField {
	field: string;
	headerName: string;
	type: string;
	description?: string;
}

/**
 * Get all available fields for an object type based on the model schema
 * TODO: Add custom fields support - fetch CustomFieldDefinition records for the objectType
 * and merge them with the base model fields
 */
export function getAvailableFieldsForObjectType(
	objectType: "contact" | "company" | "property"
): AvailableField[] {
	switch (objectType) {
		case "contact":
			return [
				{ field: "_id", headerName: "Record ID", type: "id" },
				{ field: "firstName", headerName: "First name", type: "text" },
				{ field: "lastName", headerName: "Last name", type: "text" },
				{ field: "image", headerName: "Profile Image", type: "image" },
				{ field: "title", headerName: "Job title", type: "text" },
				{ field: "email", headerName: "Email addresses", type: "email" },
				{ field: "phone", headerName: "Phone", type: "phone" },
				{ field: "website", headerName: "Website", type: "url" },
				{ field: "summary", headerName: "Description", type: "text" },
				{ field: "persona", headerName: "Persona", type: "text" },
				{ field: "status", headerName: "Status", type: "text" },
				{ field: "stage", headerName: "Stage", type: "text" },
				{ field: "source", headerName: "Source", type: "text" },
				{ field: "birthday", headerName: "Birthday", type: "date" },
				{ field: "age", headerName: "Age", type: "number" },
				{ field: "spouseName", headerName: "Spouse Name", type: "text" },
				{ field: "buyerNeeds", headerName: "Buyer Needs", type: "object" },
				{ field: "generatedSummary", headerName: "Generated Summary", type: "text" },
				{ field: "apolloId", headerName: "Apollo ID", type: "text" },
				{ field: "address", headerName: "Address", type: "object" },
				{ field: "social", headerName: "Social", type: "object" },
				{ field: "companyId", headerName: "Company", type: "object" },
				{ field: "organizationId", headerName: "Organization ID", type: "id" },
				{ field: "createdBy", headerName: "Created By", type: "id" },
				{ field: "updatedBy", headerName: "Updated By", type: "id" },
				{ field: "lastViewedAt", headerName: "Last Viewed At", type: "date" },
				{ field: "lastViewedBy", headerName: "Last Viewed By", type: "id" },
				{ field: "isDeleted", headerName: "Is Deleted", type: "boolean" },
				{ field: "deletedAt", headerName: "Deleted At", type: "date" },
				{ field: "deletedBy", headerName: "Deleted By", type: "id" },
				{ field: "createdAt", headerName: "Created at", type: "date" },
				{ field: "updatedAt", headerName: "Updated at", type: "date" },
			];
		case "company":
			return [
				{ field: "_id", headerName: "Record ID", type: "id" },
				{ field: "name", headerName: "Company", type: "text" },
				{ field: "description", headerName: "Description", type: "text" },
				{ field: "industry", headerName: "Industry", type: "text" },
				{ field: "website", headerName: "Website", type: "url" },
				{ field: "email", headerName: "Email", type: "email" },
				{ field: "phone", headerName: "Phone", type: "phone" },
				{ field: "logo", headerName: "Logo", type: "image" },
				{ field: "size", headerName: "Size", type: "text" },
				{ field: "address", headerName: "Address", type: "object" },
				{ field: "organizationId", headerName: "Organization ID", type: "id" },
				{ field: "createdBy", headerName: "Created By", type: "id" },
				{ field: "updatedBy", headerName: "Updated By", type: "id" },
				{ field: "isDeleted", headerName: "Is Deleted", type: "boolean" },
				{ field: "deletedAt", headerName: "Deleted At", type: "date" },
				{ field: "deletedBy", headerName: "Deleted By", type: "id" },
				{ field: "createdAt", headerName: "Created at", type: "date" },
				{ field: "updatedAt", headerName: "Updated at", type: "date" },
			];
		case "property":
			return [
				{ field: "_id", headerName: "Record ID", type: "id" },
				{ field: "name", headerName: "Property", type: "text" },
				{ field: "recordType", headerName: "Record Type", type: "text" },
				{ field: "image", headerName: "Image", type: "image" },
				{ field: "propertyType", headerName: "Type", type: "text" },
				{ field: "propertySubType", headerName: "Sub Type", type: "text" },
				{ field: "status", headerName: "Status", type: "text" },
				{ field: "market", headerName: "Market", type: "text" },
				{ field: "subMarket", headerName: "Sub Market", type: "text" },
				{ field: "listingId", headerName: "Listing ID", type: "text" },
				{ field: "apolloId", headerName: "Apollo ID", type: "text" },
				{ field: "organizationId", headerName: "Organization ID", type: "id" },
				{ field: "createdBy", headerName: "Created By", type: "id" },
				{ field: "updatedBy", headerName: "Updated By", type: "id" },
				{ field: "lastViewedAt", headerName: "Last Viewed At", type: "date" },
				{ field: "lastViewedBy", headerName: "Last Viewed By", type: "id" },
				{ field: "isDeleted", headerName: "Is Deleted", type: "boolean" },
				{ field: "deletedAt", headerName: "Deleted At", type: "date" },
				{ field: "deletedBy", headerName: "Deleted By", type: "id" },
				{ field: "createdAt", headerName: "Created at", type: "date" },
				{ field: "updatedAt", headerName: "Updated at", type: "date" },
			];
		default:
			return [];
	}
}

// Get columns based on object type
export function getColumnsForObjectType(
	objectType: "contact" | "company" | "property"
): ColumnDef<TableData>[] {
	switch (objectType) {
		case "contact":
			return getContactColumns();
		case "company":
			return getCompanyColumns();
		case "property":
			return getPropertyColumns();
		default:
			return [];
	}
}

// Convert view columnDefs to TanStack Table columns
export function convertColumnDefsToColumns(
	columnDefs: any[],
	baseColumns: ColumnDef<TableData>[],
	objectType?: "contact" | "company" | "property"
): ColumnDef<TableData>[] {
	// If columnDefs is null/undefined, use baseColumns as fallback
	if (!columnDefs) {
		return baseColumns;
	}
	
	// If columnDefs is explicitly an empty array, return empty array (no columns)
	if (columnDefs.length === 0) {
		return [];
	}

	// Create a map of base columns by accessor key or id
	const baseColumnMap = new Map<string, ColumnDef<TableData>>();
	baseColumns.forEach((col) => {
		// Map by id first (most specific)
		if (col.id) {
			baseColumnMap.set(col.id, col);
		}
		// Also map by accessorKey if different from id
		const accessorKey = (col as any).accessorKey;
		if (accessorKey && accessorKey !== col.id) {
			baseColumnMap.set(accessorKey, col);
		}
	});

	// Build columns from columnDefs, preserving order
	// Note: We include ALL columns here, even if visible === false
	// Visibility is handled by TanStack Table's columnVisibility state
	const result: ColumnDef<TableData>[] = [];
	const usedKeys = new Set<string>();

	columnDefs.forEach((def) => {
		const key = def.id || def.accessorKey || def.field;
		if (!key) return;

		// Special handling for firstName - create a separate column, not the Contact column
		if (key === "firstName") {
			// Create a regular firstName column (separate from Contact)
			result.push({
				accessorKey: "firstName",
				id: "firstName",
				header: def.headerName || def.label || "First name",
				size: def.width || 150,
				minSize: def.minWidth || 50,
				maxSize: def.maxWidth || 400,
				cell: ({ row }) => {
					const firstName = row.original.firstName || "";
					return <span className="text-sm">{firstName || "-"}</span>;
				},
				meta: {
					columnDef: def,
				} as any,
			});
			usedKeys.add(key);
			return;
		}

		const baseCol = baseColumnMap.get(key);
		if (baseCol) {
			// Skip the Contact column (id: "contact") - it's handled separately
			if (baseCol.id === "contact") {
				usedKeys.add(key);
				return; // Don't process Contact column here, it's always added separately
			}
			
			result.push({
				...baseCol,
				id: key, // Use the field name as id for regular columns
				header: def.headerName || def.label || baseCol.header,
				size: def.width || baseCol.size,
				minSize: def.minWidth || baseCol.minSize,
				maxSize: def.maxWidth || baseCol.maxSize,
				cell: baseCol.cell,
				meta: {
					...(baseCol.meta || {}),
					columnDef: def,
				} as any,
			});
		} else {
			// Create a new column definition for fields not in baseColumns
			const accessorKey = def.field || key;
			const headerName = def.headerName || def.label || accessorKey;
			const fieldType = def.type || "text";
			
			result.push({
				accessorKey,
				id: accessorKey,
				header: headerName,
				cell: ({ row }) => {
					// Handle nested paths
					const value = accessorKey.includes(".")
						? accessorKey.split(".").reduce((obj: any, k: string) => obj?.[k], row.original)
						: row.original[accessorKey];
					
					if (value === null || value === undefined) {
						return <span className="text-muted-foreground">-</span>;
					}
					
					if (fieldType === "date" && value) {
						try {
							return (
								<span className="text-sm text-muted-foreground">
									{format(new Date(value), "MMM d, yyyy")}
								</span>
							);
						} catch {
							return <span className="text-sm">{String(value)}</span>;
						}
					}
					
					if (fieldType === "email" && value) {
						const emailValue = typeof value === "string" ? value : value?.value || "";
						if (!emailValue) return <span className="text-muted-foreground">-</span>;
						return (
							<a
								href={`mailto:${emailValue}`}
								className="text-blue-400 hover:underline text-sm"
								onClick={(e) => e.stopPropagation()}
							>
								{emailValue}
							</a>
						);
					}
					
					if (fieldType === "url" && value) {
						const urlValue = typeof value === "string" ? value : value?.value || "";
						if (!urlValue) return <span className="text-muted-foreground">-</span>;
						const href = urlValue.startsWith("http") ? urlValue : `https://${urlValue}`;
						return (
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 hover:underline text-sm"
								onClick={(e) => e.stopPropagation()}
							>
								{urlValue}
							</a>
						);
					}
					
					if (fieldType === "image" && value) {
						return (
							<img
								src={value}
								alt=""
								className="h-6 w-6 rounded-full object-cover"
							/>
						);
					}
					
					return <span className="text-sm">{String(value)}</span>;
				},
				size: def.width || 150,
				minSize: def.minWidth || 50,
				maxSize: def.maxWidth || 400,
				meta: {
					columnDef: def,
				} as any,
			});
		}
		usedKeys.add(key);
	});

	// Always add the special "Contact" column - it's a pinned column that cannot be removed
	// This is separate from the firstName field which can be added/removed as a regular column
	// Only add Contact column for contact object type
	if (objectType && objectType === "contact") {
		// Always get the Contact column from baseColumns (it has id: "contact")
		const contactBaseCol = baseColumnMap.get("contact");
		if (contactBaseCol) {
			// Check if Contact column is already in result
			const contactExists = result.some((col) => col.id === "contact");
			if (!contactExists) {
				// Always add Contact column at the beginning, regardless of columnDefs
				result.unshift({
					...contactBaseCol,
					id: "contact", // Ensure it has the "contact" ID
					accessorKey: "firstName", // Ensure it accesses firstName data
					header: "Contact",
					enablePinning: true,
					enableHiding: false, // Contact column cannot be hidden or removed
					size: contactBaseCol.size || 300,
				});
			}
		}
	}

	return result;
}

