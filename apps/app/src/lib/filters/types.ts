// Filter types for advanced filtering system

export interface FilterOperator {
	value: string;
	label: string;
	requiresValue?: boolean;
	requiresRange?: boolean;
	requiresOptions?: boolean;
}

export interface FilterFieldDefinition {
	key: string;
	label: string;
	dataType: "text" | "number" | "date" | "boolean" | "select" | "multi_select" | "relation";
	operators: FilterOperator[];
	options?: Array<{ label: string; value: string }>;
	placeholder?: string;
	description?: string;
	relationTable?: string;
	relationDisplayField?: string;
	relationValueField?: string;
}

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

// Operator definitions for different field types
export const TEXT_OPERATORS: FilterOperator[] = [
	{ value: "equals", label: "Equals", requiresValue: true },
	{ value: "not_equals", label: "Not equals", requiresValue: true },
	{ value: "contains", label: "Contains", requiresValue: true },
	{ value: "not_contains", label: "Does not contain", requiresValue: true },
	{ value: "starts_with", label: "Starts with", requiresValue: true },
	{ value: "ends_with", label: "Ends with", requiresValue: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const NUMBER_OPERATORS: FilterOperator[] = [
	{ value: "equals", label: "Equals", requiresValue: true },
	{ value: "not_equals", label: "Not equals", requiresValue: true },
	{ value: "greater_than", label: "Greater than", requiresValue: true },
	{ value: "greater_than_or_equal", label: "Greater than or equal", requiresValue: true },
	{ value: "less_than", label: "Less than", requiresValue: true },
	{ value: "less_than_or_equal", label: "Less than or equal", requiresValue: true },
	{ value: "between", label: "Between", requiresRange: true },
	{ value: "not_between", label: "Not between", requiresRange: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const DATE_OPERATORS: FilterOperator[] = [
	{ value: "date_is", label: "Is", requiresValue: true },
	{ value: "date_is_not", label: "Is not", requiresValue: true },
	{ value: "date_before", label: "Before", requiresValue: true },
	{ value: "date_after", label: "After", requiresValue: true },
	{ value: "date_between", label: "Between", requiresRange: true },
	{ value: "date_is_relative", label: "Is relative", requiresOptions: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const BOOLEAN_OPERATORS: FilterOperator[] = [
	{ value: "is_true", label: "Is true" },
	{ value: "is_false", label: "Is false" },
];

export const SELECT_OPERATORS: FilterOperator[] = [
	{ value: "equals", label: "Equals", requiresValue: true },
	{ value: "not_equals", label: "Not equals", requiresValue: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const MULTI_SELECT_OPERATORS: FilterOperator[] = [
	{ value: "in", label: "Contains any", requiresOptions: true },
	{ value: "not_in", label: "Does not contain any", requiresOptions: true },
	{ value: "contains", label: "Contains", requiresValue: true },
	{ value: "not_contains", label: "Does not contain", requiresValue: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const RELATION_OPERATORS: FilterOperator[] = [
	{ value: "equals", label: "Equals", requiresValue: true },
	{ value: "not_equals", label: "Not equals", requiresValue: true },
	{ value: "in", label: "Is any of", requiresOptions: true },
	{ value: "not_in", label: "Is not any of", requiresOptions: true },
	{ value: "is_empty", label: "Is empty" },
	{ value: "is_not_empty", label: "Is not empty" },
];

export const DATE_RELATIVE_OPTIONS = [
	{ value: "today", label: "Today" },
	{ value: "yesterday", label: "Yesterday" },
	{ value: "tomorrow", label: "Tomorrow" },
	{ value: "this_week", label: "This week" },
	{ value: "last_week", label: "Last week" },
	{ value: "next_week", label: "Next week" },
	{ value: "this_month", label: "This month" },
	{ value: "last_month", label: "Last month" },
	{ value: "next_month", label: "Next month" },
	{ value: "this_year", label: "This year" },
	{ value: "last_year", label: "Last year" },
	{ value: "next_year", label: "Next year" },
	{ value: "last_7_days", label: "Last 7 days" },
	{ value: "last_30_days", label: "Last 30 days" },
	{ value: "last_90_days", label: "Last 90 days" },
	{ value: "last_365_days", label: "Last 365 days" },
];

// Helper functions
export function getOperatorsForFieldType(dataType: string): FilterOperator[] {
	switch (dataType) {
		case "text":
			return TEXT_OPERATORS;
		case "number":
			return NUMBER_OPERATORS;
		case "date":
			return DATE_OPERATORS;
		case "boolean":
			return BOOLEAN_OPERATORS;
		case "select":
			return SELECT_OPERATORS;
		case "multi_select":
			return MULTI_SELECT_OPERATORS;
		case "relation":
			return RELATION_OPERATORS;
		default:
			return TEXT_OPERATORS;
	}
}

export function operatorRequiresValue(operator: string): boolean {
	const allOperators = [
		...TEXT_OPERATORS,
		...NUMBER_OPERATORS,
		...DATE_OPERATORS,
		...SELECT_OPERATORS,
		...MULTI_SELECT_OPERATORS,
		...RELATION_OPERATORS,
	];
	const operatorDef = allOperators.find((op) => op.value === operator);
	return operatorDef?.requiresValue || false;
}

export function operatorRequiresRange(operator: string): boolean {
	const allOperators = [
		...TEXT_OPERATORS,
		...NUMBER_OPERATORS,
		...DATE_OPERATORS,
		...SELECT_OPERATORS,
		...MULTI_SELECT_OPERATORS,
		...RELATION_OPERATORS,
	];
	const operatorDef = allOperators.find((op) => op.value === operator);
	return operatorDef?.requiresRange || false;
}

export function operatorRequiresOptions(operator: string): boolean {
	const allOperators = [
		...TEXT_OPERATORS,
		...NUMBER_OPERATORS,
		...DATE_OPERATORS,
		...SELECT_OPERATORS,
		...MULTI_SELECT_OPERATORS,
		...RELATION_OPERATORS,
	];
	const operatorDef = allOperators.find((op) => op.value === operator);
	return operatorDef?.requiresOptions || false;
}

export function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}

export function createEmptyCondition(): FilterCondition {
	return {
		id: generateId(),
		field: "",
		operator: "",
		value: undefined,
	};
}

export function createEmptyGroup(): FilterGroup {
	return {
		id: generateId(),
		logicalOperator: "and",
		conditions: [createEmptyCondition()],
		groups: [],
	};
}

export function createEmptyFilter(): AdvancedFilter {
	return {
		groups: [createEmptyGroup()],
		globalLogicalOperator: "and",
	};
}

