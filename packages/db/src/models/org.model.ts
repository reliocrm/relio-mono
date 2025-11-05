import mongoose from "mongoose";

const { Schema, model } = mongoose;

const organizationSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		slug: { type: String, unique: true, sparse: true },
		logo: { type: String },
		createdAt: { type: Date, required: true },
		metadata: { type: String },
		paymentsCustomerId: { type: String },
		emailWatermarkEnabled: { type: Boolean, default: true },
	},
	{
		collection: "organization",
		indexes: [
			{ fields: { slug: 1 }, options: { unique: true, sparse: true } }
		]
	}
);

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
	{ collection: "invitation" }
);

const memberSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		role: { type: String, required: true },
		invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "member",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { userId: 1, organizationId: 1 }, options: { unique: true } }
		]
	}
);

const userOrganizationCreditsSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		creditsTotal: { type: Number, default: 10 },
		creditsUsed: { type: Number, default: 0 },
		creditsResetAt: { type: Date, default: () => new Date() },
		creditsPurchased: { type: Number, default: 0 },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "user_organization_credits",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { organizationId: 1, userId: 1 } },
			{ fields: { userId: 1, organizationId: 1 }, options: { unique: true } }
		]
	}
);

const purchaseSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
		userId: { type: Schema.Types.ObjectId, ref: "User" },
		type: { type: String, required: true },
		customerId: { type: String, required: true },
		subscriptionId: { type: String },
		productId: { type: String, required: true },
		status: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{ 
		collection: "purchase",
		indexes: [
			{ fields: { subscriptionId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { userId: 1 } },
			{ fields: { organizationId: 1, createdAt: 1 } },
			{ fields: { userId: 1, createdAt: 1 } }
		]
	},
);

const creditPurchaseSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
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
		]
	},
);

const forwardedEmailSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		messageId: { type: String, required: true, unique: true },
		from: { type: String, required: true },
		to: { type: String, required: true },
		subject: { type: String, required: true },
		body: { type: String, required: true },
		attachments: { type: Schema.Types.Mixed },
		headers: { type: Schema.Types.Mixed },
		participants: [{ type: String }],
		processedAt: { type: Date },
		linkedRecords: { type: Schema.Types.Mixed },
		forwardedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		sharingLevel: { type: String, default: "full" },
		isBlocked: { type: Boolean, default: false },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "forwarded_email",
		indexes: [
			{ fields: { organizationId: 1 } },
			{ fields: { organizationId: 1, from: 1 } },
			{ fields: { organizationId: 1, createdAt: 1 } },
			{ fields: { messageId: 1 }, options: { unique: true } },
		]
	}
);

const forwardingEmailConfigSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, unique: true },
		address: { type: String, required: true },
		isActive: { type: Boolean, default: true },
		defaultSharingLevel: { type: String, default: "full" },
		individualSharing: { type: Schema.Types.Mixed },
		blockedEmails: [{ type: String, default: [] }],
		blockedDomains: [{ type: String, default: [] }],
		autoCreateContacts: { type: Boolean, default: true },
		autoCreateCompanies: { type: Boolean, default: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "forwarding_email_config",
		indexes: [
			{ fields: { organizationId: 1 }, options: { unique: true } }
		]
	}
);

const Organization = model("Organization", organizationSchema);
const Invitation = model("Invitation", invitationSchema);
const Member = model("Member", memberSchema);
const UserOrganizationCredits = model("UserOrganizationCredits", userOrganizationCreditsSchema);
const Purchase = model("Purchase", purchaseSchema);
const CreditPurchase = model("CreditPurchase", creditPurchaseSchema);
const ForwardedEmail = model("ForwardedEmail", forwardedEmailSchema);
const ForwardingEmailConfig = model("ForwardingEmailConfig", forwardingEmailConfigSchema);

export { Organization, Invitation, Member, UserOrganizationCredits, Purchase, CreditPurchase, ForwardedEmail, ForwardingEmailConfig };


