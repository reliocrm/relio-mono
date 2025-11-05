import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		emailVerified: { type: Boolean, required: true },
		image: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
		username: { type: String },
		role: { type: String },
		banned: { type: Boolean },
		banReason: { type: String },
		banExpires: { type: Date },
		onboardingComplete: { type: Boolean, default: false },
		paymentsCustomerId: { type: String },
		locale: { type: String },

		sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
		accounts: [{ type: Schema.Types.ObjectId, ref: "Account" }],
		passkeys: [{ type: Schema.Types.ObjectId, ref: "Passkey" }],
		invitations: [{ type: Schema.Types.ObjectId, ref: "Invitation" }],
		purchases: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
		memberships: [{ type: Schema.Types.ObjectId, ref: "Member" }],
		invitedMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
		feedbacks: [{ type: Schema.Types.ObjectId, ref: "Feedback" }],
		createdTasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
		assignedTasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
		objectStatusHistories: [{ type: Schema.Types.ObjectId, ref: "ObjectStatusHistory" }],
		favorites: [{ type: Schema.Types.ObjectId, ref: "Favorite" }],
		favoriteFolders: [{ type: Schema.Types.ObjectId, ref: "FavoriteFolder" }],
		notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
		notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],

		createdCustomObjects: [{ type: Schema.Types.ObjectId, ref: "CustomObject" }],
		viewedCustomObjects: [{ type: Schema.Types.ObjectId, ref: "CustomObject" }],
		deletedCustomObjects: [{ type: Schema.Types.ObjectId, ref: "CustomObject" }],

		createdContacts: [{ type: Schema.Types.ObjectId, ref: "Contact" }],
		updatedContacts: [{ type: Schema.Types.ObjectId, ref: "Contact" }],
		viewedContacts: [{ type: Schema.Types.ObjectId, ref: "Contact" }],
		deletedContacts: [{ type: Schema.Types.ObjectId, ref: "Contact" }],
		createdRelatedContacts: [{ type: Schema.Types.ObjectId, ref: "RelatedContact" }],

		createdCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
		updatedCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
		deletedCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],

		createdProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
		updatedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
		viewedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
		deletedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],

		createdLinkedProperties: [{ type: Schema.Types.ObjectId, ref: "LinkedProperty" }],
		updatedLinkedProperties: [{ type: Schema.Types.ObjectId, ref: "LinkedProperty" }],

		createdLinkedContacts: [{ type: Schema.Types.ObjectId, ref: "LinkedContact" }],
		updatedLinkedContacts: [{ type: Schema.Types.ObjectId, ref: "LinkedContact" }],

		createdObjectRelationships: [{ type: Schema.Types.ObjectId, ref: "ObjectRelationship" }],
		updatedObjectRelationships: [{ type: Schema.Types.ObjectId, ref: "ObjectRelationship" }],

		createdTags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
		tagPermissions: [{ type: Schema.Types.ObjectId, ref: "TagPermission" }],
		addedObjectTags: [{ type: Schema.Types.ObjectId, ref: "ObjectTag" }],

		createdLists: [{ type: Schema.Types.ObjectId, ref: "List" }],
		listPermissions: [{ type: Schema.Types.ObjectId, ref: "ListPermission" }],
		addedListItems: [{ type: Schema.Types.ObjectId, ref: "ListItem" }],

		createdObjectViews: [{ type: Schema.Types.ObjectId, ref: "ObjectView" }],
		userViewPreferences: [{ type: Schema.Types.ObjectId, ref: "UserViewPreference" }],

		pins: [{ type: Schema.Types.ObjectId, ref: "Pin" }],

		modelId: { type: Schema.Types.ObjectId, ref: "Model" },
		selectedModel: { type: Schema.Types.ObjectId, ref: "Model" },

		preferences: { type: Schema.Types.Mixed },
		appearance: { type: Schema.Types.Mixed },

		creditPurchases: [{ type: Schema.Types.ObjectId, ref: "CreditPurchase" }],
		aiUsage: [{ type: Schema.Types.ObjectId, ref: "AiUsage" }],
		chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
		messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
		userOrgCredits: [{ type: Schema.Types.ObjectId, ref: "UserOrganizationCredits" }],
		forwardedEmails: [{ type: Schema.Types.ObjectId, ref: "ForwardedEmail" }],
		emailActivities: [{ type: Schema.Types.ObjectId, ref: "EmailActivity" }],
		activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
		activityReplies: [{ type: Schema.Types.ObjectId, ref: "ActivityReply" }],
		activityReactions: [{ type: Schema.Types.ObjectId, ref: "ActivityReaction" }],
		resolvedActivities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
		notificationSettings: { type: Schema.Types.ObjectId, ref: "NotificationSettings" },

		createdFolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
		updatedFolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
		deletedFolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
		uploadedFiles: [{ type: Schema.Types.ObjectId, ref: "File" }],
		updatedFiles: [{ type: Schema.Types.ObjectId, ref: "File" }],
		accessedFiles: [{ type: Schema.Types.ObjectId, ref: "File" }],
		deletedFiles: [{ type: Schema.Types.ObjectId, ref: "File" }],
		folderPermissions: [{ type: Schema.Types.ObjectId, ref: "FolderPermission" }],
		filePermissions: [{ type: Schema.Types.ObjectId, ref: "FilePermission" }],
		fileAttachments: [{ type: Schema.Types.ObjectId, ref: "FileAttachment" }],
		googleDriveIntegrations: [{ type: Schema.Types.ObjectId, ref: "GoogleDriveIntegration" }],
	},
	{
		collection: "user",
		indexes: [
			{ fields: { email: 1 } },
			{ fields: { username: 1 } },
			{ fields: { role: 1 } },
			{ fields: { banned: 1 } },
			{ fields: { onboardingComplete: 1 } },
		]
	}
);

const sessionSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		expiresAt: { type: Date, required: true },
		ipAddress: { type: String },
		userAgent: { type: String },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		impersonatedBy: { type: String },
		activeOrganizationId: { type: Schema.Types.ObjectId },
		token: { type: String, required: true, unique: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{
		collection: "session",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { activeOrganizationId: 1 } },
			{ fields: { token: 1 } },
			{ fields: { createdAt: 1 } }
		]
	}
);

const accountSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		accountId: { type: String, required: true },
		providerId: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		accessToken: { type: String },
		refreshToken: { type: String },
		idToken: { type: String },
		expiresAt: { type: Date },
		password: { type: String },
		accessTokenExpiresAt: { type: Date },
		refreshTokenExpiresAt: { type: Date },
		scope: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "account",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { accountId: 1 } },
			{ fields: { providerId: 1 } },
			{ fields: { createdAt: 1 } }
		]
	}
);


const verificationSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		identifier: { type: String, required: true },
		value: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{ collection: "verification" },
);


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
	{ collection: "passkey",
		indexes: [
			{ fields: { userId: 1 } },
			{ fields: { credentialID: 1 } },
			{ fields: { createdAt: 1 } }
		]
	}
);

const User = model("User", userSchema);
const Session = model("Session", sessionSchema);
const Account = model("Account", accountSchema);
const Verification = model("Verification", verificationSchema);
const Passkey = model("Passkey", passkeySchema);

export { User, Session, Account, Verification, Passkey };
