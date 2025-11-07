import { tool } from "ai";
import { z } from "zod";
import { TOOL_SCHEMAS } from "./schema";

export interface ToolContext {
	organizationId: string;
	userId: string;
	userRole: string;
	db: any; // Database instance - will be typed properly in implementation
}

export interface CRMToolResult {
	success: boolean;
	data?: any;
	error?: string;
	metadata?: {
		executionTime?: number;
		recordCount?: number;
		source?: string;
	};
}

export function createCRMTools(context: ToolContext) {
	const { organizationId, userId, userRole, db } = context;

	return {
		searchContacts: tool({
			description: TOOL_SCHEMAS.searchContacts.description,
			parameters: z.object({
				query: z
					.string()
					.min(1)
					.describe(
						"Search term for contact name, email, or company",
					),
				limit: z
					.number()
					.min(1)
					.max(20)
					.default(10)
					.describe("Maximum number of contacts to return"),
				status: z
					.enum(["active", "inactive", "prospect", "customer"])
					.optional()
					.describe("Filter by contact status"),
			}),
			execute: async ({
				query,
				limit,
				status,
			}): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();

					// Split query into words to handle full names like "Nick Kazemi"
					const queryWords = query.trim().split(/\s+/);

					const searchConditions: any[] = [
						// Single field searches (for single word queries or exact matches)
						{ firstName: { contains: query, mode: "insensitive" } },
						{ lastName: { contains: query, mode: "insensitive" } },
						{ email: { contains: query, mode: "insensitive" } },
						{ company: { contains: query, mode: "insensitive" } },
					];

					// If multiple words, add cross-field searches for full names
					if (queryWords.length >= 2) {
						// Handle "First Last" format
						searchConditions.push({
							AND: [
								{
									firstName: {
										contains: queryWords[0],
										mode: "insensitive",
									},
								},
								{
									lastName: {
										contains: queryWords[1],
										mode: "insensitive",
									},
								},
							],
						});

						// Handle "Last First" format (in case user types backwards)
						searchConditions.push({
							AND: [
								{
									firstName: {
										contains: queryWords[1],
										mode: "insensitive",
									},
								},
								{
									lastName: {
										contains: queryWords[0],
										mode: "insensitive",
									},
								},
							],
						});

						// Add searches for each individual word
						queryWords.forEach((word) => {
							if (word.length > 1) {
								// Avoid single characters
								searchConditions.push(
									{
										firstName: {
											contains: word,
											mode: "insensitive",
										},
									},
									{
										lastName: {
											contains: word,
											mode: "insensitive",
										},
									},
								);
							}
						});
					}

					const whereClause: any = {
						organizationId,
						isDeleted: false,
						OR: searchConditions,
					};

					if (status) {
						whereClause.status = status;
					}

					const contacts = await db.contact.findMany({
						where: whereClause,
						take: limit,
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							phone: true,
							company: true,
							status: true,
							createdAt: true,
							customFieldValues: {
								select: {
									value: true,
									definition: {
										select: {
											name: true,
											type: true,
										},
									},
								},
							},
						},
						orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
						cacheStrategy: { ttl: 60 },
					});

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							contacts: contacts.map((contact: any) => ({
								id: contact.id,
								firstName: contact.firstName,
								lastName: contact.lastName,
								name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
								email: contact.email,
								phone: contact.phone,
								company: contact.company,
								status: contact.status,
								createdAt: contact.createdAt,
								customFields: contact.customFieldValues?.reduce(
									(acc: any, cv: any) => {
										if (cv.definition) {
											acc[cv.definition.name] = cv.value;
										}
										return acc;
									},
									{},
								),
							})),
							query,
							total: contacts.length,
							totalInOrganization: await db.contact.count({
								where: { organizationId, isDeleted: false },
								cacheStrategy: { ttl: 300 },
							}),
						},
						metadata: {
							executionTime,
							recordCount: contacts.length,
							source: "contact",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] searchContacts error:", error);
					return {
						success: false,
						error: "Failed to search contacts. Please try again.",
						metadata: { source: "contact" },
					};
				}
			},
		}),

		searchCompanies: tool({
			description: TOOL_SCHEMAS.searchCompanies.description,
			parameters: z.object({
				query: z
					.string()
					.min(1)
					.describe("Search term for company name or industry"),
				limit: z
					.number()
					.min(1)
					.max(20)
					.default(10)
					.describe("Maximum number of companies to return"),
				industry: z
					.string()
					.optional()
					.describe("Filter by industry type"),
			}),
			execute: async ({
				query,
				limit,
				industry,
			}): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();

					const whereClause: any = {
						organizationId,
						isDeleted: false,
						OR: [
							{ name: { contains: query, mode: "insensitive" } },
							{
								industry: {
									contains: query,
									mode: "insensitive",
								},
							},
							{
								website: {
									contains: query,
									mode: "insensitive",
								},
							},
						],
					};

					if (industry) {
						whereClause.industry = {
							contains: industry,
							mode: "insensitive",
						};
					}

					const companies = await db.company.findMany({
						where: whereClause,
						take: limit,
						select: {
							id: true,
							name: true,
							industry: true,
							website: true,
							size: true,
							revenue: true,
							location: true,
							createdAt: true,
							_count: {
								select: {
									contacts: true,
								},
							},
						},
						orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
						cacheStrategy: { ttl: 120 },
					});

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							companies: companies.map((company: any) => ({
								id: company.id,
								name: company.name,
								industry: company.industry,
								website: company.website,
								size: company.size,
								revenue: company.revenue,
								location: company.location,
								contactCount: company._count.contacts,
								createdAt: company.createdAt,
							})),
							query,
							totalFound: companies.length,
						},
						metadata: {
							executionTime,
							recordCount: companies.length,
							source: "companies",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] searchCompanies error:", error);
					return {
						success: false,
						error: "Failed to search companies. Please try again.",
						metadata: { source: "companies" },
					};
				}
			},
		}),

		getTaskSummary: tool({
			description: TOOL_SCHEMAS.getTaskSummary.description,
			parameters: z.object({
				assigneeId: z
					.string()
					.optional()
					.describe("Filter tasks by assignee user ID"),
				status: z
					.enum(["backlog", "todo", "in_progress", "review", "done"])
					.optional()
					.describe("Filter by task status"),
				priority: z
					.enum(["no_priority", "urgent", "high", "medium", "low"])
					.optional()
					.describe("Filter by task priority"),
				days: z
					.number()
					.min(1)
					.max(365)
					.default(30)
					.describe("Number of days to look back"),
			}),
			execute: async ({
				assigneeId,
				status,
				priority,
				days,
			}): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();
					const startDate = new Date();
					startDate.setDate(startDate.getDate() - days);

					const whereClause: any = {
						organizationId,
						createdAt: { gte: startDate },
					};

					if (assigneeId) whereClause.assigneeId = assigneeId;
					if (status) whereClause.status = status;
					if (priority) whereClause.priority = priority;

					const [tasks, statusCounts, priorityCounts] =
						await Promise.all([
							db.task.findMany({
								where: whereClause,
								take: 50,
								include: {
									assignee: {
										select: { name: true, email: true },
									},
									contact: {
										select: {
											firstName: true,
											lastName: true,
										},
									},
								},
								orderBy: [
									{ priority: "desc" },
									{ createdAt: "desc" },
								],
								cacheStrategy: { ttl: 30 },
							}),
							db.task.groupBy({
								by: ["status"],
								where: {
									organizationId,
									createdAt: { gte: startDate },
								},
								_count: { id: true },
								cacheStrategy: { ttl: 60 },
							}),
							db.task.groupBy({
								by: ["priority"],
								where: {
									organizationId,
									createdAt: { gte: startDate },
								},
								_count: { id: true },
								cacheStrategy: { ttl: 60 },
							}),
						]);

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							tasks: tasks.map((task: any) => ({
								id: task.id,
								title: task.title,
								description: task.description,
								status: task.status,
								priority: task.priority,
								assignee: task.assignee
									? {
											name: task.assignee.name,
											email: task.assignee.email,
										}
									: null,
								contact: task.contact
									? {
											name: `${task.contact.firstName} ${task.contact.lastName}`.trim(),
										}
									: null,
								dueDate: task.dueDate,
								createdAt: task.createdAt,
							})),
							summary: {
								total: tasks.length,
								timeRange: `Last ${days} days`,
								statusBreakdown: statusCounts.reduce(
									(
										acc: Record<string, number>,
										item: any,
									) => {
										acc[item.status] = item._count.id;
										return acc;
									},
									{},
								),
								priorityBreakdown: priorityCounts.reduce(
									(
										acc: Record<string, number>,
										item: any,
									) => {
										acc[item.priority] = item._count.id;
										return acc;
									},
									{},
								),
							},
						},
						metadata: {
							executionTime,
							recordCount: tasks.length,
							source: "tasks",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] getTaskSummary error:", error);
					return {
						success: false,
						error: "Failed to retrieve task summary. Please try again.",
						metadata: { source: "tasks" },
					};
				}
			},
		}),

		getAnalytics: tool({
			description: TOOL_SCHEMAS.getAnalytics.description,
			parameters: z.object({
				period: z
					.enum([
						"today",
						"this_week",
						"this_month",
						"last_month",
						"this_year",
					])
					.describe("Time period for analytics"),
				metrics: z
					.array(z.enum(["contact", "task", "company", "note"]))
					.optional()
					.describe("Specific metrics to retrieve"),
			}),
			execute: async ({ period, metrics }): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();
					const dateRange = getDateRangeForPeriod(period);
					const result: any = { period };

					const requestedMetrics = metrics || [
						"contact",
						"task",
						"company",
						"notes",
					];

					const promises = requestedMetrics.map(
						async (metric: any) => {
							switch (metric) {
								case "contact": {
									const [contactCount, contactsByStatus] =
										await Promise.all([
											db.contact.count({
												where: {
													organizationId,
													createdAt: dateRange,
													isDeleted: false,
												},
												cacheStrategy: { ttl: 300 },
											}),
											db.contact.groupBy({
												by: ["status"],
												where: {
													organizationId,
													createdAt: dateRange,
													isDeleted: false,
												},
												_count: { id: true },
												cacheStrategy: { ttl: 300 },
											}),
										]);

									return {
										metric: "contact",
										data: {
											total: contactCount,
											byStatus: contactsByStatus.reduce(
												(
													acc: Record<string, number>,
													item: any,
												) => {
													acc[item.status] =
														item._count.id;
													return acc;
												},
												{},
											),
										},
									};
								}

								case "task": {
									const taskStats = await db.task.groupBy({
										by: ["status"],
										where: {
											organizationId,
											createdAt: dateRange,
										},
										_count: { id: true },
										cacheStrategy: { ttl: 300 },
									});

									return {
										metric: "task",
										data: {
											total: taskStats.reduce(
												(sum: number, stat: any) =>
													sum + stat._count.id,
												0,
											),
											byStatus: taskStats.reduce(
												(
													acc: Record<string, number>,
													stat: any,
												) => {
													acc[stat.status] =
														stat._count.id;
													return acc;
												},
												{},
											),
										},
									};
								}

								case "company": {
									const companyCount = await db.company.count(
										{
											where: {
												organizationId,
												createdAt: dateRange,
												isDeleted: false,
											},
											cacheStrategy: { ttl: 300 },
										},
									);

									return {
										metric: "company",
										data: { total: companyCount },
									};
								}

								case "note": {
									const noteCount = await db.note.count({
										where: {
											orgId: organizationId, // Use orgId instead of organizationId for notes
											createdAt: dateRange,
											isDeleted: false,
										},
										cacheStrategy: { ttl: 300 },
									});

									return {
										metric: "note",
										data: { total: noteCount },
									};
								}

								default:
									return { metric, data: {} };
							}
						},
					);

					const metricResults = await Promise.all(promises);

					metricResults.forEach(
						({ metric, data }: { metric: any; data: any }) => {
							result[metric] = data;
						},
					);

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							...result,
							dateRange: {
								from: dateRange.gte,
								to: dateRange.lte || new Date(),
								description: getPeriodDescription(period),
							},
						},
						metadata: {
							executionTime,
							recordCount: Object.keys(result).length - 1, // Exclude 'period' field
							source: "analytics",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] getAnalytics error:", error);
					return {
						success: false,
						error: "Failed to retrieve analytics. Please try again.",
						metadata: { source: "analytics" },
					};
				}
			},
		}),

		getRecentActivity: tool({
			description: TOOL_SCHEMAS.getRecentActivity.description,
			parameters: z.object({
				limit: z
					.number()
					.min(1)
					.max(50)
					.default(10)
					.describe("Maximum number of activities to return"),
				type: z
					.enum([
						"contact_created",
						"task_created",
						"task_completed",
						"note_created",
						"company_created",
					])
					.optional()
					.describe("Filter by activity type"),
				userId: z
					.string()
					.optional()
					.describe("Filter activities by specific user"),
				period: z
					.enum([
						"today",
						"this_week",
						"this_month",
						"last_week",
						"last_month",
					])
					.optional()
					.describe("Filter by time period"),
			}),
			execute: async ({
				limit,
				type,
				userId: filterUserId,
				period,
			}): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();
					const activities: any[] = [];

					// Get date range for period filter
					let dateFilter: any = {};
					if (period) {
						const dateRange = getDateRangeForPeriod(period);
						dateFilter = { createdAt: dateRange };
					}

					// Define activity queries based on type filter
					const activityQueries = [];

					if (!type || type === "contact_created") {
						activityQueries.push(
							db.contact
								.findMany({
									where: {
										organizationId,
										isDeleted: false,
										...(filterUserId && {
											createdBy: filterUserId,
										}),
										...dateFilter,
									},
									select: {
										id: true,
										firstName: true,
										lastName: true,
										email: true,
										createdAt: true,
										createdBy: true,
										creator: { select: { name: true } },
									},
									orderBy: { createdAt: "desc" },
									take: limit,
									cacheStrategy: { ttl: 60 },
								})
								.then((results: any) =>
									results.map((item: any) => ({
										id: item.id,
										type: "contact_created",
										title: `New contact: ${item.firstName} ${item.lastName}`,
										description: item.email,
										createdAt: item.createdAt,
										createdBy: item.creator?.name,
										entityId: item.id,
									})),
								),
						);
					}

					if (!type || type === "task_created") {
						activityQueries.push(
							db.task
								.findMany({
									where: {
										organizationId,
										...(filterUserId && {
											createdBy: filterUserId,
										}),
										...dateFilter,
									},
									select: {
										id: true,
										title: true,
										priority: true,
										createdAt: true,
										createdBy: true,
										creator: { select: { name: true } },
									},
									orderBy: { createdAt: "desc" },
									take: limit,
									cacheStrategy: { ttl: 60 },
								})
								.then((results: any) =>
									results.map((item: any) => ({
										id: item.id,
										type: "task_created",
										title: `New task: ${item.title}`,
										description: `Priority: ${item.priority}`,
										createdAt: item.createdAt,
										createdBy: item.creator?.name,
										entityId: item.id,
									})),
								),
						);
					}

					if (!type || type === "task_completed") {
						activityQueries.push(
							db.task
								.findMany({
									where: {
										organizationId,
										status: "done",
										...(filterUserId && {
											assigneeId: filterUserId,
										}),
									},
									select: {
										id: true,
										title: true,
										updatedAt: true,
										assignee: { select: { name: true } },
									},
									orderBy: { updatedAt: "desc" },
									take: limit,
									cacheStrategy: { ttl: 60 },
								})
								.then((results: any) =>
									results.map((item: any) => ({
										id: item.id,
										type: "task_completed",
										title: `Completed: ${item.title}`,
										description: "Task marked as done",
										createdAt: item.updatedAt,
										createdBy: item.assignee?.name,
										entityId: item.id,
									})),
								),
						);
					}

					// Execute all queries and combine results
					const activityResults = await Promise.all(activityQueries);
					const allActivities = activityResults.flat();

					// Sort by date and limit
					const sortedActivities = allActivities
						.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						)
						.slice(0, limit);

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							activities: sortedActivities,
							totalFound: sortedActivities.length,
							filters: {
								type: type || "all",
								userId: filterUserId,
							},
						},
						metadata: {
							executionTime,
							recordCount: sortedActivities.length,
							source: "activities",
						},
					};
				} catch (error) {
					console.error(
						"[CRM Tools] getRecentActivity error:",
						error,
					);
					return {
						success: false,
						error: "Failed to retrieve recent activity. Please try again.",
						metadata: { source: "activities" },
					};
				}
			},
		}),

		createTask: tool({
			description: TOOL_SCHEMAS.createTask.description,
			parameters: z.object({
				title: z.string().min(1).max(200).describe("Title of the task"),
				description: z
					.string()
					.optional()
					.describe("Detailed description of the task"),
				priority: z
					.enum(["no_priority", "urgent", "high", "medium", "low"])
					.default("medium")
					.describe("Task priority level"),
				assigneeId: z
					.string()
					.optional()
					.describe("User ID to assign the task to"),
				dueDate: z
					.string()
					.optional()
					.describe("Due date in ISO format (YYYY-MM-DD)"),
			}),
			execute: async ({
				title,
				description,
				priority,
				assigneeId,
				dueDate,
			}): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();

					// Validate assignee exists in organization if provided
					if (assigneeId) {
						const assignee = await db.member.findFirst({
							where: {
								userId: assigneeId,
								organizationId,
							},
							include: {
								user: { select: { name: true, email: true } },
							},
						});

						if (!assignee) {
							return {
								success: false,
								error: "Assignee not found or not a member of this organization",
								metadata: { source: "tasks" },
							};
						}
					}

					// Parse and validate due date if provided
					let parsedDueDate: Date | undefined;
					if (dueDate) {
						parsedDueDate = new Date(dueDate);
						if (isNaN(parsedDueDate.getTime())) {
							return {
								success: false,
								error: "Invalid due date format. Please use YYYY-MM-DD format.",
								metadata: { source: "tasks" },
							};
						}
					}

					// Create the task
					const task = await db.task.create({
						data: {
							title,
							description: description || "",
							priority,
							status: "todo",
							organizationId,
							createdBy: userId,
							assigneeId: assigneeId || userId, // Default to creator if no assignee
							dueDate: parsedDueDate,
						},
						include: {
							assignee: {
								select: { name: true, email: true },
							},
							creator: {
								select: { name: true },
							},
						},
					});

					const executionTime = Date.now() - startTime;

					return {
						success: true,
						data: {
							task: {
								id: task.id,
								title: task.title,
								description: task.description,
								priority: task.priority,
								status: task.status,
								assignee: task.assignee
									? {
											name: task.assignee.name,
											email: task.assignee.email,
										}
									: null,
								creator: task.creator?.name,
								dueDate: task.dueDate,
								createdAt: task.createdAt,
							},
							message: `Task "${title}" created successfully${assigneeId ? ` and assigned to ${task.assignee?.name}` : ""}`,
						},
						metadata: {
							executionTime,
							recordCount: 1,
							source: "tasks",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] createTask error:", error);
					return {
						success: false,
						error: "Failed to create task. Please try again.",
						metadata: { source: "tasks" },
					};
				}
			},
		}),

		searchWeb: tool({
			description: TOOL_SCHEMAS.searchWeb.description,
			parameters: z.object({
				queries: z
					.array(z.string())
					.min(1)
					.max(5)
					.describe("Array of search queries to look up on the web"),
			}),
			execute: async ({ queries }): Promise<CRMToolResult> => {
				try {
					const startTime = Date.now();

					const serperApiKey = process.env.SERPER_API_KEY;
					if (!serperApiKey) {
						return {
							success: false,
							error: "Web search is not configured. Please add SERPER_API_KEY environment variable.",
							metadata: { source: "web_search" },
						};
					}

					const searchPromises = queries.map(async (query, index) => {
						// Add delay between requests to avoid rate limiting
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * index),
						);

						const searchParams = new URLSearchParams({
							q: query,
							apiKey: serperApiKey,
						});

						const response = await fetch(
							`https://google.serper.dev/search?${searchParams}`,
							{
								method: "GET",
								headers: {
									"X-API-KEY": serperApiKey,
									"Content-Type": "application/json",
								},
							},
						);

						if (!response.ok) {
							console.error(
								`[CRM Tools] Serper API error for query "${query}":`,
								response.status,
								response.statusText,
							);
							return {
								query,
								results: [],
								error: `Search failed: ${response.status}`,
							};
						}

						const data = await response.json();

						return {
							query: data.searchParameters?.q || query,
							results: (data.organic || [])
								.slice(0, 6)
								.map((result: any) => ({
									url: result.link,
									title: result.title,
									content:
										result.snippet ||
										result.description ||
										"",
								})),
						};
					});

					const searchResults = await Promise.all(searchPromises);
					const executionTime = Date.now() - startTime;

					const totalResults = searchResults.reduce(
						(acc, search) => acc + search.results.length,
						0,
					);

					return {
						success: true,
						data: {
							searches: searchResults,
							totalQueries: queries.length,
							totalResults,
							searchEngine: "Serper/Google",
						},
						metadata: {
							executionTime,
							recordCount: totalResults,
							source: "web_search",
						},
					};
				} catch (error) {
					console.error("[CRM Tools] searchWeb error:", error);
					return {
						success: false,
						error: "Failed to search the web. Please try again.",
						metadata: { source: "web_search" },
					};
				}
			},
		}),
	};
}

