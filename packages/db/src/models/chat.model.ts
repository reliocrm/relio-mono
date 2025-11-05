import mongoose from "mongoose";
import { ChatStatusEnum, ToolEnum } from "../lib/types";
const { Schema, model } = mongoose;

const chatSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		title: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
		isPublic: { type: Boolean, required: true },
		status: { type: String, enum: ChatStatusEnum, required: true },
		lastMessageTimestamp: { type: Date, required: true },
		branchId: { type: Schema.Types.ObjectId, ref: "Chat" },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "chat",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { userId: 1, lastMessageTimestamp: 1 } },
			{ fields: { organizationId: 1, userId: 1 } },
			{ fields: { organizationId: 1, createdAt: 1 } },
		]
	}
);

const messageSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		prompt: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
		modelId: { type: Schema.Types.ObjectId, ref: "Model", required: true },
		uiMessages: { type: String },
		responseStreamId: { type: String, required: true },
		tool: { type: String, enum: ToolEnum },
		error: { type: Schema.Types.Mixed },
		content: { type: String },
		searchContent: { type: String },
		promptTokens: { type: Number },
		completionTokens: { type: Number },
		totalTokens: { type: Number },
		creditsSpent: { type: Number },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "message",
		indexes: [
			{ fields: { chatId: 1 } },
			{ fields: { responseStreamId: 1 } },
			{ fields: { searchContent: 1 } },
			{ fields: { userId: 1 } },
			{ fields: { userId: 1, createdAt: 1 } },
			{ fields: { tool: 1 } }
		]
	}
);

const Chat = model("Chat", chatSchema);
const Message = model("Message", messageSchema);

export { Chat, Message };


