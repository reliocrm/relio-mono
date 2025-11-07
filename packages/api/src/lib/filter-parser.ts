/**
 * Filter parser for converting AdvancedFilter structure to MongoDB queries
 * Similar to tablecn's filtering approach
 */

// Types matching the frontend filter types
export interface FilterCondition {
	id: string;
	field: string;
	operator: string;
	value?: string | number | boolean | string[] | number[] | null;
	dateRelative?: string;
	valueFrom?: string | number | Date;
	valueTo?: string | number | Date;
}

export interface FilterGroup {
	id: string;
	logicalOperator: "and" | "or";
	conditions: FilterCondition[];
	groups?: FilterGroup[];
}

export interface AdvancedFilter {
	groups: FilterGroup[];
	globalLogicalOperator: "and" | "or";
}

/**
 * Convert a single filter condition to MongoDB query
 */
function conditionToMongoQuery(condition: FilterCondition, fieldPath: string = ""): any {
	if (!condition.field || !condition.operator) {
		return {};
	}

	const field = fieldPath ? `${fieldPath}.${condition.field}` : condition.field;
	const operator = condition.operator;
	const value = condition.value;

	switch (operator) {
		// Text operators
		case "equals":
			return { [field]: value };
		case "not_equals":
			return { [field]: { $ne: value } };
		case "contains":
			return { [field]: { $regex: String(value), $options: "i" } };
		case "not_contains":
			return { [field]: { $not: { $regex: String(value), $options: "i" } } };
		case "starts_with":
			return { [field]: { $regex: `^${String(value)}`, $options: "i" } };
		case "ends_with":
			return { [field]: { $regex: `${String(value)}$`, $options: "i" } };
		case "is_empty":
			return {
				$or: [
					{ [field]: { $exists: false } },
					{ [field]: null },
					{ [field]: "" },
					{ [field]: [] },
				],
			};
		case "is_not_empty":
			return {
				$and: [
					{ [field]: { $exists: true } },
					{ [field]: { $ne: null } },
					{ [field]: { $ne: "" } },
					{ [field]: { $ne: [] } },
				],
			};

		// Number operators
		case "greater_than":
			return { [field]: { $gt: Number(value) } };
		case "greater_than_or_equal":
			return { [field]: { $gte: Number(value) } };
		case "less_than":
			return { [field]: { $lt: Number(value) } };
		case "less_than_or_equal":
			return { [field]: { $lte: Number(value) } };
		case "between":
			return {
				[field]: {
					$gte: Number(condition.valueFrom),
					$lte: Number(condition.valueTo),
				},
			};
		case "not_between":
			return {
				$or: [
					{ [field]: { $lt: Number(condition.valueFrom) } },
					{ [field]: { $gt: Number(condition.valueTo) } },
				],
			};

		// Date operators
		case "date_is":
			return { [field]: new Date(value as string) };
		case "date_is_not":
			return { [field]: { $ne: new Date(value as string) } };
		case "date_before":
			return { [field]: { $lt: new Date(value as string) } };
		case "date_after":
			return { [field]: { $gt: new Date(value as string) } };
		case "date_between":
			return {
				[field]: {
					$gte: new Date(condition.valueFrom as string),
					$lte: new Date(condition.valueTo as string),
				},
			};
		case "date_is_relative":
			return dateRelativeToMongoQuery(field, condition.dateRelative || "");

		// Boolean operators
		case "is_true":
			return { [field]: true };
		case "is_false":
			return { [field]: false };

		// Select operators
		case "in":
			return { [field]: { $in: Array.isArray(value) ? value : [value] } };
		case "not_in":
			return { [field]: { $nin: Array.isArray(value) ? value : [value] } };

		default:
			return {};
	}
}

/**
 * Convert relative date string to MongoDB date query
 */
