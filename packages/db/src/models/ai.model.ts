import mongoose from "mongoose";
import { ModelCapabilityEnum, ModelProviderEnum } from "../lib/types";

const { Schema, model } = mongoose;

const aiUsageSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
		chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
		feature: { type: String, required: true },
		activity: { type: String },
		creditsUsed: { type: Number, required: true },
		promptTokens: { type: Number },
		completionTokens: { type: Number },
		toolCalls: { type: Number, default: 0 },
		model: { type: String, default: "gpt-4" },
		success: { type: Boolean, default: true },
		error: { type: String },
		metadata: { type: Schema.Types.Mixed },
		createdAt: { type: Date, default: () => new Date() },
	},
	{
		collection: "ai_usage",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { organizationId: 1, createdAt: 1 } },
			{ fields: { organizationId: 1, feature: 1 } },
			{ fields: { userId: 1, createdAt: 1 } }
		]
	}
);

const modelSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		model: { type: String, required: true },
		provider: { type: String, enum: ModelProviderEnum, required: true },
		searchField: { type: String, required: true },
		icon: { type: String, required: true },

		capabilities: { type: [String], enum: ModelCapabilityEnum, default: [] },
		description: { type: String, required: true },
		isPremium: { type: Boolean, default: false },
		isDisabled: { type: Boolean, default: false },
		cost: { type: Number, default: 0 },

		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "model",
		indexes: [
			{ fields: { name: 1 } },
			{ fields: { model: 1 } },
			{ fields: { provider: 1 } },
			{ fields: { isPremium: 1 } },
			{ fields: { isDisabled: 1 } },
			{ fields: { model: 1, provider: 1 }, options: { unique: true } }
		]
	}
);

const creditPurchaseSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
        purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase" },
        packageId: { type: String, required: true },
        credits: { type: Number, required: true },
        price: { type: Number, required: true },
        stripePaymentIntentId: { type: String },
        status: { type: String, default: "pending" },
        createdAt: { type: Date, default: () => new Date() },
        updatedAt: { type: Date },
    },
    {
        collection: "credit_purchases",
        indexes: [
            { fields: { userId: 1 } },
            { fields: { organizationId: 1 } },
            { fields: { purchaseId: 1 } },
            { fields: { status: 1 } },
            { fields: { createdAt: 1 } },
        ],
    }
);

const AiUsage = model("AiUsage", aiUsageSchema);
const ModelDef = model("Model", modelSchema);
const CreditPurchase = model("CreditPurchase", creditPurchaseSchema);

export { AiUsage, ModelDef, CreditPurchase };


