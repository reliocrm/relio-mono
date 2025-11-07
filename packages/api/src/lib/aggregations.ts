/**
 * Aggregation utilities for table column calculations
 */

export type AggregationType =
	| "none"
	| "count-empty"
	| "count-filled"
	| "percent-empty"
	| "percent-filled"
	| "sum"
	| "avg"
	| "min"
	| "max";

/**
 * Get cell value from row data, handling nested paths
 */
export function getCellValue(row: Record<string, any>, accessorKey: string): any {
	if (!accessorKey || accessorKey === "select") return null;

	// Handle nested paths
	if (accessorKey.includes(".")) {
		return accessorKey.split(".").reduce((obj: any, key: string) => obj?.[key], row);
	}

	return row[accessorKey];
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: any): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string" && value.trim() === "") return true;
	if (Array.isArray(value) && value.length === 0) return true;
	if (typeof value === "object" && Object.keys(value).length === 0) return true;
	return false;
}

/**
 * Get field type from column definition
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
 * Calculate aggregation for a column
 */
export function calculateAggregation(
	data: Record<string, any>[],
	accessorKey: string,
	aggregationType: AggregationType,
	columnDef?: any
): string | number {
	if (aggregationType === "none") return "";

	const fieldType = columnDef ? getFieldType(columnDef) : "text";
	const isNumberField = fieldType === "number";

	// Get all values for this column
	const values = data.map((row) => getCellValue(row, accessorKey)).filter((v) => v !== undefined);

	if (aggregationType === "count-empty") {
		return data.filter((row) => isEmpty(getCellValue(row, accessorKey))).length;
	}

	if (aggregationType === "count-filled") {
		return data.filter((row) => !isEmpty(getCellValue(row, accessorKey))).length;
	}

	if (aggregationType === "percent-empty") {
		const emptyCount = data.filter((row) => isEmpty(getCellValue(row, accessorKey))).length;
		return data.length > 0 ? Math.round((emptyCount / data.length) * 100) : 0;
	}

	if (aggregationType === "percent-filled") {
		const filledCount = data.filter((row) => !isEmpty(getCellValue(row, accessorKey))).length;
		return data.length > 0 ? Math.round((filledCount / data.length) * 100) : 0;
	}

	// Number field aggregations
	if (isNumberField) {
		const numericValues = values
			.map((v) => {
				const num = typeof v === "string" ? parseFloat(v) : v;
				return typeof num === "number" && !isNaN(num) ? num : null;
			})
			.filter((v): v is number => v !== null);

		if (numericValues.length === 0) return "-";

		if (aggregationType === "sum") {
			return numericValues.reduce((sum, val) => sum + val, 0);
		}

		if (aggregationType === "avg") {
			const sum = numericValues.reduce((sum, val) => sum + val, 0);
			return Math.round((sum / numericValues.length) * 100) / 100;
		}

		if (aggregationType === "min") {
			return Math.min(...numericValues);
		}

		if (aggregationType === "max") {
			return Math.max(...numericValues);
		}
	}

	return "-";
}

/**
 * Get available aggregations for a column based on field type
 */
export function getAvailableAggregations(
	accessorKey: string,
	columnDef?: any
): AggregationType[] {
	if (accessorKey === "select") return ["none"];

	const fieldType = columnDef ? getFieldType(columnDef) : "text";
	const isNumberField = fieldType === "number";

	if (isNumberField) {
		return ["none", "sum", "avg", "min", "max", "count-empty", "count-filled"];
	}

	return ["none", "count-empty", "count-filled", "percent-empty", "percent-filled"];
}

/**
 * Format aggregation value for display
 */
export function formatAggregationValue(
	value: string | number,
	aggregationType: AggregationType
): string {
	if (value === "" || value === "-") return "";

	if (aggregationType === "percent-empty" || aggregationType === "percent-filled") {
		return `${value}%`;
	}

	if (typeof value === "number") {
		// Format numbers with commas for thousands
		return value.toLocaleString();
	}

	return String(value);
}

/**
 * Calculate multiple aggregations for multiple columns at once
 * Returns a map of column accessorKey to aggregation result
 */
export function calculateAggregations(
	data: Record<string, any>[],
	aggregations: Record<string, { type: AggregationType; columnDef?: any }>
): Record<string, string | number> {
	const results: Record<string, string | number> = {};

	for (const [accessorKey, config] of Object.entries(aggregations)) {
		if (config.type === "none") {
			results[accessorKey] = "";
			continue;
		}

		results[accessorKey] = calculateAggregation(
			data,
			accessorKey,
			config.type,
			config.columnDef
		);
	}

	return results;
}