function dateRelativeToMongoQuery(field: string, relative: string): any {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let startDate: Date;
	let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today

	switch (relative) {
		case "today":
			startDate = today;
			break;
		case "yesterday":
			startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
			endDate = new Date(today.getTime() - 1);
			break;
		case "tomorrow":
			startDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
			endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 - 1);
			break;
		case "this_week":
			const dayOfWeek = today.getDay();
			startDate = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
			break;
		case "last_week":
			const lastWeekDay = today.getDay();
			startDate = new Date(
				today.getTime() - (lastWeekDay + 7) * 24 * 60 * 60 * 1000,
			);
			endDate = new Date(today.getTime() - (lastWeekDay + 1) * 24 * 60 * 60 * 1000);
			break;
		case "next_week":
			const nextWeekDay = today.getDay();
			startDate = new Date(today.getTime() + (7 - nextWeekDay) * 24 * 60 * 60 * 1000);
			endDate = new Date(
				today.getTime() + (14 - nextWeekDay) * 24 * 60 * 60 * 1000 - 1,
			);
			break;
		case "this_month":
			startDate = new Date(today.getFullYear(), today.getMonth(), 1);
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
			break;
		case "last_month":
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
			break;
		case "next_month":
			startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
			endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59);
			break;
		case "this_year":
			startDate = new Date(today.getFullYear(), 0, 1);
			endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
			break;
		case "last_year":
			startDate = new Date(today.getFullYear() - 1, 0, 1);
			endDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59);
			break;
		case "next_year":
			startDate = new Date(today.getFullYear() + 1, 0, 1);
			endDate = new Date(today.getFullYear() + 1, 11, 31, 23, 59, 59);
			break;
		case "last_7_days":
			startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case "last_30_days":
			startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case "last_90_days":
			startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
			break;
		case "last_365_days":
			startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
			break;
		default:
			return {};
	}

	return {
		[field]: {
			$gte: startDate,
			$lte: endDate,
		},
	};
}

/**
 * Convert a filter group to MongoDB query
 */
function groupToMongoQuery(group: FilterGroup, fieldPath: string = ""): any {
	const conditionQueries = group.conditions
		.map((condition) => conditionToMongoQuery(condition, fieldPath))
		.filter((q) => Object.keys(q).length > 0);

	const nestedGroupQueries = (group.groups || [])
		.map((nestedGroup) => groupToMongoQuery(nestedGroup, fieldPath))
		.filter((q) => Object.keys(q).length > 0);

	const allQueries = [...conditionQueries, ...nestedGroupQueries];

	if (allQueries.length === 0) {
		return {};
	}

	if (allQueries.length === 1) {
		return allQueries[0];
	}

	// Combine queries based on logical operator
	if (group.logicalOperator === "or") {
		return { $or: allQueries };
	} else {
		return { $and: allQueries };
	}
}

/**
 * Convert AdvancedFilter to MongoDB query
 */
export function advancedFilterToMongoQuery(filter: AdvancedFilter): any {
	const groupQueries = filter.groups
		.map((group) => groupToMongoQuery(group))
		.filter((q) => Object.keys(q).length > 0);

	if (groupQueries.length === 0) {
		return {};
	}

	if (groupQueries.length === 1) {
		return groupQueries[0];
	}

	// Combine groups based on global logical operator
	if (filter.globalLogicalOperator === "or") {
		return { $or: groupQueries };
	} else {
		return { $and: groupQueries };
	}
}

/**
 * Build search query for text search across multiple fields
 */
export function buildSearchQuery(searchValue: string, searchableFields: string[]): any {
	if (!searchValue || !searchValue.trim() || searchableFields.length === 0) {
		return {};
	}

	const searchRegex = { $regex: searchValue.trim(), $options: "i" };
	const searchConditions = searchableFields.map((field) => ({
		[field]: searchRegex,
	}));

	return {
		$or: searchConditions,
	};
}

/**
 * Combine filter and search queries
 */
export function combineFilterAndSearch(
	filterQuery: any,
	searchQuery: any,
): any {
	const queries: any[] = [];

	if (Object.keys(filterQuery).length > 0) {
		queries.push(filterQuery);
	}

	if (Object.keys(searchQuery).length > 0) {
		queries.push(searchQuery);
	}

	if (queries.length === 0) {
		return {};
	}

	if (queries.length === 1) {
		return queries[0];
	}

	return { $and: queries };
}

