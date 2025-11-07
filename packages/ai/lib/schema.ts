export const TOOL_SCHEMAS = {
	searchContacts: {
		name: "searchContacts",
		description:
			"Search and retrieve contact information from the CRM database",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description:
						"Search term for contact name, email, or company",
				},
				limit: {
					type: "number",
					description:
						"Maximum number of contacts to return (max 20)",
					default: 10,
					maximum: 20,
				},
				status: {
					type: "string",
					description: "Filter by contact status",
					enum: ["active", "inactive", "prospect", "customer"],
				},
			},
			required: ["query"],
		},
	},

	searchCompanies: {
		name: "searchCompanies",
		description: "Search and retrieve company information",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Search term for company name or industry",
				},
				limit: {
					type: "number",
					description:
						"Maximum number of companies to return (max 20)",
					default: 10,
					maximum: 20,
				},
				industry: {
					type: "string",
					description: "Filter by industry type",
				},
			},
			required: ["query"],
		},
	},

	getTaskSummary: {
		name: "getTaskSummary",
		description:
			"Get summary of tasks and their status within the organization",
		parameters: {
			type: "object",
			properties: {
				assigneeId: {
					type: "string",
					description: "Filter tasks by assignee user ID",
				},
				status: {
					type: "string",
					description: "Filter by task status",
					enum: ["backlog", "todo", "in_progress", "review", "done"],
				},
				priority: {
					type: "string",
					description: "Filter by task priority",
					enum: ["no_priority", "urgent", "high", "medium", "low"],
				},
				days: {
					type: "number",
					description: "Number of days to look back (default 30)",
					default: 30,
					maximum: 365,
				},
			},
		},
	},

	getAnalytics: {
		name: "getAnalytics",
		description: "Get analytics and metrics for the organization",
		parameters: {
			type: "object",
			properties: {
				period: {
					type: "string",
					description: "Time period for analytics",
					enum: [
						"today",
						"this_week",
						"this_month",
						"last_month",
						"this_year",
					],
				},
				metrics: {
					type: "array",
					items: {
						type: "string",
						enum: ["contacts", "tasks", "companies", "notes"],
					},
					description: "Specific metrics to retrieve",
				},
			},
			required: ["period"],
		},
	},

	getRecentActivity: {
		name: "getRecentActivity",
		description:
			"Get recent activity and updates across the organization with time period filtering",
		parameters: {
			type: "object",
			properties: {
				limit: {
					type: "number",
					description: "Maximum number of activities to return",
					default: 10,
					maximum: 50,
				},
				type: {
					type: "string",
					description: "Filter by activity type",
					enum: [
						"contact_created",
						"task_created",
						"task_completed",
						"note_created",
						"company_created",
					],
				},
				userId: {
					type: "string",
					description: "Filter activities by specific user",
				},
				period: {
					type: "string",
					description: "Filter by time period",
					enum: [
						"today",
						"this_week",
						"this_month",
						"last_week",
						"last_month",
					],
				},
			},
		},
	},

	createTask: {
		name: "createTask",
		description: "Create a new task in the CRM system",
		parameters: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "Title of the task",
				},
				description: {
					type: "string",
					description: "Detailed description of the task",
				},
				priority: {
					type: "string",
					description: "Task priority level",
					enum: ["no_priority", "urgent", "high", "medium", "low"],
					default: "medium",
				},
				assigneeId: {
					type: "string",
					description: "User ID to assign the task to",
				},
				dueDate: {
					type: "string",
					description: "Due date in ISO format (YYYY-MM-DD)",
				},
			},
			required: ["title"],
		},
	},

	searchWeb: {
		name: "searchWeb",
		description:
			"Search the web for current information, news, and research using one or more search queries",
		parameters: {
			type: "object",
			properties: {
				queries: {
					type: "array",
					items: {
						type: "string",
					},
					description:
						"Array of search queries to look up on the web",
					minItems: 1,
					maxItems: 5,
				},
			},
			required: ["queries"],
		},
	},
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;

export const AVAILABLE_TOOLS: ToolName[] = [
	"searchContacts",
	"searchCompanies",
	"getTaskSummary",
	"getAnalytics",
	"getRecentActivity",
	"createTask",
	"searchWeb",
];