function getDateRangeForPeriod(period: string) {
	const now = new Date();
	const startOfDay = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);

	switch (period) {
		case "today":
			return { gte: startOfDay };

		case "this_week": {
			const startOfWeek = new Date(startOfDay);
			startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
			return { gte: startOfWeek };
		}

		case "this_month": {
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			return { gte: startOfMonth };
		}

		case "last_week": {
			const startOfLastWeek = new Date(startOfDay);
			startOfLastWeek.setDate(
				startOfDay.getDate() - startOfDay.getDay() - 7,
			);
			const endOfLastWeek = new Date(startOfLastWeek);
			endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
			endOfLastWeek.setHours(23, 59, 59, 999);
			return { gte: startOfLastWeek, lte: endOfLastWeek };
		}

		case "last_month": {
			const startOfLastMonth = new Date(
				now.getFullYear(),
				now.getMonth() - 1,
				1,
			);
			const endOfLastMonth = new Date(
				now.getFullYear(),
				now.getMonth(),
				0,
			);
			return { gte: startOfLastMonth, lte: endOfLastMonth };
		}

		case "this_year": {
			const startOfYear = new Date(now.getFullYear(), 0, 1);
			return { gte: startOfYear };
		}

		default:
			return { gte: startOfDay };
	}
}

function getPeriodDescription(period: string): string {
	switch (period) {
		case "today":
			return "Today";
		case "this_week":
			return "This Week";
		case "this_month":
			return "This Month";
		case "last_month":
			return "Last Month";
		case "this_year":
			return "This Year";
		default:
			return "Today";
	}
}
