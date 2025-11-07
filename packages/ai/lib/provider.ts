import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export const AI_MODELS = {
	// OpenAI Models
	"gpt-4o": {
		provider: openai("gpt-4o"),
		name: "GPT-4o",
		description: "Most capable OpenAI model for complex reasoning",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 128000,
		costTier: "premium",
	},
	"gpt-4o-nano": {
		provider: openai("gpt-4o-nano"),
		name: "GPT-4o Nano",
		description: "Faster, cost-effective model for most tasks",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 128000,
		costTier: "standard",
	},
	"gpt-4o-mini": {
		provider: openai("gpt-4o-mini"),
		name: "GPT-4o Mini",
		description: "Faster, cost-effective model for most tasks",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 128000,
		costTier: "standard",
	},
	"gpt-4-turbo": {
		provider: openai("gpt-4-turbo"),
		name: "GPT-4 Turbo",
		description: "Advanced reasoning with latest training data",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 128000,
		costTier: "premium",
	},

	// Anthropic Models
	"claude-3-5-sonnet": {
		provider: anthropic("claude-3-5-sonnet-20241022"),
		name: "Claude 3.5 Sonnet",
		description: "Anthropic's most capable model for complex tasks",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 200000,
		costTier: "premium",
	},
	"claude-3-haiku": {
		provider: anthropic("claude-3-haiku-20240307"),
		name: "Claude 3 Haiku",
		description: "Fast and efficient for everyday tasks",
		capabilities: ["text", "vision", "tools"],
		maxTokens: 200000,
		costTier: "standard",
	},
} as const;

export type ModelKey = keyof typeof AI_MODELS;

// Default models for different use cases
export const DEFAULT_MODELS = {
	chat: "gpt-4o-mini" as ModelKey,
	analysis: "claude-3-5-sonnet" as ModelKey,
	fast: "gpt-4o-mini" as ModelKey,
	premium: "gpt-4o" as ModelKey,
} as const;

export function getModel(modelKey: ModelKey = DEFAULT_MODELS.chat) {
	const model = AI_MODELS[modelKey];
	if (!model) {
		throw new Error(`Model "${modelKey}" not found`);
	}
	return model.provider;
}

export function getModelInfo(modelKey: ModelKey) {
	return AI_MODELS[modelKey];
}

export function getAvailableModels() {
	return Object.entries(AI_MODELS).map(([key, model]) => ({
		key: key as ModelKey,
		name: model.name,
		description: model.description,
		capabilities: model.capabilities,
		costTier: model.costTier,
	}));
}

// Model selection based on requirements
export function selectOptimalModel(requirements: {
	complexity?: "low" | "medium" | "high";
	speed?: "fast" | "balanced" | "thorough";
	costSensitive?: boolean;
	needsVision?: boolean;
}): ModelKey {
	const {
		complexity = "medium",
		speed = "balanced",
		costSensitive = false,
		needsVision = false,
	} = requirements;

	// Cost-sensitive selection
	if (costSensitive) {
		return needsVision ? "gpt-4o-mini" : "claude-3-haiku";
	}

	// Speed-first selection
	if (speed === "fast") {
		return "gpt-4o-mini";
	}

	// Complexity-based selection
	if (complexity === "high") {
		return "claude-3-5-sonnet";
	}

	if (complexity === "low") {
		return "gpt-4o-mini";
	}

	// Default balanced selection
	return DEFAULT_MODELS.chat;
}

// Legacy exports for backward compatibility
export const textModel = getModel("gpt-4o-mini");
export const premiumTextModel = getModel("gpt-4o");
export const analysisModel = getModel("claude-3-5-sonnet");
