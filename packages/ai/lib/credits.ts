import type { UserOrganizationCredits } from "@prisma/client";

export interface CreditsContext {
	db: any; // Using any to avoid type conflicts with extended Prisma client
	userId: string;
	organizationId: string;
}

/**
 * Get or create user credits for a specific organization
 */
export async function getOrCreateUserOrgCredits(
	db: any,
	userId: string,
	organizationId: string,
): Promise<UserOrganizationCredits> {
	let userOrgCredits = await db.userOrganizationCredits.findUnique({
		where: {
			userId_organizationId: {
				userId,
				organizationId,
			},
		},
	});

	if (!userOrgCredits) {
		userOrgCredits = await db.userOrganizationCredits.create({
			data: {
				userId,
				organizationId,
				creditsTotal: 10,
				creditsUsed: 0,
				creditsResetAt: new Date(),
				creditsPurchased: 0,
			},
		});
	}

	return userOrgCredits;
}

/**
 * Check if user has enough credits to perform an action within an organization
 * Checks both monthly credits and purchased credits
 */
export async function checkUserCredits(
	db: any,
	userId: string,
	organizationId: string,
	requiredCredits: number,
): Promise<boolean> {
	const userOrgCredits = await getOrCreateUserOrgCredits(
		db,
		userId,
		organizationId,
	);

	// Check if user needs credit reset (daily for free users)
	const now = new Date();
	const resetDate = new Date(userOrgCredits.creditsResetAt);
	const daysSinceReset =
		(now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

	// Reset credits if it's been more than 1 day
	if (daysSinceReset >= 1) {
		return true; // Will be reset in the next function call
	}

	// Calculate total available credits (monthly + purchased)
	const creditsTotal = userOrgCredits.creditsTotal || 10;
	const creditsUsed = userOrgCredits.creditsUsed || 0;
	const monthlyAvailable = creditsTotal - creditsUsed;
	const purchasedAvailable = userOrgCredits.creditsPurchased || 0;
	const totalAvailable = monthlyAvailable + purchasedAvailable;

	return totalAvailable >= requiredCredits;
}

/**
 * Get user's credits status for a specific organization including purchased credits
 */
export async function getUserCreditsStatus(
	db: any,
	userId: string,
	organizationId: string,
) {
	const userOrgCredits = await getOrCreateUserOrgCredits(
		db,
		userId,
		organizationId,
	);

	const now = new Date();
	const resetDate = new Date(userOrgCredits.creditsResetAt);
	const daysSinceReset =
		(now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);
	const hoursUntilReset = Math.max(0, 24 - Math.floor(daysSinceReset * 24));

	const creditsTotal = userOrgCredits.creditsTotal || 10;
	const creditsUsed = userOrgCredits.creditsUsed || 0;
	const dailyAvailable = Math.max(0, creditsTotal - creditsUsed);
	const purchasedAvailable = userOrgCredits.creditsPurchased || 0;
	const totalCredits = creditsTotal + purchasedAvailable;
	const totalUsed = creditsUsed;
	const totalRemaining = dailyAvailable + purchasedAvailable;

	return {
		total: totalCredits,
		used: totalUsed,
		remaining: totalRemaining,
		dailyCredits: {
			total: creditsTotal,
			used: creditsUsed,
			remaining: dailyAvailable,
		},
		purchasedCredits: {
			total: purchasedAvailable,
			remaining: purchasedAvailable, // Purchased credits don't get "used" in the same way
		},
		resetDate: new Date(resetDate.getTime() + 24 * 60 * 60 * 1000), // Next day
		hoursUntilReset,
		needsReset: daysSinceReset >= 1,
	};
}

/**
 * Deduct credits from user account for a specific organization
 * First deducts from monthly credits, then from purchased credits
 */
export async function deductUserCredits(
	db: any,
	userId: string,
	organizationId: string,
	creditsToDeduct: number,
): Promise<void> {
	let userOrgCredits = await getOrCreateUserOrgCredits(
		db,
		userId,
		organizationId,
	);

	// Reset daily credits if needed
	const now = new Date();
	const resetDate = new Date(userOrgCredits.creditsResetAt);
	const daysSinceReset =
		(now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

	if (daysSinceReset >= 1) {
		userOrgCredits = await resetUserCredits(db, userId, organizationId);
	}

	// Calculate how many credits to deduct from daily vs purchased
	const creditsTotal = userOrgCredits.creditsTotal || 10;
	const creditsUsed = userOrgCredits.creditsUsed || 0;
	const dailyAvailable = Math.max(0, creditsTotal - creditsUsed);
	const dailyDeduction = Math.min(creditsToDeduct, dailyAvailable);
	const purchasedDeduction = Math.max(0, creditsToDeduct - dailyDeduction);

	// Update user credits
	await db.userOrganizationCredits.update({
		where: {
			userId_organizationId: {
				userId,
				organizationId,
			},
		},
		data: {
			creditsUsed: creditsUsed + dailyDeduction,
			creditsPurchased: Math.max(
				0,
				(userOrgCredits.creditsPurchased || 0) - purchasedDeduction,
			),
		},
	});
}

/**
 * Add purchased credits to user account for a specific organization
 */
export async function addPurchasedCredits(
	db: any,
	userId: string,
	organizationId: string,
	credits: number,
): Promise<void> {
	const userOrgCredits = await getOrCreateUserOrgCredits(
		db,
		userId,
		organizationId,
	);

	await db.userOrganizationCredits.update({
		where: {
			userId_organizationId: {
				userId,
				organizationId,
			},
		},
		data: {
			creditsPurchased: {
				increment: credits,
			},
		},
	});
}

/**
 * Reset user's daily credits for a specific organization
 */
export async function resetUserCredits(
	db: any,
	userId: string,
	organizationId: string,
	creditAmount = 10,
): Promise<UserOrganizationCredits> {
	return await db.userOrganizationCredits.upsert({
		where: {
			userId_organizationId: {
				userId,
				organizationId,
			},
		},
		update: {
			creditsTotal: creditAmount,
			creditsUsed: 0,
			creditsResetAt: new Date(),
		},
		create: {
			userId,
			organizationId,
			creditsTotal: creditAmount,
			creditsUsed: 0,
			creditsResetAt: new Date(),
			creditsPurchased: 0,
		},
	});
}

/**
 * Reset credits for all users in all organizations (for cron jobs)
 */
export async function resetAllUserCredits(
	db: any,
): Promise<{ resetCount: number }> {
	// Get all user-org credit records that need reset (1+ days since last reset)
	const oneDayAgo = new Date();
	oneDayAgo.setDate(oneDayAgo.getDate() - 1);

	const creditsToReset = await db.userOrganizationCredits.findMany({
		where: {
			creditsResetAt: {
				lte: oneDayAgo,
			},
		},
	});

	let resetCount = 0;

	for (const userOrgCredit of creditsToReset) {
		await resetUserCredits(
			db,
			userOrgCredit.userId,
			userOrgCredit.organizationId,
			10,
		);
		resetCount++;
	}

	return { resetCount };
}

/**
 * Calculate model cost based on usage
 */
export function calculateModelCost(
	model: string,
	promptTokens: number,
	completionTokens: number,
	toolCalls = 0,
): number {
	// Base costs per 1000 tokens (adjust these based on your pricing)
	const costs = {
		"gpt-4": { prompt: 0.03, completion: 0.06 },
		"gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
		"gpt-3.5-turbo": { prompt: 0.001, completion: 0.002 },
	};

	const modelCosts = costs[model as keyof typeof costs] || costs["gpt-4"];

	const promptCost = (promptTokens / 1000) * modelCosts.prompt;
	const completionCost = (completionTokens / 1000) * modelCosts.completion;
	const toolCost = toolCalls * 0.01; // 1 cent per tool call

	// Convert to credits (e.g., 1 cent = 1 credit)
	return Math.ceil((promptCost + completionCost + toolCost) * 100);
}

/**
 * Track AI usage in the database
 */
export async function trackAiUsage(
	db: any,
	params: {
		userId: string;
		organizationId?: string;
		chatId?: string;
		feature: string; // "data_chat", "task_creation", "analytics", "general_chat"
		activity?: string; // Specific activity description
		creditsUsed: number;
		promptTokens?: number;
		completionTokens?: number;
		toolCalls?: number;
		model?: string;
		success?: boolean;
		error?: string;
		metadata?: any;
	},
): Promise<void> {
	await db.aiUsage.create({
		data: {
			userId: params.userId,
			organizationId: params.organizationId,
			chatId: params.chatId,
			feature: params.feature,
			activity: params.activity,
			creditsUsed: params.creditsUsed,
			promptTokens: params.promptTokens,
			completionTokens: params.completionTokens,
			toolCalls: params.toolCalls || 0,
			model: params.model || "gpt-4",
			success: params.success !== false, // Default to true unless explicitly false
			error: params.error,
			metadata: params.metadata,
			createdAt: new Date(),
		},
	});
}

/**
 * Get credit limits for different plans
 */
export function getCreditLimitsForPlan(planType = "free") {
	switch (planType) {
		case "professional":
			return {
				daily: 50,
				monthly: 1000,
			};
		case "enterprise":
			return {
				daily: 100,
				monthly: 2000,
			};
		default:
			return {
				daily: 10,
				monthly: 200,
			};
	}
}
