import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Passkey
const passkeySchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String },
		publicKey: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		credentialID: { type: String, required: true },
		counter: { type: Number, required: true },
		deviceType: { type: String, required: true },
		backedUp: { type: Boolean, required: true },
		transports: { type: String },
		createdAt: { type: Date },
	},
	{ collection: "passkey" },
);

// Organization
const organizationSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		slug: { type: String },
		logo: { type: String },
		createdAt: { type: Date, required: true },
		metadata: { type: String },
		paymentsCustomerId: { type: String },
	},
	{ collection: "organization" },
);
organizationSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Member
const memberSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		role: { type: String, required: true },
		createdAt: { type: Date, required: true },
	},
	{ collection: "member" },
);
memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

// Invitation
const invitationSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		email: { type: String, required: true },
		role: { type: String },
		status: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		inviterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ collection: "invitation" },
);

// Purchase
const purchaseSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
		userId: { type: Schema.Types.ObjectId, ref: "User" },
		type: { type: String, enum: ["SUBSCRIPTION", "ONE_TIME"], required: true },
		customerId: { type: String, required: true },
		subscriptionId: { type: String },
		productId: { type: String, required: true },
		status: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date, default: () => new Date() },
	},
	{ collection: "purchase" },
);
purchaseSchema.index({ subscriptionId: 1 }, { unique: true, sparse: true });
purchaseSchema.pre("save", function (next) {
	(this as any).updatedAt = new Date();
	next();
});

// AiChat
const aiMessageSchema = new Schema(
	{
		role: { type: String, enum: ["user", "assistant"], required: true },
		content: { type: String, required: true },
	},
	{ _id: false },
);

const aiChatSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
		userId: { type: Schema.Types.ObjectId, ref: "User" },
		title: { type: String },
		messages: { type: [aiMessageSchema], default: [] },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date, default: () => new Date() },
	},
	{ collection: "ai_chat" },
);
aiChatSchema.pre("save", function (next) {
	(this as any).updatedAt = new Date();
	next();
});

const Passkey = model("Passkey", passkeySchema);
const Organization = model("Organization", organizationSchema);
const Member = model("Member", memberSchema);
const Invitation = model("Invitation", invitationSchema);
const Purchase = model("Purchase", purchaseSchema);
const AiChat = model("AiChat", aiChatSchema);

export { Passkey, Organization, Member, Invitation, Purchase, AiChat };


