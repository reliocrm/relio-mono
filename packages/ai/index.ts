// Core AI providers and models

// Re-export AI SDK and React components
export * from "ai";
export * from "./lib";
// Prompts and context
// Legacy exports for backward compatibility
export {
	getCRMAnalysisPrompt,
	getDataInsightsPrompt,
	getFollowUpQuestionsPrompt,
	getSearchOptimizationPrompt,
	getSystemPrompt,
	getTaskCreationPrompt,
	type PromptContext,
	promptListProductNames,
} from "./lib/prompts";
export {
	AI_MODELS,
	analysisModel,
	DEFAULT_MODELS,
	getAvailableModels,
	getModel,
	getModelInfo,
	type ModelKey,
	premiumTextModel,
	selectOptimalModel,
	textModel,
} from "./lib/provider";
export {
	AVAILABLE_TOOLS,
	TOOL_SCHEMAS,
	type ToolName,
} from "./lib/schema";
// Tool system
export {
	type CRMToolResult,
	createCRMTools,
	type ToolContext,
} from "./lib/tools";
export {
	addPurchasedCredits,
	calculateModelCost,
	checkUserCredits,
	deductUserCredits,
	getUserCreditsStatus,
	trackAiUsage,
} from "./lib/credits";

// Image and audio models (legacy)
import { openai } from "@ai-sdk/openai";
export const imageModel = openai("dall-e-3");
export const audioModel = openai("whisper-1");
